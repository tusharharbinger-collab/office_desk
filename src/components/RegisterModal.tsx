import React, { useState } from 'react';
import { UserProfile, Role } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (newUser: UserProfile) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegister
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Frontend Engineering');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'user',
      department,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&w=120&h=120&q=80`,
      active: true
    };

    onRegister(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Create Employee Account</h3>
              <p className="text-xs text-outline">Self-service registration for SmartDesk booking.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-outline flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Corporate Email
            </label>
            <input
              type="email"
              placeholder="maya.lin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="Frontend Engineering">Frontend Engineering</option>
              <option value="Backend Platform">Backend Platform</option>
              <option value="Product Design">Product Design</option>
              <option value="Data Science & ML">Data Science & ML</option>
              <option value="QA & DevOps">QA & DevOps</option>
              <option value="Growth & Sales">Growth & Sales</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">how_to_reg</span>
              <span>Register & Log In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
