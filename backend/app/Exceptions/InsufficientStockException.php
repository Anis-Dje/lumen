<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(
        public readonly string $variantName,
        public readonly int $availableStock,
    ) {
        parent::__construct(
            "Insufficient stock for \"{$this->variantName}\". Only {$this->availableStock} unit(s) available."
        );
    }
}
