<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

final class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        $slugUniqueRule = $productId
            ? "unique:products,slug,{$productId}"
            : 'unique:products,slug';

        return [
            'category_id' => ['required', 'uuid', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', $slugUniqueRule],
            'description' => ['required', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'specifications' => ['nullable', 'array'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.sku' => ['required', 'string', 'max:100', 'distinct'],
            'variants.*.name' => ['required', 'string', 'max:255'],
            'variants.*.attributes' => ['nullable', 'array'],
            'variants.*.price' => ['required', 'numeric', 'min:0.01'],
            'variants.*.compare_at_price' => ['nullable', 'numeric', 'min:0.01'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
            'variants.*.low_stock_threshold' => ['integer', 'min:0'],
        ];
    }
}
