import React, { useEffect, useState } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import type { Order } from '../types';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  pending: 'neutral',
  confirmed: 'info',
  processing: 'info',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'danger',
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await api.orders.getOrders(page);
        setOrders(response.data.data);
        setTotalPages(response.data.meta.last_page);
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [page]);

  const toggleExpand = (id: string): void => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        Your Orders
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Package className="w-16 h-16 mx-auto" style={{ color: 'var(--border-subtle)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl overflow-hidden transition-colors duration-150"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              {/* Order header */}
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {order.order_number}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={STATUS_VARIANT[order.status] || 'neutral'}>
                    {order.status}
                  </Badge>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${order.total.toFixed(2)}
                  </span>
                  {expandedId === order.id ? (
                    <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {expandedId === order.id && order.items && (
                <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="pt-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between py-2 text-sm"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <div>
                          <span style={{ color: 'var(--text-primary)' }}>{item.product_name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}> — {item.variant_name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}> × {item.quantity}</span>
                        </div>
                        <span style={{ color: 'var(--text-primary)' }}>${item.line_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Points earned: <strong style={{ color: 'var(--accent-success)' }}>+{order.fidelity_points_earned}</strong>
                    </span>
                    {order.fidelity_discount > 0 && (
                      <span style={{ color: 'var(--accent-success)' }}>
                        Fidelity discount: -${order.fidelity_discount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
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
      )}
    </div>
  );
};
