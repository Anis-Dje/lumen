import React, { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { CartItemRow } from './CartItemRow';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, closeCart, subtotal, itemCount, fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen, fetchCart]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const handleCheckout = (): void => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="backdrop-overlay"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-subtle)',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            <ShoppingBag className="w-5 h-5" />
            Cart ({itemCount()})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingBag
                className="w-16 h-16"
                style={{ color: 'var(--border-subtle)' }}
              />
              <p style={{ color: 'var(--text-secondary)' }}>
                Your cart is empty
              </p>
              <button onClick={closeCart} className="btn-secondary">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="p-4 space-y-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Subtotal
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                ${subtotal().toFixed(2)}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Tax calculated at checkout
            </p>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full py-3"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};
