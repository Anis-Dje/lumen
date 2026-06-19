import { create } from 'zustand';
import { cartApi } from '../lib/api';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  sessionToken: string | null;
  isLoading: boolean;
  isCartOpen: boolean;

  // Computed
  itemCount: () => number;
  subtotal: () => number;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  mergeCart: () => Promise<void>;
  clear: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

function getOrCreateSessionToken(): string {
  const existing = localStorage.getItem('cart_session_token');
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem('cart_session_token', token);
  return token;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  sessionToken: localStorage.getItem('cart_session_token'),
  isLoading: false,
  isCartOpen: false,

  itemCount: (): number => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  subtotal: (): number => {
    return get().items.reduce((sum, item) => sum + item.line_total, 0);
  },

  fetchCart: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const sessionToken = get().sessionToken || getOrCreateSessionToken();
      const response = await cartApi.getCart(sessionToken);
      set({ items: response.data.data, sessionToken, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId: string, quantity: number): Promise<void> => {
    set({ isLoading: true });
    try {
      const sessionToken = get().sessionToken || getOrCreateSessionToken();
      set({ sessionToken });
      await cartApi.addToCart({
        variant_id: variantId,
        quantity,
      }, sessionToken);
      await get().fetchCart();
      set({ isCartOpen: true });
    } catch {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number): Promise<void> => {
    const previousItems = [...get().items];
    // Optimistic update
    set({
      items: get().items.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity, line_total: item.variant.price * quantity }
          : item
      ),
    });
    try {
      await cartApi.updateCartItem(cartItemId, { quantity }, get().sessionToken || undefined);
    } catch {
      set({ items: previousItems });
    }
  },

  removeItem: async (cartItemId: string): Promise<void> => {
    const previousItems = [...get().items];
    // Optimistic removal
    set({ items: get().items.filter((item) => item.id !== cartItemId) });
    try {
      await cartApi.removeCartItem(cartItemId, get().sessionToken || undefined);
    } catch {
      set({ items: previousItems });
    }
  },

  mergeCart: async (): Promise<void> => {
    const sessionToken = get().sessionToken;
    if (!sessionToken) return;
    try {
      await cartApi.mergeCart(sessionToken);
      localStorage.removeItem('cart_session_token');
      set({ sessionToken: null });
      await get().fetchCart();
    } catch {
      // Merge failure is non-critical
    }
  },

  clear: (): void => {
    set({ items: [], isCartOpen: false });
  },

  toggleCart: (): void => {
    set({ isCartOpen: !get().isCartOpen });
  },

  openCart: (): void => {
    set({ isCartOpen: true });
  },

  closeCart: (): void => {
    set({ isCartOpen: false });
  },
}));
