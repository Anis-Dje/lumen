<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\LedgerEntryType;
use App\Models\FidelityLedger;
use App\Models\FidelityTier;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final class FidelityEngineService
{
    private readonly int $baseRate;
    private readonly float $pointValue;
    private readonly int $expirationDays;

    public function __construct()
    {
        $this->baseRate = (int) config('fidelity.base_rate');
        $this->pointValue = (float) config('fidelity.point_value');
        $this->expirationDays = (int) config('fidelity.expiration_days');
    }

    public function calculatePointsForOrder(Order $order, User $user): int
    {
        $user->load('fidelityTier');

        $multiplier = $user->fidelityTier?->multiplier ?? 1.0;

        return (int) floor((float) $order->total * $this->baseRate * $multiplier);
    }

    public function awardPoints(User $user, Order $order, int $points): FidelityLedger
    {
        $currentBalance = $this->getBalance($user);

        return FidelityLedger::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'entry_type' => LedgerEntryType::Earned,
            'points' => $points,
            'balance_after' => $currentBalance + $points,
            'description' => "Points earned for order {$order->order_number}",
            'expires_at' => now()->addDays($this->expirationDays),
        ]);
    }

    public function redeemPoints(User $user, int $pointsToRedeem): FidelityLedger
    {
        $balance = $this->getBalance($user);

        if ($balance < $pointsToRedeem) {
            throw new RuntimeException(
                "Insufficient fidelity points. Available: {$balance}, requested: {$pointsToRedeem}"
            );
        }

        return FidelityLedger::create([
            'user_id' => $user->id,
            'entry_type' => LedgerEntryType::Redeemed,
            'points' => -$pointsToRedeem,
            'balance_after' => $balance - $pointsToRedeem,
            'description' => "Points redeemed",
        ]);
    }

    public function getBalance(User $user): int
    {
        $earned = (int) FidelityLedger::where('user_id', $user->id)
            ->whereIn('entry_type', [LedgerEntryType::Earned, LedgerEntryType::Adjustment])
            ->where(function ($query): void {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->sum('points');

        $redeemed = (int) FidelityLedger::where('user_id', $user->id)
            ->where('entry_type', LedgerEntryType::Redeemed)
            ->sum(DB::raw('ABS(points)'));

        $expired = (int) FidelityLedger::where('user_id', $user->id)
            ->where('entry_type', LedgerEntryType::Expired)
            ->sum(DB::raw('ABS(points)'));

        return $earned - $redeemed - $expired;
    }

    public function calculateDiscount(int $points): float
    {
        return round($points * $this->pointValue, 2);
    }

    public function recalculateTier(User $user): void
    {
        $user->load('profile');

        $lifetimeSpend = (float) ($user->profile?->lifetime_spend ?? 0);

        $tier = FidelityTier::where('min_lifetime_spend', '<=', $lifetimeSpend)
            ->orderByDesc('min_lifetime_spend')
            ->first();

        $user->update([
            'fidelity_tier_id' => $tier?->id,
        ]);
    }

    public function expireOldPoints(): int
    {
        $expiredEntries = FidelityLedger::where('entry_type', LedgerEntryType::Earned)
            ->where('expires_at', '<=', now())
            ->where('points', '>', 0)
            ->whereNotExists(function ($query): void {
                $query->select(DB::raw(1))
                    ->from('fidelity_ledgers as fl')
                    ->whereColumn('fl.user_id', 'fidelity_ledgers.user_id')
                    ->where('fl.entry_type', LedgerEntryType::Expired)
                    ->whereColumn('fl.description', 'LIKE', DB::raw("CONCAT('%', fidelity_ledgers.id, '%')"));
            })
            ->get();

        $count = 0;

        foreach ($expiredEntries as $entry) {
            $currentBalance = $this->getBalance($entry->user);

            FidelityLedger::create([
                'user_id' => $entry->user_id,
                'entry_type' => LedgerEntryType::Expired,
                'points' => -$entry->points,
                'balance_after' => $currentBalance - $entry->points,
                'description' => "Points expired from entry {$entry->id}",
            ]);

            $count++;
        }

        return $count;
    }
}
