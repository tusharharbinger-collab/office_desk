import React, { useState, useMemo } from 'react';
import { Desk, OfficeLocation } from '../types';

interface TimeGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeArea: 'area-1' | 'area-2';
  desks: Desk[];
  onSelectDesk: (desk: Desk) => void;
  isPageView?: boolean;
  onAreaChange?: (area: 'area-1' | 'area-2') => void;
  selectedDate?: string;
  selectedOffice?: OfficeLocation;
}

export const TimeGridModal: React.FC<TimeGridModalProps> = ({
  isOpen,
  onClose,
  activeArea,
  desks,
  onSelectDesk,
  isPageView = true,
  onAreaChange,
  selectedDate = new Date().toISOString().split('T')[0],
  selectedOffice = 'global-port'
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'booked'>('all');

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Filter desks by search and status
  const filteredDesks = useMemo(() => {
    return desks.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.podName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.occupant && d.occupant.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'available'
          ? d.status === 'available'
          : d.status === 'booked';

      return matchesSearch && matchesStatus;
    });
  }, [desks, searchQuery, statusFilter]);

  const availableCount = desks.filter((d) => d.status === 'available').length;
  const bookedCount = desks.filter((d) => d.status === 'booked').length;
  const occupancyRate = Math.round((bookedCount / (desks.length || 1)) * 100);

  const content = (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Top Page Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#121724]/90 border border-white/[0.08] shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] flex-shrink-0">
            <span className="material-symbols-outlined text-[26px]">schedule</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Workspace / Timelines
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
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
                <span>{selectedOffice === 'siddhant' ? 'Siddhant Campus' : 'Global Port Campus'}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.1] font-mono font-bold uppercase">
                Hourly Matrix
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Time Grid Matrix Scheduler
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live hourly occupancy timeline, shift overlaps, and direct slot booking for {selectedDate}.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Area Switcher if provided */}
          {onAreaChange && (
            <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08]">
              <button
                onClick={() => onAreaChange('area-1')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeArea === 'area-1'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Work Area 1
              </button>
              <button
                onClick={() => onAreaChange('area-2')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeArea === 'area-2'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Work Area 2
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            <span>Floor Plan Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Total Workstations</span>
            <span className="material-symbols-outlined text-xs text-sky-400">desktop_windows</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{desks.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {activeArea === 'area-1' ? 'Work Area 1 (Main Floor)' : 'Work Area 2 (Room 2)'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Open & Available</span>
            <span className="material-symbols-outlined text-xs text-emerald-400">check_circle</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{availableCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Ready for 1-click booking</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Occupied Workstations</span>
            <span className="material-symbols-outlined text-xs text-rose-400">person</span>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{bookedCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active team reservations</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Occupancy Velocity</span>
            <span className="material-symbols-outlined text-xs text-amber-400">trending_up</span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-300 mt-1">{occupancyRate}%</p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-amber-400"
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#121724] border border-white/[0.08]">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 focus-within:border-sky-500/50">
          <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Search by Desk ID, Pod (e.g. Pod 1), or occupant..."
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

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({desks.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'available'
                  ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Open ({availableCount})
            </button>
            <button
              onClick={() => setStatusFilter('booked')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'booked'
                  ? 'bg-rose-500/20 text-rose-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Booked ({bookedCount})
            </button>
          </div>

          {/* Legend */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-400 pl-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400" />
              Open Slot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-400" />
              Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400" />
              Hold / Reserved
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Matrix Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121724] overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[62vh]">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-[#0e121a] z-10 border-b border-white/[0.1] shadow-md">
              <tr>
                <th className="text-left font-mono font-semibold text-slate-400 uppercase py-3.5 px-4 w-48 min-w-[190px]">
                  Workstation Station
                </th>
                <th className="text-left font-mono font-semibold text-slate-400 uppercase py-3.5 px-3 w-36 min-w-[140px]">
                  Zone / Cluster
                </th>
                {hours.map((h) => (
                  <th
                    key={h}
                    className="text-center font-mono text-slate-300 py-3.5 px-1.5 min-w-[62px] border-l border-white/[0.04]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredDesks.length === 0 ? (
                <tr>
                  <td colSpan={hours.length + 2} className="py-16 text-center text-slate-400 text-xs">
                    No workstations match your search filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDesks.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-400/20 text-xs">
                          {d.id}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Seat {d.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {d.podName}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-300 font-medium truncate block">
                        {d.zoneName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {d.amenities.slice(0, 2).join(', ')}
                      </span>
                    </td>

                    {hours.map((h, i) => {
                      const isOccupied = d.status === 'booked' && i >= 1 && i <= 8;
                      const isHold = d.status === 'hold' && i >= 3 && i <= 6;

                      return (
                        <td
                          key={h}
                          className="py-2.5 px-1 text-center border-l border-white/[0.03]"
                        >
                          <div
                            onClick={() => {
                              if (!isOccupied) {
                                onSelectDesk(d);
                              }
                            }}
                            className={`h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all font-mono text-[10px] font-semibold ${
                              isOccupied
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35 cursor-not-allowed shadow-inner'
                                : isHold
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 hover:scale-[1.03] shadow-[0_0_8px_rgba(52,211,153,0.15)]'
                            }`}
                            title={
                              isOccupied
                                ? `Occupied by ${d.occupant?.name || 'Staff'}`
                                : `Click to reserve ${d.id} at ${h}`
                            }
                          >
                            {isOccupied ? 'Booked' : isHold ? 'Hold' : 'Open'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0c1017] flex flex-wrap justify-between items-center text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-emerald-400">tips_and_updates</span>
            <span>
              Click any green <strong>'Open'</strong> slot to select that workstation and open the booking console.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400">Showing {filteredDesks.length} desks</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              Return to Map View
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // If page view mode, render directly without the modal backdrop!
  if (isPageView) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#090D16] p-4 sm:p-6 lg:p-8 flex flex-col animate-in fade-in duration-150">
        {content}
      </div>
    );
  }

  // Backwards-compatible modal mode
  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 p-6 overflow-hidden">
        {content}
      </div>
    </div>
  );
};
