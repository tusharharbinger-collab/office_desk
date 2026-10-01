import React, { useState } from 'react';
import { Room } from '../types';
import { getTodayISODate, getTomorrowISODate, formatDisplayDate } from '../utils/dateTime';

interface RoomBookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  onConfirmRoomBooking: (room: Room, duration: string, bookingDate: string, startTime: string, endTime: string) => void;
}

export const RoomBookingModal: React.FC<RoomBookingModalProps> = ({
  room,
  isOpen,
  onClose,
  selectedDate: initialDate,
  defaultStartTime = '09:00',
  defaultEndTime = '11:00',
  onConfirmRoomBooking
}) => {
  if (!isOpen || !room) return null;

  const todayIso = getTodayISODate();
  const tomorrowIso = getTomorrowISODate();

  const [date, setDate] = useState(initialDate || todayIso);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [duration, setDuration] = useState('2 Hours (09:00 - 11:00)');
  const isOccupied = room.status === 'occupied';

  const handleDurationPreset = (preset: string) => {
    setDuration(preset);
    if (preset.includes('1 Hour')) {
      setStartTime('09:00');
      setEndTime('10:00');
    } else if (preset.includes('2 Hours')) {
      setStartTime('09:00');
      setEndTime('11:00');
    } else if (preset.includes('Half Day')) {
      setStartTime('09:00');
      setEndTime('13:00');
    } else if (preset.includes('Full Day')) {
      setStartTime('09:00');
      setEndTime('17:00');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">meeting_room</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">{room.name}</h3>
              <p className="text-xs text-outline font-mono">{room.id} • Cap: {room.capacity} Persons</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-outline flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-between">
            <span className="text-outline">Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold ${
                isOccupied
                  ? 'bg-error/15 text-error border border-error/30'
                  : 'bg-secondary/15 text-secondary border border-secondary/30'
              }`}
            >
              {isOccupied ? 'Currently In Use' : 'Available for Booking'}
            </span>
          </div>

          <div>
            <span className="text-outline block mb-1">Room Amenities:</span>
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface-variant text-[11px]"
                >
                  ✓ {a}
                </span>
              ))}
            </div>
          </div>

          {isOccupied && room.occupant && (
            <div className="p-3 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 space-y-1">
              <span className="text-outline text-[11px] block">Booked by:</span>
              <p className="text-xs font-semibold text-on-surface">{room.occupant.name} ({room.occupant.department})</p>
              <p className="text-[11px] text-secondary font-mono">Until {room.occupant.bookedTime.split('-')[1]} ({room.occupant.hoursRemaining} left)</p>
            </div>
          )}

          {!isOccupied && (
            <div className="space-y-3 pt-1">
              {/* Date selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-outline block">Reservation Date</label>
                  <span className="text-primary font-mono text-[11px]">{formatDisplayDate(date)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setDate(todayIso)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
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
                    className={`flex-1 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
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
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface font-mono cursor-pointer"
                />
              </div>

              {/* Time window selection */}
              <div>
                <label className="text-outline block mb-1">Meeting Duration Preset</label>
                <select
                  value={duration}
                  onChange={(e) => handleDurationPreset(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer mb-2"
                >
                  <option value="1 Hour (09:00 - 10:00)">1 Hour (09:00 - 10:00)</option>
                  <option value="2 Hours (09:00 - 11:00)">2 Hours (09:00 - 11:00)</option>
                  <option value="Half Day (09:00 - 13:00)">Half Day (09:00 - 13:00)</option>
                  <option value="Full Day (09:00 - 17:00)">Full Day (09:00 - 17:00)</option>
                </select>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-outline block mb-0.5">Start Time</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-2 py-1 text-xs text-on-surface font-mono"
                    />
                  </div>
                  <span className="text-outline text-xs mt-3">→</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-outline block mb-0.5">End Time</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-2 py-1 text-xs text-on-surface font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-medium text-outline cursor-pointer"
          >
            Cancel
          </button>
          {!isOccupied && (
            <button
              onClick={() => onConfirmRoomBooking(room, duration, date, startTime, endTime)}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all cursor-pointer"
            >
              Reserve Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
