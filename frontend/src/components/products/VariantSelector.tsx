import React, { useState, useEffect, useRef } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useCartStore } from '../../stores/cartStore';
import type { ProductVariant } from '../../types';

interface VariantSelectorProps {
  variants: ProductVariant[];
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({ variants }) => {
  const [selectedId, setSelectedId] = useState<string>(variants[0]?.id || '');
  const [addedState, setAddedState] = useState<'idle' | 'adding' | 'added'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const addItem = useCartStore((s) => s.addItem);

  const selected = variants.find((v) => v.id === selectedId);

  // Gather unique attribute keys across all variants
  const attributeKeys = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.attributes)))
  );

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAttributeClick = (key: string, value: string) => {
    if (!selected) {
      const match = variants.find((v) => v.attributes[key] === value);
      if (match) setSelectedId(match.id);
      return;
    }

    const newAttributes = { ...selected.attributes, [key]: value };
    
    // Try to find a variant matching all desired attributes
    const exactMatch = variants.find((v) =>
      Object.entries(newAttributes).every(([k, val]) => v.attributes[k] === val)
    );

    if (exactMatch) {
      setSelectedId(exactMatch.id);
    } else {
      // Fallback: select the first variant that has the clicked attribute
      const partialMatch = variants.find((v) => v.attributes[key] === value);
      if (partialMatch) setSelectedId(partialMatch.id);
    }
  };

  const handleAddToCart = async (): Promise<void> => {
    if (!selected || !selected.is_in_stock) return;
    setAddedState('adding');
    try {
      await addItem(selected.id, 1);
      setAddedState('added');
      timeoutRef.current = setTimeout(() => setAddedState('idle'), 1500);
    } catch {
      setAddedState('idle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Attribute selectors */}
      {attributeKeys.map((key) => {
        const values = Array.from(
          new Set(variants.map((v) => v.attributes[key]).filter(Boolean))
        );
        return (
          <div key={key}>
            <label
              className="block text-sm font-medium mb-2 uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              {key}
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const matchingVariant = variants.find(
                  (v) => v.attributes[key] === value
                );
                const isSelected = selected?.attributes[key] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleAttributeClick(key, value)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150"
                    style={{
                      background: isSelected ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected variant details */}
      {selected && (
        <div
          className="p-4 rounded-lg space-y-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                ${selected.price.toFixed(2)}
              </span>
              {selected.compare_at_price && selected.compare_at_price > selected.price && (
                <span
                  className="ml-2 text-sm line-through"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ${selected.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
            {!selected.is_in_stock ? (
              <Badge variant="danger">Out of Stock</Badge>
            ) : selected.is_low_stock ? (
              <Badge variant="warning" className="pulse-warning">
                Only {selected.stock} left
              </Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            SKU: {selected.sku}
          </p>
        </div>
      )}

      {/* Add to Cart button */}
      <button
        onClick={handleAddToCart}
        disabled={!selected?.is_in_stock || addedState === 'adding'}
        className="btn-primary w-full py-3 text-base"
        style={{
          background:
            addedState === 'added'
              ? 'var(--accent-success)'
              : undefined,
        }}
      >
        {addedState === 'added' ? (
          <span className="morph-check inline-flex items-center gap-2">
            <Check className="w-5 h-5" />
            Added to Cart
          </span>
        ) : addedState === 'adding' ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            Adding...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </span>
        )}
      </button>
    </div>
  );
};
