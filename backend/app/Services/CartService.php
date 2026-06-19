<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

final class CartService
{
    public function getItems(?User $user, ?string $sessionToken): Collection
    {
        if ($user !== null) {
            return CartItem::forUser($user->id)
                ->with('variant.product')
                ->get();
        }

        if ($sessionToken !== null) {
            return CartItem::forSession($sessionToken)
                ->with('variant.product')
                ->get();
        }

        return new Collection();
    }

    public function addItem(?User $user, ?string $sessionToken, string $variantId, int $quantity): CartItem
    {
        $query = CartItem::where('product_variant_id', $variantId);

        if ($user !== null) {
            $query->where('user_id', $user->id);
        } elseif ($sessionToken !== null) {
            $query->where('session_token', $sessionToken);
        }

        $existingItem = $query->first();

        if ($existingItem !== null) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + $quantity,
            ]);

            return $existingItem->load('variant.product');
        }

        $cartItem = CartItem::create([
            'user_id' => $user?->id,
            'session_token' => $user !== null ? null : $sessionToken,
            'product_variant_id' => $variantId,
            'quantity' => $quantity,
        ]);

        return $cartItem->load('variant.product');
    }

    public function updateQuantity(string $cartItemId, int $quantity): CartItem
    {
        $cartItem = CartItem::findOrFail($cartItemId);

        $cartItem->update([
            'quantity' => $quantity,
        ]);

        return $cartItem->load('variant.product');
    }

    public function removeItem(string $cartItemId): void
    {
        $cartItem = CartItem::findOrFail($cartItemId);
        $cartItem->delete();
    }

    public function mergeGuestCart(User $user, string $sessionToken): void
    {
        $guestItems = CartItem::forSession($sessionToken)->get();

        foreach ($guestItems as $guestItem) {
            $existingUserItem = CartItem::where('user_id', $user->id)
                ->where('product_variant_id', $guestItem->product_variant_id)
                ->first();

            if ($existingUserItem !== null) {
                $existingUserItem->update([
                    'quantity' => $existingUserItem->quantity + $guestItem->quantity,
                ]);
                $guestItem->delete();
            } else {
                $guestItem->update([
                    'user_id' => $user->id,
                    'session_token' => null,
                ]);
            }
        }
    }

    public function clearForUser(User $user): void
    {
        CartItem::where('user_id', $user->id)->delete();
    }
}
