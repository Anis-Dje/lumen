<?php

declare(strict_types=1);

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

final class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize the incoming field name before validation.
     */
    protected function prepareForValidation(): void
    {
        // Frontend sends "variant_id", backend expects "product_variant_id"
        if ($this->has('variant_id') && !$this->has('product_variant_id')) {
            $this->merge([
                'product_variant_id' => $this->input('variant_id'),
            ]);
        }
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'uuid', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
        ];
    }
}
