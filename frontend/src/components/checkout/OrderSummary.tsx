import React from 'react';
import type { CartItem } from '../../types';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  fidelityDiscount: number;
  tax: number;
  total: number;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  fidelityDiscount,
  tax,
  total,
  onConfirm,
  isProcessing,
}) => {
  return (
    <div className="space-y-6">
      {/* Line items */}
      <div className="space-y-3">
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Order Items
        </h3>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-start py-2"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {item.product_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {item.variant.name} × {item.quantity}
              </p>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              ${item.line_total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        className="p-4 rounded-lg space-y-3"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
          <span style={{ color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
        </div>

        {fidelityDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--accent-success)' }}>Fidelity Discount</span>
            <span style={{ color: 'var(--accent-success)' }}>-${fidelityDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Tax (8.25%)</span>
          <span style={{ color: 'var(--text-primary)' }}>${tax.toFixed(2)}</span>
        </div>

        <div
          className="flex justify-between text-lg font-bold pt-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span style={{ color: 'var(--text-primary)' }}>Total</span>
          <span style={{ color: 'var(--text-primary)' }}>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={isProcessing}
        className="btn-primary w-full py-4 text-base"
      >
        {isProcessing ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            Processing Order...
          </span>
        ) : (
          'Place Order'
        )}
      </button>
    </div>
  );
};
