export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  fidelity_tier_id: string | null;
  profile?: Profile;
}

export interface Profile {
  id: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  lifetime_spend: number;
  total_orders: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  children?: Category[];
  products_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  specifications: Record<string, string>;
  image_url: string | null;
  is_active: boolean;
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compare_at_price: number | null;
  stock: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  is_active: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
  variant: ProductVariant;
  product_name: string;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  fidelity_discount: number;
  tax: number;
  total: number;
  fidelity_points_earned: number;
  fidelity_points_redeemed: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  items?: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface FidelityBalance {
  balance: number;
  tier: {
    name: string;
    multiplier: number;
    next_tier_name: string | null;
    next_tier_spend_remaining: number | null;
  };
  recent_transactions: FidelityTransaction[];
}

export interface FidelityTransaction {
  id: string;
  entry_type: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
