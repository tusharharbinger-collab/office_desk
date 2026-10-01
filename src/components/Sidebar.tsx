import React from 'react';
import { Role } from '../types';

export type ActiveTab = 'floor-plan' | 'time-grid' | 'my-bookings' | 'analytics' | 'admin-users' | 'admin-health';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: Role;
  bookingsCount: number;
  isCollapsed: boolean;
  onLogout?: () => void;
  onGoToLanding?: () => void;
  onCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  bookingsCount,
  isCollapsed,
  onLogout,
  onGoToLanding,
  onCollapse
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    onTabChange(tab);
    if (window.innerWidth < 768 && onCollapse) {
      onCollapse();
    }
  };

  return (
    <>
      {/* Mobile Backdrop when open */}
      {!isCollapsed && (
        <div
          onClick={onCollapse}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-[#0B0F17]/95 backdrop-blur-2xl border-r border-white/[0.08] z-50 flex flex-col pt-4 pb-4 justify-between select-none transition-all duration-200 ${
          isCollapsed
            ? 'w-0 -translate-x-full md:translate-x-0 md:w-16 items-center px-0 md:px-1'
            : 'w-60 translate-x-0 px-3 shadow-2xl'
        }`}
      >
      {/* Brand Header */}
      <div className="w-full">
        <div
          onClick={onGoToLanding}
          className={`flex items-center gap-3 cursor-pointer group mb-5 ${
            isCollapsed ? 'justify-center px-1' : 'px-2.5'
          }`}
          title="SmartDesk Workplace Booking"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(14,165,233,0.4)] group-hover:scale-105 transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">desk</span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                SmartDesk
              </h1>
              <span className="text-[9px] text-sky-400/80 font-mono block tracking-wider uppercase font-semibold">
                WORKSPACE OS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1 w-full">
          {/* Floor Plan */}
          <button
            onClick={() => handleTabClick('floor-plan')}
            title="Floor Plan Map"
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
            } ${
              activeTab === 'floor-plan'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
              map
            </span>
            {!isCollapsed && <span>Floor Plan Map</span>}
          </button>

          {/* Time Grid */}
          <button
            onClick={() => handleTabClick('time-grid')}
            title="Time Grid Scheduler"
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
            } ${
              activeTab === 'time-grid'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
              schedule
            </span>
            {!isCollapsed && <span>Time Grid</span>}
          </button>

          {/* My Bookings */}
          <button
            onClick={() => handleTabClick('my-bookings')}
            title="My Bookings"
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5 relative' : 'justify-between px-3 py-2'
            } ${
              activeTab === 'my-bookings'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <div className="flex items-center">
              <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
                bookmark
              </span>
              {!isCollapsed && <span>My Bookings</span>}
            </div>
            {bookingsCount > 0 && (
              <span
                className={`rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-400/30 ${
                  isCollapsed
                    ? 'absolute top-1 right-1 w-4 h-4 text-[9px] flex items-center justify-center'
                    : 'px-1.5 py-0.2 text-[10px]'
                }`}
              >
                {bookingsCount}
              </span>
            )}
          </button>

          {/* Manager & Admin Analytics */}
          {(userRole === 'manager' || userRole === 'admin') && (
            <button
              onClick={() => handleTabClick('analytics')}
              title="Manager Analytics"
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
              } ${
                activeTab === 'analytics'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
                analytics
              </span>
              {!isCollapsed && (
                <>
                  <span>Manager Radar</span>
                  <span className="ml-auto text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    PRO
                  </span>
                </>
              )}
            </button>
          )}

          {/* Admin Exclusive: User Management */}
          {userRole === 'admin' && (
            <button
              onClick={() => handleTabClick('admin-users')}
              title="User Management"
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
              } ${
                activeTab === 'admin-users'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
                manage_accounts
              </span>
              {!isCollapsed && <span>Users Directory</span>}
            </button>
          )}

          {/* Admin Exclusive: System Health */}
          {userRole === 'admin' && (
            <button
              onClick={() => handleTabClick('admin-health')}
              title="System Health"
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
              } ${
                activeTab === 'admin-health'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
                monitor_heart
              </span>
              {!isCollapsed && <span>System Health</span>}
            </button>
          )}

          {/* Public Landing Page */}
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              title="Return to Public Landing Page"
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer text-slate-400 hover:text-sky-300 hover:bg-white/[0.04] border border-transparent ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] text-sky-400 ${!isCollapsed ? 'mr-3' : ''}`}>
                storefront
              </span>
              {!isCollapsed && <span>Landing Page</span>}
            </button>
          )}
        </nav>
      </div>

      {/* Footer Info & Actions */}
      <div className="w-full space-y-2">
        {!isCollapsed && (
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-[11px] text-slate-300 font-medium">
                Live SQLite
              </span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 font-semibold">
              v2.5
            </span>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            className={`w-full rounded-xl hover:bg-rose-500/15 text-rose-400 text-xs font-medium flex items-center transition-all cursor-pointer border border-transparent hover:border-rose-500/30 ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-center gap-2 py-2 px-3'
            }`}
          >
            <span className="material-symbols-outlined text-base">logout</span>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>
    </aside>
    </>
  );
};
