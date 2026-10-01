import React, { useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onOpenSignUp: () => void;
  onOpenMicrosoftSSO: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenSignUp,
  onOpenMicrosoftSSO
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(email, password);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: 'admin' | 'manager' | 'employee') => {
    setError(null);
    if (role === 'admin') {
      setEmail('admin@smartdesk.com');
      setPassword('admin123');
    } else if (role === 'manager') {
      setEmail('manager@smartdesk.com');
      setPassword('manager123');
    } else {
      setEmail('employee@smartdesk.com');
      setPassword('user123');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-md p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Sign In to SmartDesk</h3>
              <p className="text-xs text-outline">Access your workplace seat booking dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-outline flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Free Microsoft Organization SSO Button */}
        <div className="mb-5 space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMicrosoftSSO();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-slate-200"
          >
            {/* Microsoft 4-Color Grid Icon */}
            <svg viewBox="0 0 23 23" className="w-4 h-4 flex-shrink-0">
              <rect x="1" y="1" width="10" height="10" fill="#f25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
            <span>Sign in with Microsoft 365 (Organization SSO)</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-outline-variant/30 w-full" />
            <span className="bg-surface-container px-3 text-[10px] text-outline uppercase font-mono tracking-wider absolute">
              Or sign in with password
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. employee@smartdesk.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-on-surface-variant">Password</label>
              <span className="text-[11px] text-outline">Defaults: admin123 / manager123 / user123</span>
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-base">sync</span>
            ) : (
              <span className="material-symbols-outlined text-base">login</span>
            )}
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-5 pt-4 border-t border-outline-variant/20">
          <p className="text-[11px] text-outline text-center mb-2 font-mono uppercase">
            Quick Auto-Fill Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('admin')}
              className="py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-[11px] font-mono text-primary font-medium text-center transition-all"
            >
              Admin Alex
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('manager')}
              className="py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-[11px] font-mono text-secondary font-medium text-center transition-all"
            >
              Manager Sarah
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('employee')}
              className="py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-[11px] font-mono text-tertiary font-medium text-center transition-all"
            >
              User David
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-outline">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSignUp();
            }}
            className="text-primary hover:underline font-medium ml-1"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
