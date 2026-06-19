<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class FidelityBalanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'balance' => $this->resource['balance'],
            'tier' => [
                'name' => $this->resource['tier']['name'],
                'multiplier' => $this->resource['tier']['multiplier'],
                'next_tier_name' => $this->resource['tier']['next_tier_name'],
                'next_tier_spend_remaining' => $this->resource['tier']['next_tier_spend_remaining'],
            ],
            'recent_transactions' => $this->resource['recent_transactions'],
        ];
    }
}
