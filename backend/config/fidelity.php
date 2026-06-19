<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Base Rate
    |--------------------------------------------------------------------------
    |
    | The number of fidelity points earned per dollar spent. This is the
    | base rate before any tier multiplier is applied.
    |
    */

    'base_rate' => (int) env('FIDELITY_BASE_RATE', 1),

    /*
    |--------------------------------------------------------------------------
    | Point Value
    |--------------------------------------------------------------------------
    |
    | The monetary value of a single fidelity point when redeemed.
    | Default: 0.01 means 100 points = $1.00 discount.
    |
    */

    'point_value' => (float) env('FIDELITY_POINT_VALUE', 0.01),

    /*
    |--------------------------------------------------------------------------
    | Expiration Days
    |--------------------------------------------------------------------------
    |
    | The number of days after which earned points expire if not redeemed.
    |
    */

    'expiration_days' => (int) env('FIDELITY_EXPIRATION_DAYS', 365),

    /*
    |--------------------------------------------------------------------------
    | Tiers
    |--------------------------------------------------------------------------
    |
    | Defines the available fidelity tiers and their respective point
    | multipliers applied on top of the base rate.
    |
    */

    'tiers' => [
        'bronze' => ['multiplier' => 1.0],
        'silver' => ['multiplier' => 1.5],
        'gold' => ['multiplier' => 2.0],
    ],

];
