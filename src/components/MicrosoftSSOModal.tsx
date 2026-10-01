import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface MicrosoftSSOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const MicrosoftSSOModal: React.FC<MicrosoftSSOModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  const [msEmail, setMsEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    api.getMicrosoftConfig().then((cfg) => {
      setIsConfigured(cfg.configured);
    });
  }, []);

  const handleMicrosoftSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isConfigured) {
        // Real Microsoft OAuth 2.0 Flow with Microsoft Entra ID
        const url = await api.getMicrosoftLoginUrl();
        window.location.href = url;
      } else {
        // If real Azure ID is not set yet in .env, perform instant verified Organization login
        const emailToUse = msEmail.trim() || 'david.chen@company.com';
        const result = await api.loginWithMicrosoftDemo(emailToUse);
        onSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Microsoft 365');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = async (demoEmail: string) => {
    setMsEmail(demoEmail);
    setError(null);
    setLoading(true);
    try {
      const result = await api.loginWithMicrosoftDemo(demoEmail);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Microsoft 365');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-lg p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Microsoft Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
          <div className="flex items-center gap-3">
            {/* Official Microsoft 4-Color Grid Logo */}
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md p-2">
              <svg viewBox="0 0 23 23" className="w-6 h-6">
                <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">Microsoft 365 Sign-In</h3>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono font-bold">
                  100% FREE SSO
                </span>
              </div>
              <p className="text-xs text-outline">
                Single Sign-On with Microsoft Entra ID (Azure AD)
              </p>
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

        {/* Status Indicator */}
        <div className="mb-5 p-3 rounded-2xl bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConfigured ? 'bg-secondary shadow-[0_0_8px_#4edea3]' : 'bg-tertiary shadow-[0_0_8px_#ffb95f]'
              }`}
            />
            <span className="text-on-surface font-medium">
              {isConfigured ? 'Live Azure Tenant Connected' : 'Simulated / Free Dev Mode Active'}
            </span>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">help</span>
            <span>{showGuide ? 'Hide Free Setup Guide' : 'How to do it FREE?'}</span>
          </button>
        </div>

        {/* Free Microsoft Setup Guide Accordion */}
        {showGuide && (
          <div className="mb-5 p-4 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/40 text-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>How Microsoft Organization SSO is 100% Free ($0):</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed text-[11px]">
              Microsoft provides <strong>Microsoft Entra ID Free edition</strong> with every Microsoft 365, Office 365, or Azure account with <strong>ZERO subscription fees and zero per-user charges</strong>.
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-on-surface-variant text-[11px]">
              <li>
                Visit{' '}
                <a
                  href="https://portal.azure.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-medium"
                >
                  portal.azure.com
                </a>{' '}
                or{' '}
                <a
                  href="https://entra.microsoft.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-medium"
                >
                  entra.microsoft.com
                </a>
              </li>
              <li>Navigate to <strong>Microsoft Entra ID</strong> &rarr; <strong>App registrations</strong> &rarr; <strong>New registration</strong>.</li>
              <li>Name it <strong>SmartDesk Workplace</strong> and choose <em>"Accounts in this organizational directory only"</em>.</li>
              <li>Set Redirect URI to <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-primary">http://localhost:5173</code>.</li>
              <li>
                Copy the <strong>Application (client) ID</strong> and <strong>Tenant ID</strong> into your <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-secondary">.env</code> file.
              </li>
            </ol>
            <div className="p-2 rounded-lg bg-surface-container-high border border-outline-variant/30 text-[10px] font-mono text-outline">
              MICROSOFT_CLIENT_ID=your-azure-app-id<br />
              MICROSOFT_TENANT_ID=your-company-tenant-id
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleMicrosoftSignIn} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Organization Microsoft Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg pointer-events-none">
                corporate_fare
              </span>
              <input
                type="email"
                placeholder="e.g. employee@yourcompany.com"
                value={msEmail}
                onChange={(e) => setMsEmail(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <p className="text-[11px] text-outline mt-1">
              Sign in with your company-issued Office 365 or Microsoft Entra account
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {/* Microsoft 4-Color Grid Icon */}
            <svg viewBox="0 0 23 23" className="w-4 h-4 flex-shrink-0">
              <rect x="1" y="1" width="10" height="10" fill="#f25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
            <span>{loading ? 'Connecting to Microsoft...' : 'Sign In with Microsoft 365'}</span>
          </button>
        </form>

        {/* Quick Simulated Microsoft Accounts */}
        <div className="mt-6 pt-4 border-t border-outline-variant/20">
          <p className="text-[11px] text-outline text-center mb-2.5 font-mono uppercase">
            Or Test Instantly with Microsoft Demo Identities:
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemoSelect('david.chen@company.com')}
              className="w-full p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="David Chen"
                  className="w-7 h-7 rounded-full object-cover border border-outline-variant/40"
                />
                <div>
                  <p className="text-xs font-semibold text-on-surface">David Chen</p>
                  <p className="text-[10px] text-outline">david.chen@company.com (Employee)</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-tertiary px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/20">
                Sign In &rarr;
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoSelect('sarah.jenkins@company.com')}
              className="w-full p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Sarah Jenkins"
                  className="w-7 h-7 rounded-full object-cover border border-outline-variant/40"
                />
                <div>
                  <p className="text-xs font-semibold text-on-surface">Sarah Jenkins</p>
                  <p className="text-[10px] text-outline">sarah.jenkins@company.com (Manager)</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-secondary px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20">
                Sign In &rarr;
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoSelect('alex.mercer@company.com')}
              className="w-full p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Alex Mercer"
                  className="w-7 h-7 rounded-full object-cover border border-outline-variant/40"
                />
                <div>
                  <p className="text-xs font-semibold text-on-surface">Alex Mercer</p>
                  <p className="text-[10px] text-outline">alex.mercer@company.com (Admin)</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                Sign In &rarr;
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
