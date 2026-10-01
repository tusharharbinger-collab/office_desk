import React, { useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onOpenLogin: () => void;
  onOpenMicrosoftSSO?: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenLogin,
  onOpenMicrosoftSSO
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Frontend Engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // New self-registered accounts are always created with the 'user' (employee) role
      const data = await api.register({
        name,
        email,
        password,
        department,
        role: 'user'
      });
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-md p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Create Employee Account</h3>
              <p className="text-xs text-outline">Access workplace hot-desking & room reservations</p>
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

        {/* One-Click Corporate Microsoft 365 Login / Sign-up */}
        {onOpenMicrosoftSSO && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMicrosoftSSO();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-slate-200 active:scale-95"
            >
              <svg viewBox="0 0 23 23" className="w-4 h-4 flex-shrink-0">
                <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
              </svg>
              <span>Continue with Microsoft 365</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-outline-variant/30 w-full" />
              <span className="bg-surface-container px-3 text-[10px] text-outline uppercase font-mono tracking-wider absolute">
                Or register with email
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Maya Lin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Corporate Email Address
            </label>
            <input
              type="email"
              placeholder="maya.lin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="Frontend Engineering">Frontend Engineering</option>
              <option value="Backend Platform">Backend Platform</option>
              <option value="Product Design">Product Design</option>
              <option value="Data Science & ML">Data Science & ML</option>
              <option value="QA & Security">QA & Security</option>
              <option value="Growth & Operations">Growth & Operations</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Secure Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-base">sync</span>
              ) : (
                <span className="material-symbols-outlined text-base">how_to_reg</span>
              )}
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-outline">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="text-primary hover:underline font-medium ml-1 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
