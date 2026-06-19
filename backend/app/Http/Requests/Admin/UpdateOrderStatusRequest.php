<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class UpdateOrderStatusRequest extends FormRequest
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
        return [
            'status' => ['required', 'string', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var Order $order */
            $order = $this->route('order');
            $newStatus = OrderStatus::from($this->validated('status'));

            if (!$order->status->canTransitionTo($newStatus)) {
                $validator->errors()->add(
                    'status',
                    "Cannot transition order from '{$order->status->value}' to '{$newStatus->value}'."
                );
            }
        });
    }
}
