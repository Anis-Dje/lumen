<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final class OrderProcessingService
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly FidelityEngineService $fidelityEngine,
    ) {}

    public function processCheckout(User $user, array $shippingData, int $fidelityPointsToRedeem = 0): Order
    {
        $cartItems = $this->cartService->getItems($user, null);

        if ($cartItems->isEmpty()) {
            throw new RuntimeException('Cart is empty. Cannot process checkout.');
        }

        /** @var Order $order */
        $order = DB::transaction(function () use ($user, $shippingData, $fidelityPointsToRedeem, $cartItems): Order {
            $variantIds = $cartItems->pluck('product_variant_id')->toArray();

            $lockedVariants = ProductVariant::whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cartItems as $cartItem) {
                $lockedVariant = $lockedVariants->get($cartItem->product_variant_id);

                if ($lockedVariant === null || $lockedVariant->stock < $cartItem->quantity) {
                    throw new InsufficientStockException(
                        variantName: $lockedVariant?->name ?? 'Unknown variant',
                        availableStock: $lockedVariant?->stock ?? 0,
                    );
                }
            }

            $subtotal = 0.0;
            foreach ($cartItems as $cartItem) {
                $variant = $lockedVariants->get($cartItem->product_variant_id);
                $subtotal += (float) $variant->price * $cartItem->quantity;
            }
            $subtotal = round($subtotal, 2);

            $fidelityDiscount = 0.0;
            if ($fidelityPointsToRedeem > 0) {
                $availableBalance = $this->fidelityEngine->getBalance($user);

                if ($availableBalance < $fidelityPointsToRedeem) {
                    throw new RuntimeException(
                        "Insufficient fidelity points. Available: {$availableBalance}, requested: {$fidelityPointsToRedeem}"
                    );
                }

                $fidelityDiscount = $this->fidelityEngine->calculateDiscount($fidelityPointsToRedeem);
            }

            $taxableAmount = max(0, $subtotal - $fidelityDiscount);
            $tax = round($taxableAmount * 0.0825, 2);
            $total = round($subtotal - $fidelityDiscount + $tax, 2);

            $order = Order::create([
                'user_id' => $user->id,
                'status' => OrderStatus::Pending,
                'subtotal' => $subtotal,
                'fidelity_discount' => $fidelityDiscount,
                'tax' => $tax,
                'total' => $total,
                'fidelity_points_redeemed' => $fidelityPointsToRedeem,
                'shipping_name' => $shippingData['shipping_name'],
                'shipping_address' => $shippingData['shipping_address'],
                'shipping_city' => $shippingData['shipping_city'],
                'shipping_state' => $shippingData['shipping_state'] ?? null,
                'shipping_postal_code' => $shippingData['shipping_postal_code'],
                'shipping_country' => $shippingData['shipping_country'],
                'notes' => $shippingData['notes'] ?? null,
            ]);

            foreach ($cartItems as $cartItem) {
                $variant = $lockedVariants->get($cartItem->product_variant_id);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_name' => $variant->name,
                    'sku' => $variant->sku,
                    'unit_price' => $variant->price,
                    'quantity' => $cartItem->quantity,
                    'line_total' => round((float) $variant->price * $cartItem->quantity, 2),
                ]);

                $variant->decrement('stock', $cartItem->quantity);
            }

            if ($fidelityPointsToRedeem > 0) {
                $this->fidelityEngine->redeemPoints($user, $fidelityPointsToRedeem);
            }

            $this->cartService->clearForUser($user);

            $user->profile?->increment('lifetime_spend', $total);
            $user->profile?->increment('total_orders');

            return $order;
        });

        $pointsEarned = $this->fidelityEngine->calculatePointsForOrder($order, $user);
        $this->fidelityEngine->awardPoints($user, $order, $pointsEarned);

        $order->update([
            'fidelity_points_earned' => $pointsEarned,
        ]);

        $this->fidelityEngine->recalculateTier($user);

        return $order->load('items');
    }
}
