import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import type { Order } from '../../types';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  pending: 'neutral',
  confirmed: 'info',
  processing: 'info',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'danger',
};

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab, page]);

  const fetchOrders = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (activeTab !== 'all') params.status = activeTab;
      const response = await api.admin.getAdminOrders(params);
      setOrders(response.data.data);
      setTotalPages(response.data.meta.last_page);
    } catch {
      // handle silently
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string): Promise<void> => {
    try {
      await api.admin.updateOrderStatus(orderId, { status });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch {
      alert('Cannot transition to that status.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        Order Management
      </h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => { setActiveTab(status); setPage(1); }}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors duration-150"
            style={{
              background: activeTab === status ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: activeTab === status ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === status ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Order</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Customer</th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Date</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="p-4"><div className="skeleton h-8 w-full" /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>No orders found</td></tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors duration-150"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {order.shipping_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={STATUS_VARIANT[order.status] || 'neutral'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="input py-1 px-2 text-xs w-auto"
                      >
                        {STATUSES.filter((s) => s !== 'all').map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedId === order.id && order.items && (
                    <tr>
                      <td colSpan={6} className="px-8 py-4" style={{ background: 'var(--bg-elevated)' }}>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-1">
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {item.product_name} — {item.variant_name} × {item.quantity}
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>${item.line_total.toFixed(2)}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-10 h-10 rounded-lg text-sm font-medium"
              style={{
                background: page === p ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: page === p ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
