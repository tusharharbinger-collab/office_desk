import React from 'react';
import { Desk, UserProfile } from '../types';
import { formatDisplayDate } from '../utils/dateTime';

interface BookingBarProps {
  selectedDesk: Desk | null;
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  selectedDate: string;
  startTime: string;
  endTime: string;
  onShiftSelect?: (slotId: string, start: string, end: string, duration: string) => void;
  onConfirm: () => void;
  onClearSelection: () => void;
  currentUser: UserProfile;
  users: UserProfile[];
  selectedTargetUser: UserProfile | null;
  onSelectTargetUser: (user: UserProfile) => void;
}

export const BookingBar: React.FC<BookingBarProps> = ({
  selectedDesk,
  selectedDuration,
  onDurationChange,
  selectedDate,
  startTime,
  endTime,
  onShiftSelect,
  onConfirm,
  onClearSelection,
  currentUser,
  users,
  selectedTargetUser,
  onSelectTargetUser
}) => {
  // When no seat is selected, do not render anything to keep canvas spacious
  if (!selectedDesk) return null;

  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';
  // Admin & Manager cannot book for themselves - filter to active employee accounts only
  const eligibleEmployees = users.filter((u) => u.role === 'user' && u.active);

  // Auto-select first eligible employee if none selected when admin/manager opens booking
  React.useEffect(() => {
    if (isAdminOrManager && !selectedTargetUser && eligibleEmployees.length > 0) {
      onSelectTargetUser(eligibleEmployees[0]);
    }
  }, [isAdminOrManager, selectedTargetUser, eligibleEmployees, onSelectTargetUser]);

  const handleDurationSelect = (val: string) => {
    onDurationChange(val);
    if (onShiftSelect) {
      if (val.includes('Morning')) {
        onShiftSelect('morning', '09:00', '13:00', val);
      } else if (val.includes('Afternoon')) {
        onShiftSelect('afternoon', '13:00', '17:00', val);
      } else if (val.includes('Evening')) {
        onShiftSelect('evening', '17:00', '21:00', val);
      } else {
        onShiftSelect('full-day', '09:00', '17:00', val);
      }
    }
  };

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl bg-surface-container-high/95 backdrop-blur-2xl border-2 border-primary/50 rounded-2xl px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-bottom-5 duration-200"
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

            {/* Date & Time pill */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded font-mono">
              <span className="material-symbols-outlined text-xs">schedule</span>
              {formatDisplayDate(selectedDate)} ({startTime} - {endTime})
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant truncate max-w-[260px]">
            {selectedDesk.podName} • {selectedDesk.amenities.join(', ')}
          </p>
        </div>
      </div>

      {/* Target User & Duration Selection */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
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
                className="bg-surface-container border border-outline-variant/40 rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none focus:border-secondary cursor-pointer font-medium max-w-[190px]"
              >
                <option value="" disabled>Choose Employee...</option>
                {eligibleEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Employee Preview Chip */}
            {selectedTargetUser && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-container border border-outline-variant/30 animate-in fade-in duration-100">
                <img
                  src={selectedTargetUser.avatar}
                  alt={selectedTargetUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-secondary"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-on-surface leading-tight truncate max-w-[100px]">
                    {selectedTargetUser.name}
                  </span>
                  <span className="text-[9px] text-secondary font-mono">
                    {selectedTargetUser.department}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Regular User: Books for self */
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-container border border-outline-variant/30">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-primary/50"
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

        {/* Shift Duration Selector */}
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-outline">Shift Duration</span>
          <select
            value={selectedDuration}
            onChange={(e) => handleDurationSelect(e.target.value)}
            className="bg-surface-container border border-outline-variant/40 rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="Full Day (8h)">Full Day (8h • 09:00 - 17:00)</option>
            <option value="Morning (4h)">Morning (4h • 09:00 - 13:00)</option>
            <option value="Afternoon (4h)">Afternoon (4h • 13:00 - 17:00)</option>
            <option value="Evening (4h)">Evening (4h • 17:00 - 21:00)</option>
          </select>
        </div>

        {/* Confirm Reservation CTA Button */}
        <button
          onClick={onConfirm}
          disabled={isAdminOrManager && !selectedTargetUser}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
            isAdminOrManager && !selectedTargetUser
              ? 'bg-surface-container text-outline cursor-not-allowed border border-outline-variant/30'
              : 'bg-primary text-on-primary shadow-[0_0_18px_rgba(137,206,255,0.4)] hover:shadow-[0_0_26px_rgba(137,206,255,0.7)] hover:bg-primary-fixed'
          }`}
          title={isAdminOrManager && !selectedTargetUser ? 'Select an employee first' : 'Confirm Desk Booking'}
        >
          <span>
            {isAdminOrManager
              ? selectedTargetUser
                ? `Assign to ${selectedTargetUser.name.split(' ')[0]}`
                : 'Select Employee'
              : 'Confirm Pass'}
          </span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
