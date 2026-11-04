import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { Avatar } from './Avatar';

interface HeaderProps {
  // Office modal trigger (optional in profile dropdown)
  onOpenOfficeModal?: () => void;
  // Current user & switchers
  currentUser: UserProfile;
  allUsers?: UserProfile[];
  onSwitchUser?: (user: UserProfile) => void;
  onOpenRegister?: () => void;
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Sidebar toggle
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  onOpenOutlookEmails?: () => void;
  emailCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenOfficeModal,
  currentUser,
  allUsers = [],
  onSwitchUser,
  onOpenRegister,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed,
  onToggleSidebar,
  onLogout,
  onOpenOutlookEmails,
  emailCount
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Global Ctrl+K / Cmd+K search shortcut focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'text-sky-400 bg-sky-500/15 border-sky-500/30';
      case 'manager':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'user':
        return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    }
  };

  return (
    <header className="h-16 px-3 sm:px-5 lg:px-6 bg-[#090D16]/95 border-b border-white/[0.08] flex items-center justify-between gap-2 sm:gap-4 select-none z-30 sticky top-0 backdrop-blur-xl">
      {/* ========================================================
          LEFT ZONE: Sidebar Toggle
         ======================================================== */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Sidebar Toggle Hamburger Button */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar'}
          className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.08] hover:border-sky-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[19px]">
            {isSidebarCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>

      {/* ========================================================
          CENTER ZONE: Omnibar Search (Centered, Non-squished)
         ======================================================== */}
      <div className="hidden xl:flex items-center justify-center flex-1 max-w-sm px-2 mx-auto">
        <div className="relative flex items-center h-9 w-full rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.08] focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:bg-[#0c101a] transition-all px-3 shadow-inner">
          <span className="material-symbols-outlined text-slate-400 text-[18px] pointer-events-none flex-shrink-0">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search desks, people, zones..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent pl-2.5 pr-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none min-w-0"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="w-5 h-5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white text-xs flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <kbd className="inline-flex items-center text-[10px] font-mono text-slate-400 bg-white/[0.06] border border-white/[0.1] px-1.5 py-0.5 rounded shadow-inner flex-shrink-0">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {/* ========================================================
          RIGHT ZONE: Outlook Sync + Profile Dropdown
         ======================================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 flex-shrink-0" ref={userMenuRef}>
        {/* Microsoft Outlook Sync & Emails Button */}
        {onOpenOutlookEmails && (
          <button
            onClick={onOpenOutlookEmails}
            className="inline-flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-sky-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-sm group"
            title="Microsoft Outlook Email & Calendar Sync"
          >
            {/* Microsoft 4-Color Grid */}
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 flex-shrink-0">
              <div className="bg-[#f25022] rounded-[1px]"></div>
              <div className="bg-[#7fba00] rounded-[1px]"></div>
              <div className="bg-[#00a4ef] rounded-[1px]"></div>
              <div className="bg-[#ffb900] rounded-[1px]"></div>
            </div>
            <span className="hidden xl:inline group-hover:text-sky-300 transition-colors">Outlook Sync</span>
            {emailCount !== undefined && emailCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold border border-sky-400/30">
                {emailCount}
              </span>
            )}
          </button>
        )}

        {/* Subtle Vertical Divider */}
        <div className="h-5 w-px bg-white/[0.08] hidden sm:block flex-shrink-0" />

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`inline-flex items-center gap-2 h-9 pl-1 pr-2 sm:pr-2.5 rounded-xl border transition-all cursor-pointer shadow-sm text-left group ${
              userDropdownOpen
                ? 'bg-white/[0.1] border-white/[0.2] text-white shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.16]'
            }`}
          >
            <Avatar src={currentUser.avatar} name={currentUser.name} size="xs" />
            <div className="hidden md:block leading-tight pr-1">
              <div className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors truncate max-w-[110px]">
                {currentUser.name}
              </div>
            </div>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold uppercase tracking-wider hidden sm:inline-block ${getRoleBadge(
                currentUser.role
              )}`}
            >
              {currentUser.role}
            </span>
            <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
              expand_more
            </span>
          </button>

          {/* User Profile Dropdown Menu */}
          {userDropdownOpen && (
            <div
              style={{ backgroundColor: '#101522' }}
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
            >
              {/* Profile Card Summary */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-2">
                <div className="flex items-center gap-2.5">
                  <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Current Role:</span>
                  <span className={`px-1.5 py-0.2 rounded border font-bold uppercase ${getRoleBadge(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Fast Switch User Profiles */}
              {allUsers.length > 0 && onSwitchUser && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Switch Active Profile
                  </div>
                  <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
                    {allUsers.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-sky-500/15 text-sky-200 font-semibold'
                              : 'hover:bg-white/[0.04] text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar src={u.avatar} name={u.name} size="xs" />
                            <span className="truncate">{u.name}</span>
                          </div>
                          <span className={`text-[9px] font-mono px-1 rounded uppercase ${getRoleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1 border-t border-white/[0.06] space-y-1">
                {onOpenOfficeModal && (
                  <button
                    onClick={() => {
                      onOpenOfficeModal();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-sky-400">location_city</span>
                    <span>Change Office Campus...</span>
                  </button>
                )}

                {onOpenRegister && (
                  <button
                    onClick={() => {
                      onOpenRegister();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-emerald-400">person_add</span>
                    <span>Register New Team Member...</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
