<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allows the Lumen React SPA (served from a separate origin during
    | development, e.g. http://localhost:5173) to call this API. Adjust
    | FRONTEND_URL in your .env for staging / production origins.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    // Expose the headers the SPA reads (none required today, kept for clarity).
    'exposed_headers' => [],

    'max_age' => 0,

    // Token-based auth (Bearer) does not need credentialed requests, but we
    // enable it so cookie-based Sanctum sessions also work if desired.
    'supports_credentials' => true,

];
