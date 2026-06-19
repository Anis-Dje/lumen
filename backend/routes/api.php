<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\FidelityController;
use App\Http\Controllers\Api\OAuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| No authentication required. Open to guests and crawlers.
|
*/

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Social login (Google / GitHub) via Socialite.
    Route::get('/{provider}/redirect', [OAuthController::class, 'redirect'])
        ->where('provider', 'google|github');
    Route::get('/{provider}/callback', [OAuthController::class, 'callback'])
        ->where('provider', 'google|github');
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

Route::get('/categories', [ProductController::class, 'categories']);

// Guest cart (session-based)
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::patch('/cart/{cartItem}', [CartController::class, 'update']);
Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
| Requires a valid Sanctum token (cookie or Bearer).
|
*/

Route::middleware('auth:sanctum')->group(function (): void {

    // Auth management
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    // Authenticated cart operations
    Route::post('/cart/merge', [CartController::class, 'merge']);

    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'process']);

    // Customer orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Fidelity program
    Route::prefix('fidelity')->group(function (): void {
        Route::get('/balance', [FidelityController::class, 'balance']);
        Route::get('/history', [FidelityController::class, 'history']);
        Route::get('/tier', [FidelityController::class, 'tier']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    | Requires Sanctum auth + admin role via EnsureUserIsAdmin middleware.
    |
    */

    Route::middleware('admin')->prefix('admin')->group(function (): void {

        // Analytics
        Route::get('/analytics', [AnalyticsController::class, 'summary']);
        Route::get('/analytics/revenue', [AnalyticsController::class, 'revenue']);
        Route::get('/analytics/low-stock', [AnalyticsController::class, 'lowStock']);

        // Product management
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);

        // Order management
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
    });
});
