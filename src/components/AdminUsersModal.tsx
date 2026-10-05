import React, { useState, useMemo } from 'react';
import { UserProfile, Role } from '../types';
import { Avatar } from './Avatar';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  onUpdateRole: (userId: string, newRole: Role) => void;
  onToggleActive: (userId: string) => void;
  onAddUser: (user: Omit<UserProfile, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  onBookForUser?: (user: UserProfile) => void;
  isPageView?: boolean;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateRole,
  onToggleActive,
  onAddUser,
  onDeleteUser,
  onBookForUser,
  isPageView = true
}) => {
  if (!isOpen) return null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'user' | 'active'>('all');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const AVATAR_POOL = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80'
    ];
    const pickedAvatar = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];

    onAddUser({
      name: newName,
      email: newEmail,
      role: newRole,
      avatar: pickedAvatar,
      active: true
    });

    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  const activeCount = users.filter((u) => u.active).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const managerCount = users.filter((u) => u.role === 'manager').length;
  const employeeCount = users.filter((u) => u.role === 'user').length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesFilter =
        roleFilter === 'all'
          ? true
          : roleFilter === 'active'
          ? u.active
          : u.role === roleFilter;

      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, roleFilter]);

  const content = (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Top Page Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#121724]/90 border border-white/[0.08] shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-600/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] flex-shrink-0">
            <span className="material-symbols-outlined text-[26px]">manage_accounts</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Workspace / Administration
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 font-mono font-bold uppercase">
                Enterprise Directory ({users.length})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Team & User Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Provision users, configure role-based access permissions, allocate dedicated workstations, and manage account statuses.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {showAddForm ? 'close' : 'person_add'}
            </span>
            <span>{showAddForm ? 'Cancel Form' : 'Add Employee'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            <span>Floor Plan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Total Accounts</span>
            <span className="material-symbols-outlined text-xs text-sky-400">group</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{users.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered in SQLite</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Active Staff</span>
            <span className="material-symbols-outlined text-xs text-emerald-400">check_circle</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{activeCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active workspace users</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Leadership & Admins</span>
            <span className="material-symbols-outlined text-xs text-amber-400">security</span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {adminCount + managerCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {adminCount} Admins • {managerCount} Managers
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Standard Members</span>
            <span className="material-symbols-outlined text-xs text-purple-400">badge</span>
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300 mt-1">{employeeCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Bookable employee profiles</span>
        </div>
      </div>

      {/* Add User Drawer / Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-[#151c2e] border border-sky-500/30 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Liam Foster"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Work Email</label>
            <input
              type="email"
              placeholder="liam.foster@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Role Permission</label>
            <div className="flex gap-2">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="flex-1 bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="user">User (Employee)</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#121724] border border-white/[0.08]">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 focus-within:border-sky-500/50">
          <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-sky-500/20 text-sky-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-sky-500/20 text-sky-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter('manager')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              roleFilter === 'manager'
                ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Managers ({managerCount})
          </button>
          <button
            onClick={() => setRoleFilter('user')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              roleFilter === 'user'
                ? 'bg-purple-500/20 text-purple-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Users ({employeeCount})
          </button>
          <button
            onClick={() => setRoleFilter('active')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              roleFilter === 'active'
                ? 'bg-teal-500/20 text-teal-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Only ({activeCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121724] overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[60vh]">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-[#0e121a] z-10 border-b border-white/[0.1] shadow-md">
              <tr className="text-left font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3.5 px-4 w-72">Employee Details</th>
                <th className="py-3.5 px-4 w-44">Access Role</th>
                <th className="py-3.5 px-4 text-center w-36">Account Status</th>
                <th className="py-3.5 px-4 text-center w-40">Desk Allocation</th>
                <th className="py-3.5 px-4 text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-xs">
                    No registered employees match your search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u.avatar}
                          name={u.name}
                          size="md"
                          rounded="rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateRole(u.id, e.target.value as Role)}
                        className="bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1 text-[11px] font-mono uppercase text-sky-300 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="user">USER (Employee)</option>
                        <option value="manager">MANAGER</option>
                        <option value="admin">ADMINISTRATOR</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleActive(u.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold transition-all border cursor-pointer ${
                          u.active
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/25'
                            : 'bg-slate-700/30 text-slate-400 border-white/[0.1] hover:bg-slate-700/50'
                        }`}
                      >
                        {u.active ? '● Active' : '○ Suspended'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {u.role === 'user' && u.active && onBookForUser ? (
                        <button
                          onClick={() => onBookForUser(u)}
                          className="px-3 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-black border border-sky-400/30 text-[11px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          title={`Assign a workstation to ${u.name}`}
                        >
                          <span className="material-symbols-outlined text-xs">event_seat</span>
                          <span>Assign Desk</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Delete User Account"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0c1017] flex flex-wrap justify-between items-center text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-emerald-400">verified_user</span>
            <span>
              All account modifications persist instantly to backend SQLite database.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all cursor-pointer"
          >
            Return to Floor Plan
          </button>
        </div>
      </div>
    </div>
  );

  if (isPageView) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#090D16] p-4 sm:p-6 lg:p-8 flex flex-col animate-in fade-in duration-150">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 p-6 overflow-hidden">
        {content}
      </div>
    </div>
  );
};
