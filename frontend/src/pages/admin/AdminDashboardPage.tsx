import React, { useEffect, useState } from 'react';
import { DollarSign, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';

interface Analytics {
  total_revenue: number;
  total_orders: number;
  active_fidelity_users: number;
  average_order_value: number;
}

interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
  product_name: string;
}

interface RevenuePoint {
  date: string;
  revenue: number;
}

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async (): Promise<void> => {
      try {
        const [analyticsRes, lowStockRes, revenueRes] = await Promise.all([
          api.admin.getAnalytics(),
          api.admin.getLowStock(),
          api.admin.getRevenue(),
        ]);
        setAnalytics(analyticsRes.data.data);
        setLowStock(lowStockRes.data.data);
        setRevenue(revenueRes.data.data);
      } catch {
        // Handle silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = analytics
    ? [
        { label: 'Total Revenue', value: `$${analytics.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'var(--accent-success)' },
        { label: 'Total Orders', value: analytics.total_orders.toLocaleString(), icon: Package, color: 'var(--accent-primary)' },
        { label: 'Fidelity Users', value: analytics.active_fidelity_users.toLocaleString(), icon: Users, color: 'var(--accent-secondary)' },
        { label: 'Avg Order Value', value: `$${analytics.average_order_value.toFixed(2)}`, icon: TrendingUp, color: 'var(--accent-warning)' },
      ]
    : [];

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))
          : statCards.map((card) => (
              <div
                key={card.label}
                className="p-5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {card.label}
                  </span>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {card.value}
                </p>
              </div>
            ))}
      </div>

      {/* Revenue chart (bar chart) */}
      <div
        className="p-6 rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Revenue (Last 30 Days)
        </h2>
        <div className="flex items-end gap-1 h-48">
          {revenue.map((point) => (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t transition-all duration-300"
                style={{
                  height: `${(point.revenue / maxRevenue) * 100}%`,
                  minHeight: '2px',
                  background: 'linear-gradient(to top, var(--accent-primary), var(--accent-secondary))',
                }}
                title={`${point.date}: $${point.revenue.toFixed(2)}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>{revenue[0]?.date || ''}</span>
          <span>{revenue[revenue.length - 1]?.date || ''}</span>
        </div>
      </div>

      {/* Low stock alerts */}
      <div
        className="p-6 rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--accent-warning)' }} />
          Low Stock Alerts
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            All items are well-stocked ✓
          </p>
        ) : (
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 px-4 rounded-lg"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {item.product_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {item.name} · SKU: {item.sku}
                  </p>
                </div>
                <Badge variant={item.stock === 0 ? 'danger' : 'warning'}>
                  {item.stock} left
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
