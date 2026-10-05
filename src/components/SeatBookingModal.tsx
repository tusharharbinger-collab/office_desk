import React, { useState, useMemo, useEffect } from 'react';
import { Desk, UserProfile, Booking } from '../types';
import {
  getTodayISODate,
  getTomorrowISODate,
  formatDisplayDate,
  addDaysToDate,
  isWeekend,
  getWeekdayShort,
  generateDateRange,
  getNextWorkdays,
  getWorkweekDates,
  calculateDurationHours,
  formatDurationLabel
} from '../utils/dateTime';
import { Avatar } from './Avatar';

interface SeatBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  desk: Desk | null;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialDuration?: string;
  currentUser: UserProfile;
  users: UserProfile[];
  bookings: Booking[];
  allBookings: Booking[];
  onConfirmBooking: (params: {
    dates: string[];
    duration: string;
    startTime: string;
    endTime: string;
    targetUser?: UserProfile | null;
  }) => Promise<void>;
  selectedTargetUser: UserProfile | null;
  onSelectTargetUser: (user: UserProfile) => void;
}

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  isOpen,
  onClose,
  desk,
  initialDate,
  initialStartTime = '09:00',
  initialEndTime = '17:00',
  initialDuration = 'Full Day (8h)',
  currentUser,
  users,
  allBookings,
  onConfirmBooking,
  selectedTargetUser,
  onSelectTargetUser
}) => {
  if (!isOpen || !desk) return null;

  const todayIso = getTodayISODate();
  const tomorrowIso = getTomorrowISODate();

  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';
  const eligibleEmployees = useMemo(() => users.filter((u) => u.role === 'user' && u.active), [users]);

  // Mode: 'single' vs 'multi'
  const [bookingMode, setBookingMode] = useState<'single' | 'multi'>('single');

  // Single Day state
  const [singleDate, setSingleDate] = useState<string>(initialDate || todayIso);

  // Multi-Day state
  const [rangeStart, setRangeStart] = useState<string>(initialDate || todayIso);
  const [rangeEnd, setRangeEnd] = useState<string>(() => addDaysToDate(initialDate || todayIso, 4));
  const [excludeWeekends, setExcludeWeekends] = useState<boolean>(true);
  const [selectedDates, setSelectedDates] = useState<string[]>(() => {
    return generateDateRange(initialDate || todayIso, addDaysToDate(initialDate || todayIso, 4), true);
  });

  // Time & Duration state (manual Time In & Time Out)
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [durationLabel, setDurationLabel] = useState<string>(() => formatDurationLabel(initialStartTime, initialEndTime));

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Effective assigned employee
  const effectiveUser = isAdminOrManager ? selectedTargetUser : currentUser;

  // Auto-select first available employee for admin/manager if none selected
  useEffect(() => {
    if (isAdminOrManager && !selectedTargetUser && eligibleEmployees.length > 0) {
      onSelectTargetUser(eligibleEmployees[0]);
    }
  }, [isAdminOrManager, selectedTargetUser, eligibleEmployees, onSelectTargetUser]);

  // When rangeStart, rangeEnd, or excludeWeekends changes, regenerate selectedDates
  const handleRangeChange = (start: string, end: string, noWeekends: boolean) => {
    setRangeStart(start);
    setRangeEnd(end);
    const dates = generateDateRange(start, end, noWeekends);
    setSelectedDates(dates);
  };

  // Quick Preset Handlers for Multi-Day
  const handlePresetNext3Workdays = () => {
    const dates = getNextWorkdays(todayIso, 3);
    if (dates.length > 0) {
      setRangeStart(dates[0]);
      setRangeEnd(dates[dates.length - 1]);
      setSelectedDates(dates);
    }
  };

  const handlePresetThisWorkweek = () => {
    const dates = getWorkweekDates(todayIso);
    if (dates.length > 0) {
      setRangeStart(dates[0]);
      setRangeEnd(dates[dates.length - 1]);
      setSelectedDates(dates);
    }
  };

  const handlePresetNextWorkweek = () => {
    const nextWeekDate = addDaysToDate(todayIso, 7);
    const dates = getWorkweekDates(nextWeekDate);
    if (dates.length > 0) {
      setRangeStart(dates[0]);
      setRangeEnd(dates[dates.length - 1]);
      setSelectedDates(dates);
    }
  };

  const handleToggleDate = (dateToToggle: string) => {
    if (selectedDates.includes(dateToToggle)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateToToggle));
    } else {
      setSelectedDates([...selectedDates, dateToToggle].sort());
    }
  };

  // Active dates to be booked
  const activeDates = useMemo(() => {
    return bookingMode === 'single' ? [singleDate] : selectedDates;
  }, [bookingMode, singleDate, selectedDates]);

  // Validation function: Check conflicts for any given date
  const checkDateConflict = (dateStr: string) => {
    const targetId = effectiveUser?.id;
    const targetName = effectiveUser?.name;

    // 1. Strict 1-Seat-Per-User-Per-Day rule:
    // Does the target user already have an active/upcoming desk booking on this date?
    const userBookingOnDate = allBookings.find(
      (b) =>
        (b.userId === targetId || (targetName && b.userName === targetName)) &&
        b.date === dateStr &&
        b.status !== 'cancelled' &&
        b.status !== 'completed' &&
        Boolean(b.deskId)
    );

    if (userBookingOnDate) {
      const seatCode = userBookingOnDate.deskCode || userBookingOnDate.deskId;
      return {
        hasConflict: true,
        type: 'user_already_booked' as const,
        message: isAdminOrManager
          ? `${targetName} already has Seat ${seatCode} reserved on this day. (1 seat/day rule)`
          : `You already have Seat ${seatCode} reserved on this day. (1 seat/day rule)`
      };
    }

    // 2. Desk Occupancy: Is this specific desk already reserved by someone else during chosen hours?
    const deskBookingOnDate = allBookings.find(
      (b) =>
        b.deskId === desk.id &&
        b.date === dateStr &&
        b.status !== 'cancelled' &&
        b.status !== 'completed' &&
        // Overlap: b.start < endTime && b.end > startTime
        b.startTime < endTime &&
        b.endTime > startTime
    );

    if (deskBookingOnDate) {
      return {
        hasConflict: true,
        type: 'desk_occupied' as const,
        message: `Desk ${desk.code || desk.id} is already occupied on this day (${deskBookingOnDate.startTime} - ${deskBookingOnDate.endTime}).`
      };
    }

    return { hasConflict: false, type: null, message: null };
  };

  // Detailed status for every active date
  const dateStatuses = useMemo(() => {
    return activeDates.map((d) => ({
      date: d,
      ...checkDateConflict(d)
    }));
  }, [activeDates, effectiveUser, desk.id, startTime, endTime, allBookings]);

  // Aggregated conflicts
  const conflictedDates = useMemo(() => dateStatuses.filter((s) => s.hasConflict), [dateStatuses]);
  const validDates = useMemo(() => dateStatuses.filter((s) => !s.hasConflict).map((s) => s.date), [dateStatuses]);

  const hasAnyConflict = conflictedDates.length > 0;
  const canSubmit =
    !isSubmitting &&
    activeDates.length > 0 &&
    !hasAnyConflict &&
    (!isAdminOrManager || Boolean(selectedTargetUser));

  // Quick Action: Remove Conflicted Dates
  const handleRemoveConflictedDates = () => {
    if (bookingMode === 'multi') {
      setSelectedDates(validDates);
    }
  };

  // Pricing & Hours calculation
  const hoursPerDay = calculateDurationHours(startTime, endTime);
  const pricePerHour = desk.pricePerHour || 15;
  const costPerDay = pricePerHour * hoursPerDay;
  const totalCost = costPerDay * activeDates.length;

  // Submit Handler
  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onConfirmBooking({
        dates: activeDates,
        duration: durationLabel,
        startTime,
        endTime,
        targetUser: isAdminOrManager ? selectedTargetUser : currentUser
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        style={{ backgroundColor: '#111622' }}
        className="w-full max-w-2xl bg-[#111622] border border-slate-700/80 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/40 text-sky-400 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">event_seat</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono tracking-tight">
                  Seat {desk.code || desk.id}
                </h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full font-semibold">
                  {desk.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2'}
                </span>
                {isAdminOrManager && (
                  <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Admin Allocation
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {desk.podName} • {desk.amenities.join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Policy Banner: 1 Seat Per User Per Day */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-sky-500/10 border border-sky-400/25 text-sky-200 text-xs">
            <span className="material-symbols-outlined text-base text-sky-400 flex-shrink-0">
              verified_user
            </span>
            <span className="flex-1 text-[11px] leading-relaxed">
              <strong>Workplace Policy:</strong> Each employee can book <strong>at most 1 seat per day</strong>. Multi-day reservations allocate 1 seat for each chosen day.
            </span>
          </div>

          {/* Admin / Manager: Employee Assignment */}
          {isAdminOrManager && (
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-mono flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-400">person_search</span>
                <span>Assign to Employee (Admins cannot book for themselves)</span>
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedTargetUser?.id || ''}
                  onChange={(e) => {
                    const emp = eligibleEmployees.find((u) => u.id === e.target.value);
                    if (emp) onSelectTargetUser(emp);
                  }}
                  className="flex-1 bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 cursor-pointer"
                >
                  <option value="" disabled>Choose Employee...</option>
                  {eligibleEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department || 'General'}) — {emp.email}
                    </option>
                  ))}
                </select>

                {selectedTargetUser && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 flex-shrink-0">
                    <Avatar src={selectedTargetUser.avatar} name={selectedTargetUser.name} size="xs" />
                    <span className="text-xs font-semibold text-white">{selectedTargetUser.name.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1. Date Selection Mode Toggle (Single vs Multi-Day) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-sky-400">calendar_month</span>
                <span>1. Select Dates ({activeDates.length} {activeDates.length === 1 ? 'day' : 'days'})</span>
              </label>

              {/* Mode Switch Tabs */}
              <div className="flex p-0.5 rounded-xl bg-[#0a0d14] border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBookingMode('single')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    bookingMode === 'single'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Single Day
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('multi')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    bookingMode === 'multi'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Multiple Days
                </button>
              </div>
            </div>

            {/* SINGLE DAY MODE */}
            {bookingMode === 'single' ? (
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleDate(todayIso)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      singleDate === todayIso
                        ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-semibold'
                        : 'bg-[#0a0d14] text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    Today ({formatDisplayDate(todayIso)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleDate(tomorrowIso)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      singleDate === tomorrowIso
                        ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-semibold'
                        : 'bg-[#0a0d14] text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    Tomorrow ({formatDisplayDate(tomorrowIso)})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex-shrink-0">Custom Date:</span>
                  <input
                    type="date"
                    min={todayIso}
                    value={singleDate}
                    onChange={(e) => {
                      if (e.target.value) setSingleDate(e.target.value);
                    }}
                    className="flex-1 bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              /* MULTIPLE DAYS MODE */
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Presets:</span>
                  <button
                    type="button"
                    onClick={handlePresetNext3Workdays}
                    className="px-2.5 py-1 rounded-lg bg-[#0a0d14] hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    ⚡ Next 3 Workdays
                  </button>
                  <button
                    type="button"
                    onClick={handlePresetThisWorkweek}
                    className="px-2.5 py-1 rounded-lg bg-[#0a0d14] hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    💼 This Week (Mon–Fri)
                  </button>
                  <button
                    type="button"
                    onClick={handlePresetNextWorkweek}
                    className="px-2.5 py-1 rounded-lg bg-[#0a0d14] hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    📅 Next Week (Mon–Fri)
                  </button>
                </div>

                {/* Range inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Start Date</label>
                    <input
                      type="date"
                      min={todayIso}
                      value={rangeStart}
                      onChange={(e) => {
                        if (e.target.value) handleRangeChange(e.target.value, rangeEnd, excludeWeekends);
                      }}
                      className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">End Date</label>
                    <input
                      type="date"
                      min={rangeStart || todayIso}
                      value={rangeEnd}
                      onChange={(e) => {
                        if (e.target.value) handleRangeChange(rangeStart, e.target.value, excludeWeekends);
                      }}
                      className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono cursor-pointer"
                    />
                  </div>
                </div>

                {/* Weekend exclusion toggle */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={excludeWeekends}
                      onChange={(e) => handleRangeChange(rangeStart, rangeEnd, e.target.checked)}
                      className="rounded border-slate-700 text-sky-500 focus:ring-sky-400"
                    />
                    <span>Exclude Weekends (Office closed Sat & Sun)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedDates.length} days generated
                  </span>
                </div>

                {/* Selected Dates Grid / Chips */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
                    Selected Dates (Click chip to toggle on/off):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {selectedDates.map((d) => {
                      const status = checkDateConflict(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handleToggleDate(d)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                            status.hasConflict
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                          title={status.message || 'Date is available'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.hasConflict ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span>{getWeekdayShort(d)}, {d.slice(5)}</span>
                          <span className="text-slate-400 hover:text-white text-[10px] ml-0.5">✕</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conflict Warning Box & Quick Action */}
          {hasAnyConflict && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-lg text-amber-400 flex-shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex-1">
                  <strong className="block text-amber-300 font-semibold mb-1">
                    Booking Rule Conflict Detected ({conflictedDates.length} {conflictedDates.length === 1 ? 'date' : 'dates'}):
                  </strong>
                  <ul className="space-y-1 text-[11px] list-disc list-inside">
                    {conflictedDates.map((c) => (
                      <li key={c.date}>
                        <span className="font-mono font-semibold">{c.date}:</span> {c.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {bookingMode === 'multi' && validDates.length > 0 && (
                <div className="pt-2 border-t border-amber-500/30 flex items-center justify-between">
                  <span className="text-[11px] text-amber-300">
                    You can remove conflicted dates and proceed with {validDates.length} available days.
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveConflictedDates}
                    className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    ⚡ Keep {validDates.length} Available Days
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Manual Time In & Time Out Selection */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-sky-400">schedule</span>
                <span>2. Manual Time In & Time Out</span>
              </label>
              <span className="text-xs font-bold text-sky-400 font-mono bg-sky-500/15 border border-sky-400/30 px-2.5 py-1 rounded-xl">
                {hoursPerDay} hrs / day
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Time In */}
              <div className="p-3.5 rounded-xl bg-[#0a0d14] border border-slate-800 flex flex-col">
                <label className="text-[10px] text-slate-400 uppercase font-mono mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-400">login</span>
                  <span className="font-semibold text-slate-200">Time In (Arrival)</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    if (newStart) {
                      setStartTime(newStart);
                      setDurationLabel(formatDurationLabel(newStart, endTime));
                    }
                  }}
                  className="w-full bg-[#131927] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-sky-400 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Time Out */}
              <div className="p-3.5 rounded-xl bg-[#0a0d14] border border-slate-800 flex flex-col">
                <label className="text-[10px] text-slate-400 uppercase font-mono mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-rose-400">logout</span>
                  <span className="font-semibold text-slate-200">Time Out (Departure)</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    if (newEnd) {
                      setEndTime(newEnd);
                      setDurationLabel(formatDurationLabel(startTime, newEnd));
                    }
                  }}
                  className="w-full bg-[#131927] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-sky-400 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span>
                Daily desk access: <strong className="text-slate-200 font-mono">{startTime} to {endTime}</strong>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Rate: ${pricePerHour}/hr
              </span>
            </div>
          </div>

          {/* Reservation Summary & Calculation */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#131927] to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Reservation Summary</span>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">
                {activeDates.length} {activeDates.length === 1 ? 'Day' : 'Days'} • {hoursPerDay}h/day ({startTime} - {endTime})
              </div>
              <p className="text-[11px] text-slate-400">
                Seat {desk.code || desk.id} ({desk.podName})
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Total</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                ${totalCost.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">
                (${pricePerHour}/hr × {hoursPerDay}h × {activeDates.length}d)
              </span>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium animate-in fade-in duration-150">
              ⚠️ {submitError}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              canSubmit
                ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.4)]'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Reserving Seat...</span>
              </>
            ) : hasAnyConflict ? (
              <>
                <span className="material-symbols-outlined text-base">block</span>
                <span>Rule Conflict (1 Seat/Day)</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>
                  Confirm Pass ({activeDates.length} {activeDates.length === 1 ? 'Day' : 'Days'})
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
