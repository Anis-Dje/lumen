import { create } from 'zustand';
import { api } from '../lib/api';
import type { Product, Category } from '../types';

interface CatalogFilters {
  category: string | null;
  search: string;
  page: number;
}

interface CatalogState {
  products: Product[];
  categories: Category[];
  filters: CatalogFilters;
  totalPages: number;
  total: number;
  isLoading: boolean;
  isCategoriesLoaded: boolean;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilter: (key: keyof CatalogFilters, value: string | number | null) => void;
  resetFilters: () => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [],
  categories: [],
  filters: {
    category: null,
    search: '',
    page: 1,
  },
  totalPages: 1,
  total: 0,
  isLoading: false,
  isCategoriesLoaded: false,

  fetchProducts: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params: Record<string, string | number> = { page: filters.page };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const response = await api.products.getProducts(params);
      set({
        products: response.data.data,
        totalPages: response.data.meta.last_page,
        total: response.data.meta.total,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchCategories: async (): Promise<void> => {
    if (get().isCategoriesLoaded) return;
    try {
      const response = await api.categories.getCategories();
      set({ categories: response.data.data, isCategoriesLoaded: true });
    } catch {
      // Non-critical failure
    }
  },

  setFilter: (key: keyof CatalogFilters, value: string | number | null): void => {
    const newFilters = { ...get().filters, [key]: value };
    if (key !== 'page') newFilters.page = 1; // Reset page on filter change
    set({ filters: newFilters });
    get().fetchProducts();
  },

  resetFilters: (): void => {
    set({
      filters: { category: null, search: '', page: 1 },
    });
    get().fetchProducts();
  },
}));
