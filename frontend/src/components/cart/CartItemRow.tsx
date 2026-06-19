import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import type { CartItem } from '../../types';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div
      className="flex gap-4 p-4 rounded-lg transition-colors duration-150"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Product info */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4
          className="font-medium text-sm truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {item.product_name}
        </h4>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {item.variant.name}
        </p>

        {/* Attribute chips */}
        <div className="flex flex-wrap gap-1 pt-1">
          {Object.entries(item.variant.attributes).map(([key, value]) => (
            <span
              key={key}
              className="px-2 py-0.5 text-xs rounded"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {key}: {value}
            </span>
          ))}
        </div>

        {/* Price */}
        <p className="text-xs pt-1" style={{ color: 'var(--text-secondary)' }}>
          ${item.variant.price.toFixed(2)} each
        </p>
      </div>

      {/* Quantity & Actions */}
      <div className="flex flex-col items-end justify-between">
        {/* Line total */}
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          ${item.line_total.toFixed(2)}
        </span>

        {/* Quantity stepper */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (item.quantity <= 1) {
                removeItem(item.id);
              } else {
                updateQuantity(item.id, item.quantity - 1);
              }
            }}
            className="p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--bg-card)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span
            className="w-8 text-center text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {item.quantity}
          </span>

          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= 10}
            className="p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--bg-card)] disabled:opacity-30"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => removeItem(item.id)}
            className="p-1.5 rounded-md transition-colors duration-150 ml-1"
            style={{ color: 'var(--accent-danger)' }}
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
