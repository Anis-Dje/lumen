<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::active()->with(['variants', 'category']);

        if ($request->has('category')) {
            $categorySlug = $request->string('category')->toString();
            $query->whereHas('category', function ($q) use ($categorySlug): void {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->has('search')) {
            $search = $request->string('search')->toString();
            $query->where('name', 'ILIKE', "%{$search}%");
        }

        $products = $query->paginate($request->integer('per_page', 15));

        return ProductResource::collection($products);
    }

    public function show(Product $product): ProductResource
    {
        $product->load(['variants', 'category']);

        return new ProductResource($product);
    }

    /**
     * List all active categories with product counts.
     */
    public function categories(): AnonymousResourceCollection
    {
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }
}
