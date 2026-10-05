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
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[94%] max-w-5xl max-h-[85vh] overflow-y-auto bg-surface-container-high/95 backdrop-blur-2xl border-2 border-primary/50 rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Selected Desk Information & Date/Time Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_12px_rgba(14,165,233,0.5)] flex-shrink-0">
          <span className="material-symbols-outlined text-[22px]">bookmark_check</span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface font-mono">
              Seat {selectedDesk.id}
            </span>
            {isAdminOrManager ? (
              <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/30 px-2 py-0.5 rounded font-mono font-semibold">
                Allocation Mode
              </span>
            ) : (
              <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/30 px-2 py-0.5 rounded font-mono font-medium">
                Ready to Reserve
              </span>
            )}

            {/* Interactive Date Picker & Time Badge */}
            <div className="flex items-center gap-1.5">
              <label className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-lg font-mono cursor-pointer transition-colors" title="Change reservation date">
                <span className="material-symbols-outlined text-xs text-sky-400">calendar_month</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value && onDateChange) onDateChange(e.target.value);
                  }}
                  className="bg-transparent text-sky-200 border-none outline-none font-mono text-[11px] cursor-pointer"
                />
              </label>

              <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-lg font-mono">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {startTime}–{endTime}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant truncate max-w-[260px]">
            {selectedDesk.podName} • {selectedDesk.amenities.join(', ')}
          </p>
        </div>
      </div>

      {/* Warning Banner if 1-Seat-Per-Day rule is violated */}
      {isBookingBlocked && (
        <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-base text-amber-400 flex-shrink-0">
            warning
          </span>
          <span className="flex-1 text-[11px] sm:text-xs">
            {currentUserExistingBooking
              ? `You already have Seat ${currentUserExistingBooking.deskCode || currentUserExistingBooking.deskId} reserved on ${formatDisplayDate(selectedDate)}. Booking Rule: Max 1 seat per person per day.`
              : `${selectedTargetUser?.name} already has Seat ${targetUserExistingBooking?.deskCode || targetUserExistingBooking?.deskId} reserved on ${formatDisplayDate(selectedDate)}. Booking Rule: Max 1 seat per person per day.`}
          </span>
        </div>
      )}

      {/* Target User & Duration Selection */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* If Admin or Manager: Employee Assignment Dropdown (Cannot book for themselves) */}
        {isAdminOrManager ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-outline font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-secondary">person_search</span>
                <span>Assign to Employee</span>
              </span>
              <select
                value={selectedTargetUser?.id || ''}
                onChange={(e) => {
                  const emp = eligibleEmployees.find((u) => u.id === e.target.value);
                  if (emp) onSelectTargetUser(emp);
                }}
                className="bg-surface-container border border-outline-variant/40 rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none focus:border-secondary cursor-pointer font-medium max-w-[210px]"
              >
                <option value="" disabled>Choose Employee...</option>
                {eligibleEmployees.map((emp) => {
                  const booked = getEmployeeBookingForDate(emp.id, emp.name);
                  return (
                    <option
                      key={emp.id}
                      value={emp.id}
                      disabled={Boolean(booked)}
                      className={booked ? 'text-outline/50 bg-surface-container-low' : ''}
                    >
                      {emp.name}{booked ? ` — Booked (${booked.deskCode || booked.deskId})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Employee Preview Chip */}
            {selectedTargetUser && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-container border border-outline-variant/30 animate-in fade-in duration-100">
                <Avatar
                  src={selectedTargetUser.avatar}
                  name={selectedTargetUser.name}
                  size="xs"
                  rounded="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-on-surface leading-tight truncate max-w-[100px]">
                    {selectedTargetUser.name}
                  </span>
                  <span className="text-[9px] text-secondary font-mono uppercase">
                    {selectedTargetUser.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Regular User: Books for self */
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-container border border-outline-variant/30">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="xs"
              rounded="rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-on-surface leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-primary font-mono">
                Self Reservation
              </span>
            </div>
          </div>
        )}

        {/* Manual Time In and Time Out Selection */}
        <div className="flex items-center gap-2">
          {/* Time In */}
          <div className="flex flex-col text-left">
            <label className="text-[10px] text-outline font-medium flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs text-sky-400">login</span>
              <span>Time In</span>
            </label>
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
              className="bg-surface-container border border-outline-variant/40 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono cursor-pointer"
            />
          </div>

          {/* Time Out */}
          <div className="flex flex-col text-left">
            <label className="text-[10px] text-outline font-medium flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs text-sky-400">logout</span>
              <span>Time Out</span>
            </label>
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
              className="bg-surface-container border border-outline-variant/40 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono cursor-pointer"
            />
          </div>

          {/* Duration Hours Pill */}
          <div className="hidden sm:flex flex-col text-center justify-end pb-0.5">
            <span className="text-[9px] text-outline uppercase font-mono">Hours</span>
            <span className="text-[11px] font-bold text-sky-400 font-mono bg-sky-500/10 border border-sky-400/30 px-2 py-0.5 rounded-lg whitespace-nowrap">
              {calculateDurationHours(startTime, endTime)}h
            </span>
          </div>
        </div>

        {/* Multi-Day & Custom Schedule Button */}
        <button
          type="button"
          onClick={onOpenScheduleModal}
          className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm flex-shrink-0 group"
          title="Open advanced scheduler to book multiple days or custom hours"
        >
          <span className="material-symbols-outlined text-[16px] text-sky-400 group-hover:scale-110 transition-transform">
            date_range
          </span>
          <span className="hidden sm:inline">Multi-Day Booking</span>
          <span className="sm:hidden">Multi-Day</span>
        </button>

        {/* Confirm Reservation CTA Button */}
        <button
          onClick={onConfirm}
          disabled={isBookingBlocked || (isAdminOrManager && !selectedTargetUser)}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
            isBookingBlocked
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-90'
              : isAdminOrManager && !selectedTargetUser
              ? 'bg-surface-container text-outline cursor-not-allowed border border-outline-variant/30'
              : 'bg-primary text-on-primary shadow-[0_0_18px_rgba(137,206,255,0.4)] hover:shadow-[0_0_26px_rgba(137,206,255,0.7)] hover:bg-primary-fixed'
          }`}
          title={
            isBookingBlocked
              ? 'Booking not permitted: 1 seat per user per day limit reached'
              : isAdminOrManager && !selectedTargetUser
              ? 'Select an employee first'
              : 'Confirm Desk Booking'
          }
        >
          <span>
            {isBookingBlocked
              ? 'Limit: 1 Seat/Day'
              : isAdminOrManager
              ? selectedTargetUser
                ? `Assign to ${selectedTargetUser.name.split(' ')[0]}`
                : 'Select Employee'
              : 'Confirm Pass'}
          </span>
          <span className="material-symbols-outlined text-[16px]">
            {isBookingBlocked ? 'block' : 'arrow_forward'}
          </span>
        </button>

        {/* Deselect / Dismiss Button */}
        <button
          onClick={onClearSelection}
          className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30 flex-shrink-0"
          title="Deselect Seat"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
