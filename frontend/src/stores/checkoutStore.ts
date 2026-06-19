import { create } from 'zustand';
import { api } from '../lib/api';
import type { CartItem } from '../types';

type CheckoutStep = 'cart' | 'shipping' | 'fidelity' | 'review' | 'processing' | 'confirmed' | 'failed';

interface ShippingData {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes: string;
}

interface CheckoutState {
  step: CheckoutStep;
  shippingData: ShippingData;
  fidelityPointsToRedeem: number;
  fidelityBalance: number;
  orderId: string | null;
  orderNumber: string | null;
  error: string | null;
  isProcessing: boolean;
  cartItems: CartItem[];

  // Computed
  subtotal: () => number;
  fidelityDiscount: () => number;
  tax: () => number;
  total: () => number;

  // Actions
  setStep: (step: CheckoutStep) => void;
  setShipping: (data: ShippingData) => void;
  setFidelityPoints: (points: number) => void;
  setFidelityBalance: (balance: number) => void;
  setCartItems: (items: CartItem[]) => void;
  submitOrder: () => Promise<void>;
  reset: () => void;
}

const POINT_VALUE = 0.01; // 100 points = $1
const TAX_RATE = 0.0825;  // 8.25%

const initialShipping: ShippingData = {
  shipping_name: '',
  shipping_address: '',
  shipping_city: '',
  shipping_state: '',
  shipping_postal_code: '',
  shipping_country: 'US',
  notes: '',
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  step: 'cart',
  shippingData: { ...initialShipping },
  fidelityPointsToRedeem: 0,
  fidelityBalance: 0,
  orderId: null,
  orderNumber: null,
  error: null,
  isProcessing: false,
  cartItems: [],

  subtotal: (): number => {
    return get().cartItems.reduce((sum, item) => sum + item.line_total, 0);
  },

  fidelityDiscount: (): number => {
    const discount = get().fidelityPointsToRedeem * POINT_VALUE;
    const sub = get().subtotal();
    return Math.min(discount, sub); // Can't exceed subtotal
  },

  tax: (): number => {
    const taxable = get().subtotal() - get().fidelityDiscount();
    return Math.round(taxable * TAX_RATE * 100) / 100;
  },

  total: (): number => {
    return get().subtotal() - get().fidelityDiscount() + get().tax();
  },

  setStep: (step: CheckoutStep): void => {
    set({ step, error: null });
  },

  setShipping: (data: ShippingData): void => {
    set({ shippingData: data });
  },

  setFidelityPoints: (points: number): void => {
    const clamped = Math.max(0, Math.min(points, get().fidelityBalance));
    set({ fidelityPointsToRedeem: clamped });
  },

  setFidelityBalance: (balance: number): void => {
    set({ fidelityBalance: balance });
  },

  setCartItems: (items: CartItem[]): void => {
    set({ cartItems: items });
  },

  submitOrder: async (): Promise<void> => {
    set({ step: 'processing', isProcessing: true, error: null });
    try {
      const { shippingData, fidelityPointsToRedeem } = get();
      const response = await api.checkout.processCheckout({
        ...shippingData,
        fidelity_points_to_redeem: fidelityPointsToRedeem,
      });
      set({
        step: 'confirmed',
        isProcessing: false,
        orderId: response.data.data.id,
        orderNumber: response.data.data.order_number,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Checkout failed. Please try again.';
      set({ step: 'failed', isProcessing: false, error: message });
    }
  },

  reset: (): void => {
    set({
      step: 'cart',
      shippingData: { ...initialShipping },
      fidelityPointsToRedeem: 0,
      fidelityBalance: 0,
      orderId: null,
      orderNumber: null,
      error: null,
      isProcessing: false,
      cartItems: [],
    });
  },
}));
