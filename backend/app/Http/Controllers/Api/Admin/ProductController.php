<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

final class ProductController extends Controller
{
    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $product = DB::transaction(function () use ($validated): Product {
            $product = Product::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'],
                'short_description' => $validated['short_description'] ?? null,
                'specifications' => $validated['specifications'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            foreach ($validated['variants'] as $variantData) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $variantData['sku'],
                    'name' => $variantData['name'],
                    'attributes' => $variantData['attributes'] ?? null,
                    'price' => $variantData['price'],
                    'compare_at_price' => $variantData['compare_at_price'] ?? null,
                    'stock' => $variantData['stock'],
                    'low_stock_threshold' => $variantData['low_stock_threshold'] ?? 5,
                ]);
            }

            return $product;
        });

        $product->load('variants');

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(StoreProductRequest $request, Product $product): ProductResource
    {
        $validated = $request->validated();

        DB::transaction(function () use ($product, $validated): void {
            $product->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'],
                'short_description' => $validated['short_description'] ?? null,
                'specifications' => $validated['specifications'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
                'is_active' => $validated['is_active'] ?? $product->is_active,
            ]);

            $product->variants()->delete();

            foreach ($validated['variants'] as $variantData) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $variantData['sku'],
                    'name' => $variantData['name'],
                    'attributes' => $variantData['attributes'] ?? null,
                    'price' => $variantData['price'],
                    'compare_at_price' => $variantData['compare_at_price'] ?? null,
                    'stock' => $variantData['stock'],
                    'low_stock_threshold' => $variantData['low_stock_threshold'] ?? 5,
                ]);
            }
        });

        $product->load('variants');

        return new ProductResource($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $variantIds = $product->variants()->pluck('id');

        $hasOrderItems = OrderItem::whereIn('product_variant_id', $variantIds)->exists();

        if ($hasOrderItems) {
            return new JsonResponse([
                'message' => 'Cannot delete product. It has existing order references.',
            ], Response::HTTP_CONFLICT);
        }

        $product->variants()->delete();
        $product->delete();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
