import React, { useState, useMemo } from 'react';
import { Desk, UserProfile, Booking, Room, OfficeLocation } from '../types';
import { Avatar } from './Avatar';
import {
  exportAttendanceReport,
  exportEmployeeUtilizationLog,
  exportZoneEfficiencyReport,
  exportMeetingRoomReport
} from '../utils/csvExport';

interface ManagerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  area1Desks: Desk[];
  area2Desks: Desk[];
  onLocateSeat: (areaId: 'area-1' | 'area-2', deskId: string) => void;
  onReleaseSeat: (deskId: string) => void;
  users?: UserProfile[];
  onBookForUser?: (user: UserProfile) => void;
  bookings?: Booking[];
  selectedDate?: string;
  rooms?: Room[];
  isPageView?: boolean;
  selectedOffice?: OfficeLocation;
}

type MainTab = 'reports' | 'presence' | 'utilization' | 'assign';
type ReportType = 'attendance' | 'utilization' | 'zones' | 'rooms';

export const ManagerAnalyticsModal: React.FC<ManagerAnalyticsModalProps> = ({
  isOpen,
  onClose,
  area1Desks,
  area2Desks,
  onLocateSeat,
  onReleaseSeat,
  users = [],
  onBookForUser,
  bookings = [],
  selectedDate = new Date().toISOString().split('T')[0],
  rooms = [],
  isPageView = true,
  selectedOffice = 'global-port'
}) => {
  if (!isOpen) return null;

  // Active view state
  const [activeTab, setActiveTab] = useState<MainTab>('reports');
  const [selectedReport, setSelectedReport] = useState<ReportType>('attendance');

  // Filters & Search
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setDownloadSuccessToast(msg);
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  // Combine desks
  const allDesks = useMemo(() => [...area1Desks, ...area2Desks], [area1Desks, area2Desks]);
  const occupiedDesks = useMemo(() => allDesks.filter((d) => d.status === 'booked' && d.occupant), [allDesks]);

  // Desk Counts & Rates
  const area1Occupied = useMemo(() => area1Desks.filter((d) => d.status === 'booked').length, [area1Desks]);
  const area2Occupied = useMemo(() => area2Desks.filter((d) => d.status === 'booked').length, [area2Desks]);
  const totalOccupied = area1Occupied + area2Occupied;
  const overallRate = Math.round((totalOccupied / (allDesks.length || 1)) * 100);
  const area1Rate = Math.round((area1Occupied / (area1Desks.length || 1)) * 100);
  const area2Rate = Math.round((area2Occupied / (area2Desks.length || 1)) * 100);

  // Employee Counts
  const totalEmployees = users.length;
  const activeEmployees = users.filter((u) => u.active).length;

  // Check-In stats
  const checkedInBookingsCount = useMemo(
    () => bookings.filter((b) => b.checkInStatus && b.status === 'active').length,
    [bookings]
  );
  const pendingCheckInCount = Math.max(0, totalOccupied - checkedInBookingsCount);
  const checkInRatePct = totalOccupied > 0 ? Math.round((checkedInBookingsCount / totalOccupied) * 100) : 100;

  // Filtered occupants for Live Presence Tab
  const filteredOccupants = useMemo(() => {
    return occupiedDesks.filter((d) => {
      if (!searchFilter) return true;
      const q = searchFilter.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.occupant?.name.toLowerCase().includes(q) ||
        d.occupant?.role.toLowerCase().includes(q)
      );
    });
  }, [occupiedDesks, searchFilter]);

  // Zone & Pod Aggregation
  const podEfficiencyData = useMemo(() => {
    const map = new Map<string, {
      area: string;
      zone: string;
      pod: string;
      total: number;
      booked: number;
      amenities: string;
    }>();

    allDesks.forEach((d) => {
      const key = `${d.areaId}_${d.podName}`;
      if (!map.has(key)) {
        map.set(key, {
          area: d.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2',
          zone: d.zoneName,
          pod: d.podName,
          total: 0,
          booked: 0,
          amenities: d.amenities.slice(0, 2).join(', ')
        });
      }
      const p = map.get(key)!;
      p.total++;
      if (d.status === 'booked') p.booked++;
    });

    return Array.from(map.values()).map((p) => ({
      ...p,
      available: p.total - p.booked,
      utilizationPct: Math.round((p.booked / (p.total || 1)) * 100)
    }));
  }, [allDesks]);

  // Export Handlers
  const handleDownloadAttendanceCSV = () => {
    exportAttendanceReport(allDesks, selectedDate);
    triggerToast(`✓ Daily Attendance Report exported as CSV (${selectedDate})`);
  };

  const handleDownloadUtilizationCSV = () => {
    exportEmployeeUtilizationLog(bookings, users);
    triggerToast(`✓ Employee Workstation Utilization Log exported as CSV`);
  };

  const handleDownloadZoneEfficiencyCSV = () => {
    exportZoneEfficiencyReport(allDesks, selectedDate);
    triggerToast(`✓ Zone & Pod Capacity Efficiency Report exported as CSV`);
  };

  const handleDownloadMeetingRoomsCSV = () => {
    exportMeetingRoomReport(rooms, bookings, selectedDate);
    triggerToast(`✓ Meeting Rooms & Boardroom Reservation Audit exported as CSV`);
  };

  const handleDownloadAllReports = () => {
    exportAttendanceReport(allDesks, selectedDate);
    setTimeout(() => exportEmployeeUtilizationLog(bookings, users), 250);
    setTimeout(() => exportZoneEfficiencyReport(allDesks, selectedDate), 500);
    setTimeout(() => exportMeetingRoomReport(rooms, bookings, selectedDate), 750);
    triggerToast(`✓ All 4 Workplace Reports exported as individual CSV files!`);
  };

  const modalBody = (
    <div className="bg-[#0f141f] border border-slate-700/80 rounded-3xl w-full flex flex-col shadow-2xl overflow-hidden text-slate-100 flex-1">
      {/* Modal / Page Header */}
      <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-black/30">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_16px_rgba(52,211,153,0.25)] flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">analytics</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Manager Workplace Analytics
              </h2>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase flex items-center gap-1 border ${
                  selectedOffice === 'siddhant'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-sky-500/15 text-sky-300 border-sky-400/30'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {selectedOffice === 'siddhant' ? 'location_city' : 'corporate_fare'}
                </span>
                <span>{selectedOffice === 'siddhant' ? 'Siddhant' : 'Global Port'}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-mono font-bold uppercase tracking-wider">
                Live Watch
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor headcount, space utilization, and generate official CSV reports for workplace planning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAllReports}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-400/30 hover:bg-sky-500/25 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Download full 4-report CSV package"
          >
            <span className="material-symbols-outlined text-sm text-sky-400">download</span>
            <span>Export All (4 CSVs)</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/[0.1] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Return to Map"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            <span>Floor Plan</span>
          </button>
        </div>
      </div>

        {/* Live Executive KPI Watch Cards */}
        <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-b border-white/[0.06] bg-black/20">
          {/* Card 1: Total Employees */}
          <div className="bg-[#151a27] p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-sm">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono">
              <span>Employee Headcount</span>
              <span className="material-symbols-outlined text-xs text-sky-400">groups</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{totalEmployees}</span>
              <span className="text-xs text-emerald-400 font-mono">({activeEmployees} Active)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{occupiedDesks.length} in office on {selectedDate}</span>
            </p>
          </div>

          {/* Card 2: Space Occupancy */}
          <div className="bg-[#151a27] p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-sm">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono">
              <span>Overall Occupancy</span>
              <span className="material-symbols-outlined text-xs text-emerald-400">chair</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">{overallRate}%</span>
              <span className="text-xs text-slate-400 font-mono">({totalOccupied} / {allDesks.length})</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                style={{ width: `${Math.min(overallRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Floor Breakdown */}
          <div className="bg-[#151a27] p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-sm">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono">
              <span>Floor Utilization</span>
              <span className="material-symbols-outlined text-xs text-sky-400">domain</span>
            </div>
            <div className="mt-1 space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Area 1 (130):</span>
                <span className="text-sky-300 font-bold">{area1Rate}% ({area1Occupied})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Area 2 (80):</span>
                <span className="text-amber-300 font-bold">{area2Rate}% ({area2Occupied})</span>
              </div>
            </div>
          </div>

          {/* Card 4: Check-In Compliance */}
          <div className="bg-[#151a27] p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-sm">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono">
              <span>Check-in Verification</span>
              <span className="material-symbols-outlined text-xs text-emerald-400">verified</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{checkInRatePct}%</span>
              <span className="text-xs text-slate-400 font-mono">Verified</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span className="text-emerald-400">{checkedInBookingsCount} Checked in</span>
              <span className="text-amber-400">{pendingCheckInCount} Pending</span>
            </p>
          </div>
        </div>

        {/* Download Feedback Banner */}
        {downloadSuccessToast && (
          <div className="bg-emerald-500/15 border-y border-emerald-500/30 px-6 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
            <span className="font-medium">{downloadSuccessToast}</span>
          </div>
        )}

        {/* Main Tab Navigation */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 bg-black/10">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-sky-400">table_view</span>
              <span>Reports & CSV Downloads</span>
            </button>

            <button
              onClick={() => setActiveTab('presence')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'presence'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">group</span>
              <span>Live Attendance ({occupiedDesks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('utilization')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'utilization'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Hourly Peak Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('assign')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'assign'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">event_seat</span>
              <span>Assign Seats to Team</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ========================================================
              TAB 1: WORKPLACE REPORTS & CSV EXPORT CENTER
             ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {/* Report Sub-tabs / Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'attendance', label: '1. Daily Attendance', icon: 'badge', desc: 'Seated employees & desks' },
                  { id: 'utilization', label: '2. Utilization Log', icon: 'history', desc: 'All bookings & check-ins' },
                  { id: 'zones', label: '3. Zone & Pod Efficiency', icon: 'grid_view', desc: 'Capacity per cluster' },
                  { id: 'rooms', label: '4. Meeting Rooms Audit', icon: 'meeting_room', desc: 'Boardrooms & cabins' }
                ].map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep.id as ReportType)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      selectedReport === rep.id
                        ? 'bg-sky-500/15 border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.15)] ring-1 ring-sky-400/40'
                        : 'bg-[#151a27] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-[#1c2333]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-base text-sky-400">{rep.icon}</span>
                      <span className="text-xs font-semibold text-white truncate">{rep.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{rep.desc}</p>
                  </button>
                ))}
              </div>

              {/* Active Report Header with Direct 1-Click Download Button */}
              <div className="p-4 rounded-2xl bg-[#141926] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {selectedReport === 'attendance' && 'Daily Occupancy & Attendance Roster'}
                      {selectedReport === 'utilization' && 'Complete Employee Workstation Utilization Log'}
                      {selectedReport === 'zones' && 'Workstation Zone & Pod Capacity Efficiency'}
                      {selectedReport === 'rooms' && 'Meeting Rooms & Boardroom Reservation Audit'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/30">
                      RFC-4180 CSV
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedReport === 'attendance' && 'Live attendance records of which employee is occupying which desk for this date.'}
                    {selectedReport === 'utilization' && 'Historical and upcoming booking records, shift hours, and check-in statuses.'}
                    {selectedReport === 'zones' && 'Capacity utilization across North Pods, West Wall, Center Pods, and Executive Suites.'}
                    {selectedReport === 'rooms' && 'Conference and meeting room bookings, capacity limits, and organizers.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedReport === 'attendance' && (
                    <button
                      onClick={handleDownloadAttendanceCSV}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Download Attendance CSV</span>
                    </button>
                  )}
                  {selectedReport === 'utilization' && (
                    <button
                      onClick={handleDownloadUtilizationCSV}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Download Utilization CSV</span>
                    </button>
                  )}
                  {selectedReport === 'zones' && (
                    <button
                      onClick={handleDownloadZoneEfficiencyCSV}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Download Zone Efficiency CSV</span>
                    </button>
                  )}
                  {selectedReport === 'rooms' && (
                    <button
                      onClick={handleDownloadMeetingRoomsCSV}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Download Meeting Rooms CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="bg-[#121622] rounded-2xl border border-white/[0.08] overflow-hidden">
                <div className="p-3 bg-black/30 border-b border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono uppercase text-[11px] font-semibold text-slate-300">
                    Live Data Preview (Export includes all columns)
                  </span>
                  <span className="font-mono text-[11px]">
                    {selectedReport === 'attendance' && `${occupiedDesks.length} Seated Records`}
                    {selectedReport === 'utilization' && `${bookings.length} Booking Entries`}
                    {selectedReport === 'zones' && `${podEfficiencyData.length} Pod Clusters`}
                    {selectedReport === 'rooms' && `${rooms.length} Meeting Rooms`}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[360px]">
                  {/* Attendance Preview */}
                  {selectedReport === 'attendance' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#181f2e] text-[10px] font-mono text-slate-400 uppercase sticky top-0">
                        <tr>
                          <th className="p-3">Seat ID</th>
                          <th className="p-3">Employee</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Zone / Pod</th>
                          <th className="p-3">Area</th>
                          <th className="p-3">Shift Hours</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {occupiedDesks.slice(0, 10).map((d) => (
                          <tr key={d.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-mono font-bold text-sky-300">{d.id}</td>
                            <td className="p-3 font-semibold text-white">{d.occupant?.name}</td>
                            <td className="p-3 text-slate-300 font-mono text-[11px]">{d.occupant?.role}</td>
                            <td className="p-3 text-slate-400">{d.podName}</td>
                            <td className="p-3 text-slate-400">{d.areaId === 'area-1' ? 'Area 1' : 'Area 2'}</td>
                            <td className="p-3 font-mono text-emerald-400">{d.occupant?.bookedTime || '09:00 - 17:00'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/30">
                                Occupied
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Utilization Log Preview */}
                  {selectedReport === 'utilization' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#181f2e] text-[10px] font-mono text-slate-400 uppercase sticky top-0">
                        <tr>
                          <th className="p-3">Booking ID</th>
                          <th className="p-3">Employee</th>
                          <th className="p-3">Desk ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Time Window</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Check-In</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {bookings.slice(0, 10).map((b) => (
                          <tr key={b.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-mono text-slate-400">{b.id.substring(0, 14)}...</td>
                            <td className="p-3 font-semibold text-white">{b.userName}</td>
                            <td className="p-3 font-mono font-bold text-sky-300">{b.deskId}</td>
                            <td className="p-3 font-mono text-slate-300">{b.date}</td>
                            <td className="p-3 font-mono text-emerald-400">{b.startTime} - {b.endTime}</td>
                            <td className="p-3 text-slate-400">{b.duration}</td>
                            <td className="p-3">
                              {b.checkInStatus ? (
                                <span className="text-emerald-400 font-mono text-[11px] font-semibold">✓ Verified</span>
                              ) : (
                                <span className="text-amber-400 font-mono text-[11px]">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Zone Efficiency Preview */}
                  {selectedReport === 'zones' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#181f2e] text-[10px] font-mono text-slate-400 uppercase sticky top-0">
                        <tr>
                          <th className="p-3">Zone / Cluster</th>
                          <th className="p-3">Area</th>
                          <th className="p-3">Total Desks</th>
                          <th className="p-3">Booked</th>
                          <th className="p-3">Available</th>
                          <th className="p-3">Capacity %</th>
                          <th className="p-3">Key Amenities</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {podEfficiencyData.slice(0, 10).map((p) => (
                          <tr key={`${p.area}_${p.pod}`} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-semibold text-white">{p.pod}</td>
                            <td className="p-3 text-slate-400">{p.area}</td>
                            <td className="p-3 font-mono text-slate-300">{p.total}</td>
                            <td className="p-3 font-mono text-rose-400 font-semibold">{p.booked}</td>
                            <td className="p-3 font-mono text-emerald-400 font-semibold">{p.available}</td>
                            <td className="p-3 font-mono font-bold text-amber-300">{p.utilizationPct}%</td>
                            <td className="p-3 text-slate-400 text-[11px]">{p.amenities}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Meeting Rooms Preview */}
                  {selectedReport === 'rooms' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#181f2e] text-[10px] font-mono text-slate-400 uppercase sticky top-0">
                        <tr>
                          <th className="p-3">Room Code</th>
                          <th className="p-3">Room Name</th>
                          <th className="p-3">Area</th>
                          <th className="p-3">Capacity</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Reserved By</th>
                          <th className="p-3">Amenities</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {rooms.map((r) => (
                          <tr key={r.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-mono font-bold text-sky-400">{r.code}</td>
                            <td className="p-3 font-semibold text-white">{r.name}</td>
                            <td className="p-3 text-slate-400">{r.areaId === 'area-1' ? 'Area 1' : 'Area 2'}</td>
                            <td className="p-3 font-mono text-slate-300">{r.capacity} Persons</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                                r.status === 'occupied'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {r.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{r.occupant?.name || 'Available for booking'}</td>
                            <td className="p-3 text-slate-400 text-[11px]">{r.amenities.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: LIVE PRESENCE & ATTENDANCE WATCH
             ======================================================== */}
          {activeTab === 'presence' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#151a27] rounded-2xl border border-white/[0.08]">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Search by employee, seat ID, or role..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="text-slate-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadAttendanceCSV}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export Attendance CSV</span>
                  </button>
                </div>
              </div>

              {/* Occupants Roster Table */}
              <div className="grid grid-cols-12 text-[11px] font-mono text-slate-400 uppercase px-4 py-1 border-b border-white/[0.08]">
                <span className="col-span-4">Employee & Role</span>
                <span className="col-span-4">Assigned Workstation</span>
                <span className="col-span-3">Duration Left</span>
                <span className="col-span-1 text-right">Actions</span>
              </div>

              {filteredOccupants.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active workstation reservations match your filter.
                </div>
              ) : (
                filteredOccupants.map((desk) => {
                  const occ = desk.occupant!;
                  return (
                    <div
                      key={desk.id}
                      className="grid grid-cols-12 items-center bg-[#151a27] hover:bg-[#1a2133] p-3.5 rounded-2xl border border-white/[0.06] transition-all text-xs"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar
                          src={occ.avatar}
                          name={occ.name}
                          size="md"
                          rounded="rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-white">{occ.name}</p>
                          <p className="text-[11px] text-slate-400">{occ.role}</p>
                        </div>
                      </div>

                      <div className="col-span-4">
                        <span className="font-mono font-bold text-white mr-2">{desk.id}</span>
                        <span className="text-[11px] text-slate-400">
                          ({desk.areaId === 'area-1' ? 'Area 1' : 'Area 2'}) • {desk.podName}
                        </span>
                      </div>

                      <div className="col-span-3 font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                        <span>{occ.hoursRemaining} remaining</span>
                      </div>

                      <div className="col-span-1 flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onLocateSeat(desk.areaId, desk.id);
                            onClose();
                          }}
                          title="Locate on Map"
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/30 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">my_location</span>
                        </button>
                        <button
                          onClick={() => onReleaseSeat(desk.id)}
                          title="Force Release Ghost Seat"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-400/30 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">person_remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ========================================================
              TAB 4: HOURLY PEAK TRENDS
             ======================================================== */}
          {activeTab === 'utilization' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase font-mono">
                    Hourly Workplace Occupancy Distribution (Today)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live telemetry across Work Area 1 (130 desks) and Work Area 2 (80 desks).
                  </p>
                </div>
                <button
                  onClick={handleDownloadUtilizationCSV}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-400/30 hover:bg-sky-500/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Export Peak Trends CSV</span>
                </button>
              </div>

              <div className="h-56 flex items-end justify-between gap-3 pt-8 pb-4 border-b border-white/[0.08] px-4 bg-black/20 rounded-2xl">
                {[
                  { hour: '08:00', pct: 25 },
                  { hour: '09:00', pct: 60 },
                  { hour: '10:00', pct: 85 },
                  { hour: '11:00', pct: 92 },
                  { hour: '12:00', pct: 88 },
                  { hour: '13:00', pct: 72 },
                  { hour: '14:00', pct: 90 },
                  { hour: '15:00', pct: 94 },
                  { hour: '16:00', pct: 82 },
                  { hour: '17:00', pct: 65 },
                  { hour: '18:00', pct: 35 },
                  { hour: '19:00', pct: 15 }
                ].map((slot) => (
                  <div key={slot.hour} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{slot.pct}%</span>
                    <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden h-40 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-sky-500 to-emerald-400 rounded-t-lg transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                        style={{ height: `${slot.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {slot.hour}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400 text-base">energy_savings_leaf</span>
                  <span>Peak Demand Window: <strong>10:30 AM – 3:30 PM</strong>. HVAC and lighting schedules automatically tuned for energy conservation.</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">OPTIMAL</span>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: ASSIGN SEATS TO TEAM MEMBERS
             ======================================================== */}
          {activeTab === 'assign' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-xs mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sky-400 text-base">info</span>
                  <span className="text-slate-300">
                    Managers can allocate dedicated workstations for any employee below. Click <strong>"Assign Desk"</strong> and pick any available desk on the map.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 text-[11px] font-mono text-slate-400 uppercase px-4 py-1 border-b border-white/[0.08]">
                <span className="col-span-5">Employee</span>
                <span className="col-span-4">Current Desk Status</span>
                <span className="col-span-3 text-right">Action</span>
              </div>

              {users
                .filter((u) => u.role === 'user' && u.active)
                .map((emp) => {
                  const assignedDesk = allDesks.find(
                    (d) => d.status === 'booked' && d.occupant?.name === emp.name
                  );

                  return (
                    <div
                      key={emp.id}
                      className="grid grid-cols-12 items-center bg-[#151a27] hover:bg-[#1a2133] p-3.5 rounded-2xl border border-white/[0.06] transition-all text-xs"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <Avatar
                          src={emp.avatar}
                          name={emp.name}
                          size="md"
                          rounded="rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-white">{emp.name}</p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>

                      <div className="col-span-4">
                        {assignedDesk ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
                            <span className="font-mono font-bold text-white">{assignedDesk.id}</span>
                            <span className="text-[11px] text-slate-400">({assignedDesk.podName})</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-semibold uppercase">
                            No Desk Assigned
                          </span>
                        )}
                      </div>

                      <div className="col-span-3 flex justify-end">
                        {onBookForUser && (
                          <button
                            onClick={() => onBookForUser(emp)}
                            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">event_seat</span>
                            <span>{assignedDesk ? 'Reassign' : 'Assign Desk'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex flex-wrap justify-between items-center text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-base text-emerald-400">verified</span>
            <span>Manager Reports Engine • Compliant with Real Estate Occupancy Standards</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllReports}
              className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-sm text-sky-400">folder_zip</span>
              <span>Download All 4 Reports</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold cursor-pointer transition-all"
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
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-6xl max-h-[92vh] flex flex-col w-full">
        {modalBody}
      </div>
    </div>
  );
};
