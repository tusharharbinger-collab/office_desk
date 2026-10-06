import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Role, OfficeLocation } from '../types';
import {
  getTodayISODate,
  getTomorrowISODate,
  formatDisplayDate,
  calculateDurationHours
} from '../utils/dateTime';
import { Avatar } from './Avatar';
import { OFFICES } from '../data/officeConfig';

interface HeaderProps {
  activeArea: 'area-1' | 'area-2';
  onAreaChange: (area: 'area-1' | 'area-2') => void;
  // Office location switcher
  selectedOffice?: OfficeLocation;
  onOfficeChange?: (office: OfficeLocation) => void;
  onOpenOfficeModal?: () => void;
  // Date & Time slot filtering
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedTimeSlot: string;
  onTimeSlotChange: (slotId: string, customStart?: string, customEnd?: string) => void;
  startTime: string;
  endTime: string;
  onCustomTimeChange?: (start: string, end: string) => void;
  // Current user & switchers
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onOpenRegister: () => void;
  occupancyRate: number;
  totalSeats: number;
  bookedSeats: number;
  // Unified controls from secondary bar (optional)
  scale?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Sidebar toggle
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  onOpenOutlookEmails?: () => void;
  emailCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeArea,
  onAreaChange,
  selectedOffice = 'global-port',
  onOfficeChange,
  onOpenOfficeModal,
  selectedDate,
  onDateChange,
  selectedTimeSlot,
  onTimeSlotChange,
  startTime,
  endTime,
  onCustomTimeChange,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenRegister,
  occupancyRate,
  totalSeats,
  bookedSeats,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed,
  onToggleSidebar,
  onLogout,
  activeTab,
  onTabChange,
  onOpenOutlookEmails,
  emailCount
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [officeDropdownOpen, setOfficeDropdownOpen] = useState(false);
  const dateTimeRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const officeMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateTimeRef.current && !dateTimeRef.current.contains(e.target as Node)) {
        setDateTimeOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (officeMenuRef.current && !officeMenuRef.current.contains(e.target as Node)) {
        setOfficeDropdownOpen(false);
      }
    }
    if (dateTimeOpen || userDropdownOpen || officeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dateTimeOpen, userDropdownOpen, officeDropdownOpen]);

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

  const todayIso = getTodayISODate();
  const tomorrowIso = getTomorrowISODate();

  return (
    <header
      className={`fixed top-0 right-0 h-14 z-40 bg-[#090D16]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex items-center justify-between px-2.5 sm:px-4 md:px-5 transition-all duration-200 select-none ${
        isSidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-64'
      }`}
    >
      {/* ========================================================
          LEFT ZONE: Sidebar Toggle + Segmented Area Switcher
         ======================================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm flex-shrink-0"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSidebarCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>

        {activeTab && activeTab !== 'floor-plan' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange && onTabChange('floor-plan')}
              className="inline-flex items-center gap-1.5 px-3 h-8.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-semibold cursor-pointer transition-all shadow-sm"
              title="Return to Floor Plan Map"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Floor Plan</span>
            </button>
            <div className="flex items-center gap-1.5 px-2.5 h-8.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
              <span>
                {activeTab === 'time-grid'
                  ? 'Time Grid Scheduler'
                  : activeTab === 'my-bookings'
                  ? 'My Bookings'
                  : activeTab === 'meeting-rooms'
                  ? 'Meeting Room Booking'
                  : activeTab === 'analytics'
                  ? 'Workplace Analytics'
                  : activeTab === 'admin-users'
                  ? 'Users Directory'
                  : activeTab === 'admin-health'
                  ? 'System Health'
                  : activeTab}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Campus / Office Location Capsule & Quick Switcher */}
            <div className="relative" ref={officeMenuRef}>
              <button
                type="button"
                onClick={() => setOfficeDropdownOpen(!officeDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                  selectedOffice === 'siddhant'
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
                }`}
                title="Switch Office Campus (Global Port / Siddhant)"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {selectedOffice === 'siddhant' ? 'location_city' : 'corporate_fare'}
                </span>
                <span className="whitespace-nowrap font-bold">
                  {selectedOffice === 'siddhant' ? 'Siddhant' : 'Global Port'}
                </span>
                <span className="material-symbols-outlined text-xs transition-transform duration-200">
                  {officeDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Office Switcher Dropdown Menu */}
              {officeDropdownOpen && (
                <div className="absolute top-11 left-0 z-50 w-72 rounded-2xl bg-[#0D121D] border border-white/[0.12] p-2 shadow-[0_15px_40px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-white/[0.06] mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Switch Office Campus
                    </span>
                  </div>

                  {/* Option 1: Global Port */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOfficeChange) onOfficeChange('global-port');
                      setOfficeDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between cursor-pointer mb-1 ${
                      selectedOffice === 'global-port'
                        ? 'bg-sky-500/20 border border-sky-400/30 text-white'
                        : 'hover:bg-white/[0.04] text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-sky-400 text-lg mt-0.5">corporate_fare</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">Global Port</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold">
                            Primary
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">210 Desks (130 + 80) • 8 Rooms</p>
                        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Full Blueprint Active
                        </span>
                      </div>
                    </div>
                    {selectedOffice === 'global-port' && (
                      <span className="material-symbols-outlined text-sky-400 text-base">check_circle</span>
                    )}
                  </button>

                  {/* Option 2: Siddhant */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOfficeChange) onOfficeChange('siddhant');
                      setOfficeDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between cursor-pointer ${
                      selectedOffice === 'siddhant'
                        ? 'bg-emerald-500/20 border border-emerald-400/30 text-white'
                        : 'hover:bg-white/[0.04] text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5">location_city</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">Siddhant</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                            New Campus
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">120 Desks (80 + 40) • 4 Rooms</p>
                        <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Blueprint Overlay Pending
                        </span>
                      </div>
                    </div>
                    {selectedOffice === 'siddhant' && (
                      <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
                    )}
                  </button>

                  {/* Campus Explorer Modal Button */}
                  {onOpenOfficeModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setOfficeDropdownOpen(false);
                        onOpenOfficeModal();
                      }}
                      className="w-full mt-1 pt-2 border-t border-white/[0.06] text-center text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center justify-center gap-1 py-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      <span>Compare Campus Specs...</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Segmented Area Switcher (Apple/Linear Style) */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-black/40 border border-white/[0.08] h-9 shadow-inner">
              <button
                onClick={() => onAreaChange('area-1')}
                className={`px-2.5 sm:px-3 h-7.5 rounded-[9px] text-xs transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                  activeArea === 'area-1'
                    ? selectedOffice === 'siddhant'
                      ? 'bg-emerald-500/20 text-emerald-200 font-semibold border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-sky-500/20 text-sky-200 font-semibold border border-sky-400/40 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] font-medium border border-transparent'
                }`}
              >
                <span>Area 1</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    activeArea === 'area-1'
                      ? selectedOffice === 'siddhant'
                        ? 'bg-emerald-400/25 text-emerald-200 font-bold'
                        : 'bg-sky-400/25 text-sky-200 font-bold'
                      : 'text-slate-500 bg-white/[0.04]'
                  }`}
                >
                  {selectedOffice === 'siddhant' ? '80' : '130'}
                </span>
              </button>

              <button
                onClick={() => onAreaChange('area-2')}
                className={`px-2.5 sm:px-3 h-7.5 rounded-[9px] text-xs transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                  activeArea === 'area-2'
                    ? selectedOffice === 'siddhant'
                      ? 'bg-emerald-500/20 text-emerald-200 font-semibold border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-sky-500/20 text-sky-200 font-semibold border border-sky-400/40 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] font-medium border border-transparent'
                }`}
              >
                <span>Area 2</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    activeArea === 'area-2'
                      ? selectedOffice === 'siddhant'
                        ? 'bg-emerald-400/25 text-emerald-200 font-bold'
                        : 'bg-sky-400/25 text-sky-200 font-bold'
                      : 'text-slate-500 bg-white/[0.04]'
                  }`}
                >
                  {selectedOffice === 'siddhant' ? '40' : '80'}
                </span>
              </button>
            </div>

            {/* Nav Bar Meeting Rooms Booking Button */}
            <button
              onClick={() => onTabChange && onTabChange('meeting-rooms')}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-sky-500/40 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all shadow-sm"
              title="Meeting Room Booking & Management"
            >
              <span className="material-symbols-outlined text-[17px] text-sky-400">meeting_room</span>
              <span className="hidden sm:inline">Meeting Rooms</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          CENTER ZONE: Omnibar Search (Centered, Non-squished)
         ======================================================== */}
      <div className="hidden md:flex items-center justify-center flex-1 min-w-0 px-2 lg:px-4">
        <div className="relative flex items-center h-9 w-full max-w-xs lg:max-w-sm xl:max-w-md rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.08] focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:bg-[#0c101a] transition-all px-3 shadow-inner">
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
            <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono text-slate-400 bg-white/[0.06] border border-white/[0.1] px-1.5 py-0.5 rounded shadow-inner flex-shrink-0">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {/* ========================================================
          RIGHT ZONE: Schedule + Live Stats + Store + Profile
         ======================================================== */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 flex-shrink-0" ref={userMenuRef}>
        {/* Interactive Date & Shift Selector Capsule */}
        <div className="relative" ref={dateTimeRef}>
          <button
            onClick={() => setDateTimeOpen(!dateTimeOpen)}
            className={`inline-flex items-center gap-1.5 sm:gap-2 h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-sm group ${
              dateTimeOpen
                ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-[0_0_14px_rgba(14,165,233,0.2)]'
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] hover:border-sky-500/40 text-slate-300'
            }`}
            title="Filter desk allocation by exact date and time window"
          >
            <span className="material-symbols-outlined text-[17px] text-sky-400 group-hover:scale-110 transition-transform flex-shrink-0">
              calendar_month
            </span>
            <span className="font-semibold text-slate-200 hidden xl:inline">
              {formatDisplayDate(selectedDate)}
            </span>
            <span className="font-semibold text-slate-200 xl:hidden">
              {formatDisplayDate(selectedDate).split(',')[0]}
            </span>
            <span className="text-white/20 font-light hidden sm:inline">•</span>
            <span className="text-sky-300/90 font-mono text-[11px] font-medium hidden sm:inline">
              {startTime}–{endTime}
            </span>
            <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-200 transition-colors flex-shrink-0">
              expand_more
            </span>
          </button>

          {/* Date & Time Selector Dropdown Modal */}
          {dateTimeOpen && (
            <div
              style={{ backgroundColor: '#131826' }}
              className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-[340px] bg-[#131826] border border-slate-700/80 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 leading-tight">Allocation Schedule</h4>
                    <p className="text-[10px] text-slate-400">View desk status for chosen window</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDateTimeOpen(false)}
                  className="w-6 h-6 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Close schedule filter"
                >
                  ✕
                </button>
              </div>

              {/* 1. Date Selection */}
              <div className="mb-3.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                  1. Reservation Date
                </label>
                <div className="flex items-center gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => onDateChange(todayIso)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      selectedDate === todayIso
                        ? 'bg-sky-500/20 text-sky-200 border-sky-400/60 font-semibold shadow-sm'
                        : 'bg-[#1c2233] text-slate-300 hover:text-white border-slate-700/60 hover:bg-[#232b40]'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => onDateChange(tomorrowIso)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      selectedDate === tomorrowIso
                        ? 'bg-sky-500/20 text-sky-200 border-sky-400/60 font-semibold shadow-sm'
                        : 'bg-[#1c2233] text-slate-300 hover:text-white border-slate-700/60 hover:bg-[#232b40]'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) onDateChange(e.target.value);
                    }}
                    className="w-full bg-[#0d111a] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Manual Time In & Time Out Selection */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    2. Time In & Time Out
                  </label>
                  <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/15 border border-sky-400/30 px-2 py-0.5 rounded-lg">
                    {calculateDurationHours(startTime, endTime)} hrs
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0d111a] border border-slate-700/60 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-1 font-mono uppercase flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs text-emerald-400">login</span>
                        <span>Time In</span>
                      </span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            if (onCustomTimeChange) onCustomTimeChange(val, endTime);
                            else onTimeSlotChange('custom', val, endTime);
                          }
                        }}
                        className="w-full bg-[#1c2233] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-sky-400 focus:outline-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 block mb-1 font-mono uppercase flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs text-rose-400">logout</span>
                        <span>Time Out</span>
                      </span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            if (onCustomTimeChange) onCustomTimeChange(startTime, val);
                            else onTimeSlotChange('custom', startTime, val);
                          }
                        }}
                        className="w-full bg-[#1c2233] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-sky-400 focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono text-center pt-0.5">
                    Viewing floor availability for {startTime} – {endTime}
                  </p>
                </div>
              </div>

              {/* Status explanation */}
              <div className="p-2.5 rounded-xl bg-[#0d111a] border border-slate-700/60 text-[10px] text-slate-400 leading-tight mb-3.5 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400 flex-shrink-0 mt-0.5">
                  sync
                </span>
                <span>Desks reflect dynamic availability for this slot. Expired bookings de-allocate automatically.</span>
              </div>

              <button
                type="button"
                onClick={() => setDateTimeOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
              >
                Apply Schedule Filter
              </button>
            </div>
          )}
        </div>

        {/* Live Occupancy Pill */}
        <div
          className="hidden md:inline-flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-xs text-emerald-300 font-medium whitespace-nowrap shadow-sm"
          title={`${bookedSeats} of ${totalSeats} desks reserved (${occupancyRate}% occupancy)`}
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold">{occupancyRate}%</span>
          <span className="text-emerald-400/60 font-mono text-[11px] hidden xl:inline">
            ({bookedSeats}/{totalSeats})
          </span>
        </div>

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
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
              showStatus={true}
              status="online"
              rounded="rounded-lg"
            />

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[85px] lg:max-w-[105px] leading-tight group-hover:text-white">
                {currentUser.name}
              </span>
              <span
                className={`text-[8px] font-mono uppercase font-bold px-1 py-0 rounded border w-fit leading-tight mt-0.5 ${getRoleBadge(
                  currentUser.role
                )}`}
              >
                {currentUser.role}
              </span>
            </div>

            <span className="material-symbols-outlined text-slate-400 text-xs group-hover:text-slate-200 transition-colors">
              expand_more
            </span>
          </button>

          {/* User Switcher Dropdown */}
          {userDropdownOpen && (
            <div
              style={{ backgroundColor: '#131826' }}
              className="absolute right-0 mt-2 w-72 bg-[#131826] border border-slate-700/80 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* User Identity Header */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0d111a] border border-slate-700/60 mb-2.5">
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="lg"
                  rounded="rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  <span
                    className={`inline-block text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border mt-1 ${getRoleBadge(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Role Switcher */}
              <div className="px-2 py-1 mb-1">
                <p className="text-[10px] text-slate-400 font-semibold uppercase font-mono tracking-wider">
                  Switch Active Profile
                </p>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      currentUser.id === user.id
                        ? 'bg-sky-500/15 border border-sky-500/30'
                        : 'hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="sm"
                      rounded="rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`text-[8px] font-mono uppercase font-bold px-1 py-0.5 rounded border ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="pt-2.5 mt-2 border-t border-white/[0.08] space-y-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenRegister();
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Create New Account</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full py-1.5 px-3 rounded-xl hover:bg-rose-500/15 text-rose-400 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
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
