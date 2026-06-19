import { create } from 'zustand';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  initialize: async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    set({ token, isLoading: true });
    try {
      const response = await api.auth.getUser();
      set({ user: response.data.user, isLoading: false });
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (name: string, email: string, password: string, passwordConfirmation: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.auth.logout();
    } catch {
      // Proceed even if server logout fails
    } finally {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, error: null });
    }
  },

  fetchUser: async (): Promise<void> => {
    if (!get().token) return;
    set({ isLoading: true });
    try {
      const response = await api.auth.getUser();
      set({ user: response.data.user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loginWithToken: async (token: string): Promise<void> => {
    // Used by the OAuth callback once the backend hands us a Sanctum token.
    localStorage.setItem('auth_token', token);
    set({ token, isLoading: true, error: null });
    try {
      const response = await api.auth.getUser();
      set({ user: response.data.user, isLoading: false });
    } catch (err: unknown) {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isLoading: false, error: 'Sign-in failed' });
      throw err;
    }
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
