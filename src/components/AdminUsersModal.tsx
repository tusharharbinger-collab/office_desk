import React, { useState } from 'react';
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
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateRole,
  onToggleActive,
  onAddUser,
  onDeleteUser,
  onBookForUser
}) => {
  if (!isOpen) return null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('user');
  const [newDept, setNewDept] = useState('Engineering');

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
      department: newDept,
      avatar: pickedAvatar,
      active: true
    });

    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-[0_0_12px_rgba(14,165,233,0.3)]">
              <span className="material-symbols-outlined text-2xl">manage_accounts</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-on-surface">User Management Portal</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-mono font-bold">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-outline">
                Provision users, configure role-based access permissions, and manage account statuses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(14,165,233,0.4)]"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>{showAddForm ? 'Close Form' : 'Add Employee'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-outline flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Add User Collapsible Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreate}
            className="p-5 bg-surface-container-high/60 border-b border-outline-variant/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
          >
            <div>
              <label className="text-outline block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Liam Foster"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Work Email</label>
              <input
                type="email"
                placeholder="liam.foster@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Role Permission</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="user">User (Employee)</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="text-outline block mb-1">Department</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Design"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="flex-1 bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-secondary text-on-secondary font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-high/30">
            <div className="grid grid-cols-12 text-[11px] font-mono text-outline uppercase px-5 py-3 border-b border-outline-variant/30 bg-surface-container-high/60">
              <span className="col-span-3">User Details</span>
              <span className="col-span-2">Department</span>
              <span className="col-span-2">Access Role</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-2 text-center">Desk Allocation</span>
              <span className="col-span-1 text-right">Delete</span>
            </div>

            <div className="divide-y divide-outline-variant/20">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-12 items-center px-5 py-3 hover:bg-surface-container-high/50 transition-all text-xs"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar
                      src={u.avatar}
                      name={u.name}
                      size="md"
                      rounded="rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-on-surface">{u.name}</p>
                      <p className="text-[11px] text-outline">{u.email}</p>
                    </div>
                  </div>

                  <div className="col-span-2 text-on-surface-variant font-medium">
                    {u.department}
                  </div>

                  <div className="col-span-2">
                    <select
                      value={u.role}
                      onChange={(e) => onUpdateRole(u.id, e.target.value as Role)}
                      className="bg-surface-container border border-outline-variant/30 rounded-lg px-2 py-1 text-[11px] font-mono uppercase text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="user">USER</option>
                      <option value="manager">MANAGER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => onToggleActive(u.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold transition-all border ${
                        u.active
                          ? 'bg-secondary/15 text-secondary border-secondary/30'
                          : 'bg-outline/15 text-outline border-outline/30'
                      }`}
                    >
                      {u.active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    {u.role === 'user' && u.active && onBookForUser ? (
                      <button
                        onClick={() => onBookForUser(u)}
                        className="px-2.5 py-1 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-on-primary border border-primary/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        title={`Assign a desk to ${u.name}`}
                      >
                        <span className="material-symbols-outlined text-xs">event_seat</span>
                        <span>Assign Desk</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-outline font-mono opacity-40">—</span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => onDeleteUser(u.id)}
                      className="text-outline hover:text-error transition-all"
                      title="Delete User"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-high/40 flex justify-between items-center text-xs text-outline">
          <span>{users.length} active enterprise directory accounts indexed.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
