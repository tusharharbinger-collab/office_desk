import React from 'react';
import { Desk, UserProfile, Booking } from '../types';
import { formatDisplayDate, calculateDurationHours, formatDurationLabel } from '../utils/dateTime';
import { Avatar } from './Avatar';

interface BookingBarProps {
  selectedDesk: Desk | null;
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  selectedDate: string;
  onDateChange?: (date: string) => void;
  startTime: string;
  endTime: string;
  onTimeChange?: (startTime: string, endTime: string) => void;
  onShiftSelect?: (slotId: string, start: string, end: string, duration: string) => void;
  onOpenScheduleModal: () => void;
  onConfirm: () => void;
  onClearSelection: () => void;
  currentUser: UserProfile;
  users: UserProfile[];
  selectedTargetUser: UserProfile | null;
  onSelectTargetUser: (user: UserProfile) => void;
  bookings?: Booking[];
}

export const BookingBar: React.FC<BookingBarProps> = ({
  selectedDesk,
  selectedDuration,
  onDurationChange,
  selectedDate,
  onDateChange,
  startTime,
  endTime,
  onTimeChange,
  onShiftSelect,
  onOpenScheduleModal,
  onConfirm,
  onClearSelection,
  currentUser,
  users,
  selectedTargetUser,
  onSelectTargetUser,
  bookings = []
}) => {
  // When no seat is selected, do not render anything to keep canvas spacious
  if (!selectedDesk) return null;

  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';
  // Admin & Manager cannot book for themselves - filter to active employee accounts only
  const eligibleEmployees = users.filter((u) => u.role === 'user' && u.active);

  // Business Rule: Check if a user already has an active desk booking on this selected date
  const getEmployeeBookingForDate = (userId: string, userName: string) => {
    return bookings.find(
      (b) =>
        (b.userId === userId || b.userName === userName) &&
        b.date === selectedDate &&
        b.status === 'active' &&
        Boolean(b.deskId)
    );
  };

  const currentUserExistingBooking = !isAdminOrManager
    ? getEmployeeBookingForDate(currentUser.id, currentUser.name)
    : null;

  const targetUserExistingBooking = isAdminOrManager && selectedTargetUser
    ? getEmployeeBookingForDate(selectedTargetUser.id, selectedTargetUser.name)
    : null;

  const isBookingBlocked = Boolean(currentUserExistingBooking || targetUserExistingBooking);

  // Auto-select first available eligible employee if none selected when admin/manager opens booking
  React.useEffect(() => {
    if (isAdminOrManager && !selectedTargetUser && eligibleEmployees.length > 0) {
      // Prefer employee who does not already have a booking today
      const availableEmp = eligibleEmployees.find((e) => !getEmployeeBookingForDate(e.id, e.name)) || eligibleEmployees[0];
      onSelectTargetUser(availableEmp);
    }
  }, [isAdminOrManager, selectedTargetUser, eligibleEmployees, onSelectTargetUser, selectedDate]);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto max-w-4xl bg-[#0B111E]/95 backdrop-blur-2xl border-2 border-sky-400/80 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex flex-col gap-2 shadow-[0_16px_50px_rgba(0,0,0,0.9)] ring-1 ring-sky-500/30 animate-in fade-in slide-in-from-bottom-5 duration-200 select-none"
    >
      {/* Warning Banner if 1-Seat-Per-Day rule is violated */}
      {isBookingBlocked && (
        <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/60 text-amber-200 text-xs font-semibold animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-base text-amber-400 flex-shrink-0">
            warning
          </span>
          <span className="flex-1 text-[11px] sm:text-xs">
            {currentUserExistingBooking
              ? `You already have Seat ${currentUserExistingBooking.deskCode || currentUserExistingBooking.deskId} reserved on ${formatDisplayDate(selectedDate)} (Max 1 seat per person per day).`
              : `${selectedTargetUser?.name} already has Seat ${targetUserExistingBooking?.deskCode || targetUserExistingBooking?.deskId} reserved on ${formatDisplayDate(selectedDate)} (Max 1 seat per person per day).`}
          </span>
        </div>
      )}

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        {/* Selected Desk Information */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/60 text-sky-300 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)] flex-shrink-0">
            <span className="material-symbols-outlined text-xl">event_seat</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-black text-sm tracking-wide">
                Seat {selectedDesk.code || selectedDesk.id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                {isAdminOrManager ? 'Allocation' : 'Ready to Book'}
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-mono truncate max-w-[200px] sm:max-w-xs">
              {selectedDesk.zoneName || selectedDesk.podName}
            </span>
          </div>
        </div>

        {/* Target User & Time In/Out Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Admin / Manager Employee Assignment */}
          {isAdminOrManager ? (
            <div className="flex items-center gap-1.5 bg-[#141C2E] border border-slate-700 rounded-xl px-2 py-1 text-xs">
              <span className="material-symbols-outlined text-sm text-sky-400">person</span>
              <select
                value={selectedTargetUser?.id || ''}
                onChange={(e) => {
                  const emp = eligibleEmployees.find((u) => u.id === e.target.value);
                  if (emp) onSelectTargetUser(emp);
                }}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer max-w-[140px]"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Choose Employee...</option>
                {eligibleEmployees.map((emp) => {
                  const booked = getEmployeeBookingForDate(emp.id, emp.name);
                  return (
                    <option
                      key={emp.id}
                      value={emp.id}
                      disabled={Boolean(booked)}
                      className="bg-slate-900 text-white"
                    >
                      {emp.name}{booked ? ` (Booked)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#141C2E] border border-slate-700/80">
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                size="xs"
                rounded="rounded-full"
              />
              <span className="text-xs font-semibold text-white leading-tight">
                {currentUser.name}
              </span>
            </div>
          )}

          {/* Interactive Date Picker */}
          <div className="flex items-center gap-1 bg-[#141C2E] border border-sky-500/40 rounded-xl px-2.5 py-1 text-xs text-white font-mono">
            <span className="material-symbols-outlined text-sm text-sky-400">calendar_month</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value && onDateChange) onDateChange(e.target.value);
              }}
              className="bg-transparent text-white border-none outline-none font-mono text-xs cursor-pointer font-bold"
              title="Reservation Date"
            />
          </div>

          {/* Time In & Time Out */}
          <div className="flex items-center gap-1.5 bg-[#141C2E] border border-sky-500/40 rounded-xl px-2.5 py-1 text-xs text-white font-mono">
            <span className="material-symbols-outlined text-sm text-sky-400">schedule</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                const newStart = e.target.value;
                if (newStart) {
                  onTimeChange?.(newStart, endTime);
                  onDurationChange?.(formatDurationLabel(newStart, endTime));
                }
              }}
              className="bg-transparent text-white border-none outline-none font-mono text-xs cursor-pointer font-bold w-16"
              title="Time In"
            />
            <span className="text-slate-400">–</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => {
                const newEnd = e.target.value;
                if (newEnd) {
                  onTimeChange?.(startTime, newEnd);
                  onDurationChange?.(formatDurationLabel(startTime, newEnd));
                }
              }}
              className="bg-transparent text-white border-none outline-none font-mono text-xs cursor-pointer font-bold w-16"
              title="Time Out"
            />
            <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded ml-1">
              {calculateDurationHours(startTime, endTime)}h
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Multi-Day Scheduler */}
          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm flex-shrink-0"
            title="Book multiple days"
          >
            <span className="material-symbols-outlined text-sm text-sky-400">date_range</span>
            <span className="hidden md:inline">Multi-Day</span>
          </button>

          {/* Confirm Reservation CTA Button */}
          <button
            onClick={onConfirm}
            disabled={isBookingBlocked || (isAdminOrManager && !selectedTargetUser)}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-md ${
              isBookingBlocked
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-80'
                : isAdminOrManager && !selectedTargetUser
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 shadow-[0_0_20px_#10b981]'
            }`}
            title={
              isBookingBlocked
                ? 'Booking limit reached for this date'
                : isAdminOrManager && !selectedTargetUser
                ? 'Select an employee first'
                : 'Confirm Desk Booking'
            }
          >
            <span>
              {isBookingBlocked
                ? 'Limit Reached'
                : isAdminOrManager
                ? selectedTargetUser
                  ? `Assign to ${selectedTargetUser.name.split(' ')[0]}`
                  : 'Select Employee'
                : 'Confirm Booking'}
            </span>
            <span className="material-symbols-outlined text-sm font-bold">
              {isBookingBlocked ? 'block' : 'arrow_forward'}
            </span>
          </button>

          {/* Deselect / Dismiss Button */}
          <button
            onClick={onClearSelection}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-600 flex-shrink-0 font-bold"
            title="Deselect Seat"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
