import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingCart, Truck, Gift, ClipboardList, AlertCircle } from 'lucide-react';
import { useCheckoutStore } from '../stores/checkoutStore';
import { useCartStore } from '../stores/cartStore';
import { ShippingForm } from '../components/checkout/ShippingForm';
import { FidelityRedemption } from '../components/checkout/FidelityRedemption';
import { OrderSummary } from '../components/checkout/OrderSummary';

const STEPS = ['cart', 'shipping', 'fidelity', 'review'] as const;
const STEP_LABELS = ['Cart', 'Shipping', 'Points', 'Review'];
const STEP_ICONS = [ShoppingCart, Truck, Gift, ClipboardList];

export const CheckoutPage: React.FC = () => {
  const checkout = useCheckoutStore();
  const cartItems = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    checkout.setCartItems(cartItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  const stepIndex = STEPS.indexOf(checkout.step as typeof STEPS[number]);

  // Confirmed state
  if (checkout.step === 'confirmed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0, 230, 118, 0.15)' }}
        >
          <Check className="w-10 h-10" style={{ color: 'var(--accent-success)' }} />
        </div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your order <strong style={{ color: 'var(--text-primary)' }}>{checkout.orderNumber}</strong> has been placed successfully.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-primary" onClick={() => { checkout.reset(); clearCart(); }}>
            View Orders
          </Link>
          <Link to="/" className="btn-secondary" onClick={() => { checkout.reset(); clearCart(); }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Failed state
  if (checkout.step === 'failed') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 82, 82, 0.15)' }}
        >
          <AlertCircle className="w-10 h-10" style={{ color: 'var(--accent-danger)' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Checkout Failed
        </h1>
        <p style={{ color: 'var(--accent-danger)' }}>{checkout.error}</p>
        <button onClick={() => checkout.setStep('review')} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // Processing state
  if (checkout.step === 'processing') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <svg className="animate-spin w-16 h-16 mx-auto" style={{ color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="step-indicator mb-10">
        {STEPS.map((step, i) => {
          const Icon = STEP_ICONS[i];
          const isCompleted = stepIndex > i;
          const isActive = stepIndex === i;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div className={`step-dot ${isCompleted ? 'step-dot-completed' : isActive ? 'step-dot-active' : 'step-dot-pending'}`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  {STEP_LABELS[i]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${isCompleted ? 'step-line-completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div
        className="p-6 lg:p-8 rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        {checkout.step === 'cart' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Review Your Cart
            </h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
                <Link to="/" className="btn-primary mt-4 inline-block">Browse Products</Link>
              </div>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.variant.name} × {item.quantity}</p>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>${item.line_total.toFixed(2)}</span>
                  </div>
                ))}
                <button onClick={() => checkout.setStep('shipping')} className="btn-primary w-full py-3">
                  Continue to Shipping
                </button>
              </>
            )}
          </div>
        )}

        {checkout.step === 'shipping' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Shipping Information
            </h2>
            <ShippingForm
              initialData={checkout.shippingData}
              onSubmit={(data) => { checkout.setShipping(data); checkout.setStep('fidelity'); }}
            />
          </div>
        )}

        {checkout.step === 'fidelity' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Redeem Fidelity Points
            </h2>
            <FidelityRedemption
              currentPoints={checkout.fidelityPointsToRedeem}
              onApply={(points) => { checkout.setFidelityPoints(points); checkout.setStep('review'); }}
              onSkip={() => { checkout.setFidelityPoints(0); checkout.setStep('review'); }}
            />
          </div>
        )}

        {checkout.step === 'review' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Order Review
            </h2>
            <OrderSummary
              items={checkout.cartItems}
              subtotal={checkout.subtotal()}
              fidelityDiscount={checkout.fidelityDiscount()}
              tax={checkout.tax()}
              total={checkout.total()}
              onConfirm={() => checkout.submitOrder()}
              isProcessing={checkout.isProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
};
