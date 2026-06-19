/**
 * Shared OAuth helpers.
 *
 * OAuth requires a full-page redirect to the backend (not an XHR), so we
 * navigate the browser to `${API}/auth/{provider}/redirect`. The backend then
 * bounces to the provider and returns to `${FRONTEND_URL}/auth/callback?token=…`.
 *
 * API base resolves to VITE_API_URL when set (separate-origin deploys),
 * otherwise the dev-proxied relative `/api`.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export type OAuthProvider = 'google' | 'github';

export function startOAuth(provider: OAuthProvider): void {
  window.location.href = `${API_BASE}/auth/${provider}/redirect`;
}
