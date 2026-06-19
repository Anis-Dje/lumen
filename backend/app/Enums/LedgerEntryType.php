<?php

declare(strict_types=1);

namespace App\Enums;

enum LedgerEntryType: string
{
    case Earned = 'earned';
    case Redeemed = 'redeemed';
    case Expired = 'expired';
    case Adjustment = 'adjustment';
}
