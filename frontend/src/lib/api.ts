import axios from 'axios';
import type {
  User,
  Product,
  ProductVariant,
  Category,
  CartItem,
  Order,
  FidelityBalance,
  FidelityTransaction,
  PaginatedResponse,
} from '@/types';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => axiosInstance.post<{ user: User; token: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    axiosInstance.post<{ user: User; token: string }>('/auth/login', data),

  logout: () => axiosInstance.post('/auth/logout'),

  getUser: () => axiosInstance.get<{ user: User }>('/auth/user'),
};

// ─── PRODUCTS ───────────────────────────────────────────────────────────────

export const productsApi = {
  getProducts: (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => axiosInstance.get<PaginatedResponse<Product>>('/products', { params }),

  getProduct: (slug: string) =>
    axiosInstance.get<{ data: Product }>(`/products/${slug}`),
};

// ─── CATEGORIES ─────────────────────────────────────────────────────────────

export const categoriesApi = {
  getCategories: () => axiosInstance.get<{ data: Category[] }>('/categories'),
};

// ─── CART ────────────────────────────────────────────────────────────────────

function sessionHeaders(sessionToken?: string): Record<string, string> {
  return sessionToken ? { 'X-Session-Token': sessionToken } : {};
}

export const cartApi = {
  getCart: (sessionToken?: string) =>
    axiosInstance.get<{ data: CartItem[]; session_token?: string }>('/cart', {
      headers: sessionHeaders(sessionToken),
    }),

  addToCart: (
    data: { variant_id: string; quantity: number },
    sessionToken?: string,
  ) =>
    axiosInstance.post<{ data: CartItem[]; session_token?: string }>('/cart', data, {
      headers: sessionHeaders(sessionToken),
    }),

  updateCartItem: (
    itemId: string,
    data: { quantity: number },
    sessionToken?: string,
  ) =>
    axiosInstance.patch<{ data: CartItem[] }>(`/cart/${itemId}`, data, {
      headers: sessionHeaders(sessionToken),
    }),

  removeCartItem: (itemId: string, sessionToken?: string) =>
    axiosInstance.delete<{ data: CartItem[] }>(`/cart/${itemId}`, {
      headers: sessionHeaders(sessionToken),
    }),

  mergeCart: (sessionToken: string) =>
    axiosInstance.post<{ data: CartItem[] }>('/cart/merge', {
      session_token: sessionToken,
    }),
};

// ─── CHECKOUT ───────────────────────────────────────────────────────────────

export const checkoutApi = {
  processCheckout: (data: {
    shipping_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    redeem_points?: number;
    fidelity_points_to_redeem?: number;
  }) => axiosInstance.post<{ data: Order }>('/checkout', data),
};

// ─── ORDERS ─────────────────────────────────────────────────────────────────

export const ordersApi = {
  getOrders: (page?: number) =>
    axiosInstance.get<PaginatedResponse<Order>>('/orders', { params: { page } }),

  getOrder: (id: string) => axiosInstance.get<{ data: Order }>(`/orders/${id}`),
};

// ─── FIDELITY ───────────────────────────────────────────────────────────────

export const fidelityApi = {
  getBalance: () => axiosInstance.get<{ data: FidelityBalance }>('/fidelity/balance'),

  getHistory: (page?: number) =>
    axiosInstance.get<PaginatedResponse<FidelityTransaction>>('/fidelity/history', {
      params: { page },
    }),
};

// ─── ADMIN ──────────────────────────────────────────────────────────────────

export const adminApi = {
  getAnalytics: () => axiosInstance.get<{ data: Record<string, unknown> }>('/admin/analytics'),

  getRevenue: () => axiosInstance.get<{ data: Record<string, unknown> }>('/admin/analytics/revenue'),

  getLowStock: () =>
    axiosInstance.get<{ data: ProductVariant[] }>('/admin/analytics/low-stock'),

  createProduct: (data: any) =>
    axiosInstance.post<{ data: Product }>('/admin/products', data),

  updateProduct: (id: string, data: any) =>
    axiosInstance.put<{ data: Product }>(`/admin/products/${id}`, data),

  deleteProduct: (id: string) => axiosInstance.delete(`/admin/products/${id}`),

  getAdminOrders: (params?: { status?: string; page?: number }) =>
    axiosInstance.get<PaginatedResponse<Order>>('/admin/orders', { params }),

  updateOrderStatus: (id: string, data: { status: string }) =>
    axiosInstance.patch<{ data: Order }>(`/admin/orders/${id}/status`, data),
};

// ─── UNIFIED API OBJECT ─────────────────────────────────────────────────────

export const api = {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  checkout: checkoutApi,
  orders: ordersApi,
  fidelity: fidelityApi,
  admin: adminApi,
};
