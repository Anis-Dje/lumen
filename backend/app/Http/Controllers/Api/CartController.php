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

        $this->cartService->addItem(
            $request->user(),
            $request->header('X-Session-Token'),
            $validated['product_variant_id'],
            (int) $validated['quantity'],
        );

        // Return the full, refreshed cart so the SPA can hydrate its store directly.
        $items = $this->cartService->getItems(
            $request->user(),
            $request->header('X-Session-Token'),
        );

        return CartItemResource::collection($items)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateCartRequest $request, string $cartItem): AnonymousResourceCollection
    {
        $validated = $request->validated();

        $this->cartService->updateQuantity(
            $cartItem,
            (int) $validated['quantity'],
        );

        $items = $this->cartService->getItems(
            $request->user(),
            $request->header('X-Session-Token'),
        );

        return CartItemResource::collection($items);
    }

    public function destroy(Request $request, string $cartItem): AnonymousResourceCollection
    {
        $this->cartService->removeItem($cartItem);

        $items = $this->cartService->getItems(
            $request->user(),
            $request->header('X-Session-Token'),
        );

        return CartItemResource::collection($items);
    }

    public function merge(Request $request): JsonResponse
    {
        // The SPA sends the guest token in the body; fall back to the header.
        $sessionToken = $request->input('session_token') ?: $request->header('X-Session-Token');

        if (empty($sessionToken)) {
            return new JsonResponse([
                'message' => 'A guest session_token is required to merge the cart.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->cartService->mergeGuestCart($request->user(), (string) $sessionToken);

        return new JsonResponse([
            'message' => 'Guest cart merged successfully.',
        ]);
    }
}
