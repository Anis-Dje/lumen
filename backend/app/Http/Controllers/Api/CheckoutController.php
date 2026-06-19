<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\ProcessCheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderProcessingService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

final class CheckoutController extends Controller
{
    public function __construct(
        private readonly OrderProcessingService $orderProcessingService,
    ) {}

    public function process(ProcessCheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $order = $this->orderProcessingService->processCheckout(
                user: $request->user(),
                shippingData: $validated,
                fidelityPointsToRedeem: (int) ($validated['fidelity_points_to_redeem'] ?? 0),
            );

            return (new OrderResource($order))
                ->response()
                ->setStatusCode(Response::HTTP_CREATED);
        } catch (InsufficientStockException $e) {
            return new JsonResponse([
                'message' => $e->getMessage(),
                'errors' => [
                    'stock' => [
                        "Insufficient stock for '{$e->variantName}'. Available: {$e->availableStock}.",
                    ],
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
