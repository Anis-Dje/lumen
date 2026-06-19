import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div
        className="w-full max-w-md p-8 rounded-xl space-y-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Create Account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Join TechVault and start earning fidelity points
          </p>
        </div>

        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: 'rgba(255, 82, 82, 0.1)',
              border: '1px solid var(--accent-danger)',
              color: 'var(--accent-danger)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); clearError(); }} className="input" placeholder="John Doe" required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} className="input" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} className="input" placeholder="Min. 8 characters" required minLength={8} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Confirm Password
            </label>
            <input type="password" value={passwordConfirmation} onChange={(e) => { setPasswordConfirmation(e.target.value); clearError(); }} className="input" placeholder="••••••••" required />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium transition-colors duration-150" style={{ color: 'var(--accent-primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
