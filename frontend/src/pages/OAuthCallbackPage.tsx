import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Landing target for the OAuth flow. The backend redirects here with either
 * `?token=<sanctum-token>` on success or `?error=<message>` on failure.
 */
export const OAuthCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const loginWithToken = useAuthStore((s) => s.loginWithToken);
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = params.get('token');
    const err = params.get('error');

    if (err) {
      setError(decodeURIComponent(err));
      return;
    }
    if (!token) {
      setError('No authentication token was returned.');
      return;
    }

    loginWithToken(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => setError('We could not complete sign-in. Please try again.'));
  }, [params, loginWithToken, navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      {error ? (
        <>
          <p className="text-lg font-semibold text-accent-danger">Sign-in failed</p>
          <p className="max-w-sm text-sm text-text-secondary">{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-2">
            Back to login
          </button>
        </>
      ) : (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-subtle border-t-accent-primary" />
          <p className="text-sm text-text-secondary">Completing sign-in…</p>
        </>
      )}
    </div>
  );
};
