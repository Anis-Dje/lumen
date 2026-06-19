<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FidelityBalanceResource;
use App\Models\FidelityTier;
use App\Models\User;
use App\Services\FidelityEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

final class FidelityController extends Controller
{
    public function __construct(
        private readonly FidelityEngineService $fidelityEngine,
    ) {}

    public function balance(Request $request): FidelityBalanceResource
    {
        /** @var User $user */
        $user = $request->user();
        $user->load(['fidelityTier', 'profile']);

        $balance = $this->fidelityEngine->getBalance($user);

        $currentTier = $user->fidelityTier;
        $lifetimeSpend = (float) ($user->profile?->lifetime_spend ?? 0);

        $nextTier = FidelityTier::where('min_lifetime_spend', '>', $lifetimeSpend)
            ->orderBy('min_lifetime_spend')
            ->first();

        $recentTransactions = $user->fidelityLedger()
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($entry) => [
                'id' => $entry->id,
                'entry_type' => $entry->entry_type->value,
                'points' => $entry->points,
                'balance_after' => $entry->balance_after,
                'description' => $entry->description,
                'created_at' => $entry->created_at,
            ])
            ->toArray();

        return new FidelityBalanceResource([
            'balance' => $balance,
            'tier' => [
                'name' => $currentTier?->name ?? 'None',
                'multiplier' => (float) ($currentTier?->points_multiplier ?? 1.0),
                'next_tier_name' => $nextTier?->name,
                'next_tier_spend_remaining' => $nextTier !== null
                    ? round($nextTier->min_lifetime_spend - $lifetimeSpend, 2)
                    : null,
            ],
            'recent_transactions' => $recentTransactions,
        ]);
    }

    public function history(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        $ledgerEntries = $user->fidelityLedger()
            ->latest()
            ->paginate(15);

        return JsonResource::collection($ledgerEntries);
    }

    public function tier(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->load(['fidelityTier', 'profile']);

        $currentTier = $user->fidelityTier;
        $lifetimeSpend = (float) ($user->profile?->lifetime_spend ?? 0);

        $nextTier = FidelityTier::where('min_lifetime_spend', '>', $lifetimeSpend)
            ->orderBy('min_lifetime_spend')
            ->first();

        return new JsonResponse([
            'current_tier' => $currentTier !== null ? [
                'id' => $currentTier->id,
                'name' => $currentTier->name,
                'multiplier' => (float) $currentTier->points_multiplier,
                'min_lifetime_spend' => (float) $currentTier->min_lifetime_spend,
            ] : null,
            'lifetime_spend' => $lifetimeSpend,
            'next_tier' => $nextTier !== null ? [
                'name' => $nextTier->name,
                'min_lifetime_spend' => (float) $nextTier->min_lifetime_spend,
                'spend_remaining' => round($nextTier->min_lifetime_spend - $lifetimeSpend, 2),
            ] : null,
        ]);
    }
}
