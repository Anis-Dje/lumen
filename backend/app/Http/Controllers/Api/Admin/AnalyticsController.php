<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class AnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $totalRevenue = (float) Order::where('status', '!=', OrderStatus::Cancelled)
            ->sum('total');

        $totalOrders = Order::where('status', '!=', OrderStatus::Cancelled)
            ->count();

        $activeFidelityUsers = User::whereHas('orders')->count();

        $averageOrderValue = $totalOrders > 0
            ? round($totalRevenue / $totalOrders, 2)
            : 0.0;

        return new JsonResponse([
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'active_fidelity_users' => $activeFidelityUsers,
                'average_order_value' => $averageOrderValue,
            ],
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $dailyRevenue = Order::where('status', '!=', OrderStatus::Cancelled)
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders'),
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'revenue' => (float) $row->revenue,
                'orders' => (int) $row->orders,
            ]);

        return new JsonResponse([
            'data' => $dailyRevenue,
        ]);
    }

    public function lowStock(Request $request): JsonResponse
    {
        $lowStockVariants = ProductVariant::lowStock()
            ->with('product')
            ->get()
            ->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'name' => $variant->name,
                'stock' => $variant->stock,
                'low_stock_threshold' => $variant->low_stock_threshold,
                'product_name' => $variant->product->name,
                'product_slug' => $variant->product->slug,
            ]);

        return new JsonResponse([
            'data' => $lowStockVariants,
        ]);
    }
}
