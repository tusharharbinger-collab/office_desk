import React from 'react';
import { Role, OfficeLocation } from '../types';

export type ActiveTab = 'floor-plan' | 'my-bookings' | 'meeting-rooms' | 'analytics' | 'admin-users' | 'admin-health';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: Role;
  bookingsCount: number;
  isCollapsed: boolean;
  selectedOffice?: OfficeLocation;
  onOpenOfficeModal?: () => void;
  onLogout?: () => void;
  onCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  bookingsCount,
  isCollapsed,
  selectedOffice = 'global-port',
  onOpenOfficeModal,
  onLogout,
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
            : 'w-64 translate-x-0 px-3 shadow-2xl'
        }`}
      >
      {/* Brand Header */}
      <div className="w-full">
        <div
          onClick={() => handleTabClick('floor-plan')}
          className="w-full cursor-pointer group mb-5"
          title="SmartDesk • Click to view Landing Page"
        >
          {isCollapsed ? (
            <div className="w-10 h-10 mx-auto rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all overflow-hidden border border-white/20">
              <img src="/harbinger-logo.webp" alt="Harbinger Group" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-1 py-1 group-hover:opacity-90 transition-opacity">
              <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-sm flex items-center justify-center border border-white/40 flex-shrink-0 group-hover:scale-105 transition-all">
                <img
                  src="/harbinger-logo.webp"
                  alt="Harbinger Group"
                  className="h-6 w-auto object-contain"
                />
              </div>
              <span className="font-bold text-white text-base tracking-tight group-hover:text-sky-300 transition-colors">
                SmartDesk
              </span>
            </div>
          )}
        </div>

        {/* Active Campus Switcher Pill */}
        {isCollapsed ? (
          <div
            onClick={() => onOpenOfficeModal && onOpenOfficeModal()}
            className={`w-10 h-10 mx-auto mb-4 rounded-xl border flex items-center justify-center cursor-pointer transition-all shadow-sm ${
              selectedOffice === 'siddhant'
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
                : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-sky-300'
            }`}
            title={`Active Campus: ${selectedOffice === 'siddhant' ? 'Siddhant' : 'Global Port'}. Click to switch.`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {selectedOffice === 'siddhant' ? 'location_city' : 'corporate_fare'}
            </span>
          </div>
        ) : (
          <div
            onClick={() => onOpenOfficeModal && onOpenOfficeModal()}
            className={`w-full mb-4 p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              selectedOffice === 'siddhant'
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.1)]'
            }`}
            title="Click to Switch Campus (Global Port / Siddhant)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px]">
                {selectedOffice === 'siddhant' ? 'location_city' : 'corporate_fare'}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">
                  {selectedOffice === 'siddhant' ? 'Siddhant Campus' : 'Global Port Campus'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedOffice === 'siddhant' ? '120 Desks • 4 Rooms' : '210 Desks • 8 Rooms'}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-xs text-slate-400 hover:text-white">sync_alt</span>
          </div>
        )}

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

          {/* Meeting Rooms */}
          <button
            onClick={() => handleTabClick('meeting-rooms')}
            title="Meeting Rooms Booking"
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
            } ${
              activeTab === 'meeting-rooms'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
              meeting_room
            </span>
            {!isCollapsed && <span>Meeting Rooms</span>}
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
              {!isCollapsed && <span>Workplace Analytics</span>}
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
        </nav>
      </div>

      {/* Footer Info & Actions */}
      <div className="w-full space-y-2">

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer border border-transparent hover:border-rose-500/30 hover:bg-rose-500/15 text-rose-400 ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
            }`}
          >
            <span className={`material-symbols-outlined text-[19px] ${!isCollapsed ? 'mr-3' : ''}`}>
              logout
            </span>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>
    </aside>
    </>
  );
};
