<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartRequest;
use App\Http\Resources\CartItemResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

final class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $items = $this->cartService->getItems(
            $request->user(),
            $request->header('X-Session-Token'),
        );

        return CartItemResource::collection($items);
    }

    public function store(AddToCartRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $cartItem = $this->cartService->addItem(
            $request->user(),
            $request->header('X-Session-Token'),
            $validated['product_variant_id'],
            (int) $validated['quantity'],
        );

        return (new CartItemResource($cartItem))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateCartRequest $request, string $cartItemId): CartItemResource
    {
        $validated = $request->validated();

        $cartItem = $this->cartService->updateQuantity(
            $cartItemId,
            (int) $validated['quantity'],
        );

        return new CartItemResource($cartItem);
    }

    public function destroy(string $cartItemId): JsonResponse
    {
        $this->cartService->removeItem($cartItemId);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    public function merge(Request $request): JsonResponse
    {
        $sessionToken = $request->header('X-Session-Token');

        if (empty($sessionToken)) {
            return new JsonResponse([
                'message' => 'X-Session-Token header is required.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->cartService->mergeGuestCart($request->user(), $sessionToken);

        return new JsonResponse([
            'message' => 'Guest cart merged successfully.',
        ]);
    }
}
