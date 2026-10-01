import React, { useState } from 'react';
import { Booking, Desk } from '../types';
import { getTodayISODate, getTomorrowISODate, formatDisplayDate } from '../utils/dateTime';

interface EditBookingModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  availableDesks: Desk[];
  onSave: (updatedBooking: Booking) => void;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  availableDesks,
  onSave
}) => {
  if (!isOpen || !booking) return null;

  const todayIso = getTodayISODate();
  const tomorrowIso = getTomorrowISODate();

  const [duration, setDuration] = useState(booking.duration);
  const [selectedDeskId, setSelectedDeskId] = useState(booking.deskId);
  const [date, setDate] = useState(() => {
    if (booking.date && booking.date.includes('-')) return booking.date;
    return todayIso;
  });
  const [startTime, setStartTime] = useState(booking.startTime || '09:00');
  const [endTime, setEndTime] = useState(booking.endTime || '17:00');

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    if (newDuration.includes('Morning')) {
      setStartTime('09:00');
      setEndTime('13:00');
    } else if (newDuration.includes('Afternoon')) {
      setStartTime('13:00');
      setEndTime('17:00');
    } else if (newDuration.includes('Evening')) {
      setStartTime('17:00');
      setEndTime('21:00');
    } else {
      setStartTime('09:00');
      setEndTime('17:00');
    }
  };

  const handleConfirm = () => {
    const matchedDesk = availableDesks.find((d) => d.id === selectedDeskId);

    onSave({
      ...booking,
      duration,
      deskId: selectedDeskId,
      deskCode: matchedDesk ? matchedDesk.code : booking.deskCode,
      podName: matchedDesk ? matchedDesk.podName : booking.podName,
      date,
      startTime,
      endTime
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">edit_calendar</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Modify Booking Slot</h3>
              <p className="text-xs text-outline">Change reserved date, time window, or switch seat.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-outline flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Date Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-on-surface-variant">
                Reservation Date
              </label>
              <span className="text-[11px] text-primary font-mono font-medium">
                {formatDisplayDate(date)}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setDate(todayIso)}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-medium border cursor-pointer ${
                  date === todayIso
                    ? 'bg-primary-container text-on-primary-container border-primary font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(tomorrowIso)}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-medium border cursor-pointer ${
                  date === tomorrowIso
                    ? 'bg-primary-container text-on-primary-container border-primary font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
                }`}
              >
                Tomorrow
              </button>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono cursor-pointer"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1.5">
              Shift Duration & Time Range
            </label>
            <select
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Full Day (8h)">Full Day (8h • 09:00 - 17:00)</option>
              <option value="Morning (4h)">Morning (4h • 09:00 - 13:00)</option>
              <option value="Afternoon (4h)">Afternoon (4h • 13:00 - 17:00)</option>
              <option value="Evening (4h)">Evening (4h • 17:00 - 21:00)</option>
            </select>
          </div>

          {/* Time range preview */}
          <div className="p-2.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-outline">Active Time Window:</span>
            <span className="font-mono text-secondary font-semibold">{startTime} - {endTime}</span>
          </div>

          {/* Seat Switcher */}
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1.5">
              Assigned Workstation
            </label>
            <select
              value={selectedDeskId}
              onChange={(e) => setSelectedDeskId(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
            >
              <option value={booking.deskId}>
                Keep Current Seat: {booking.deskId} ({booking.podName})
              </option>
              {availableDesks.slice(0, 15).map((desk) => (
                <option key={desk.id} value={desk.id}>
                  Switch to: {desk.id} - {desk.podName} ({desk.orientation})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-medium text-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
