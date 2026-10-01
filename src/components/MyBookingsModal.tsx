import React from 'react';
import { Booking } from '../types';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onCheckIn: (bookingId: string) => void;
  onOpenEdit: (booking: Booking) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onCheckIn,
  onOpenEdit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">bookmark</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">My Office Passes & Bookings</h2>
              <p className="text-xs text-outline">
                Manage your reserved workstations, modify time slots, or check in.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-outline hover:text-on-surface flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline mb-2">
                event_busy
              </span>
              <p className="text-sm font-medium text-on-surface">No Active Bookings</p>
              <p className="text-xs text-outline mt-1">
                Select an available desk on the floor plan to make your first reservation.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-surface-container-high/60 border border-outline-variant/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/40 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-[10px] text-outline uppercase font-mono">SEAT</span>
                    <span className="text-sm font-bold text-primary font-mono">
                      {b.deskCode}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface font-mono">
                        {b.deskId}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold ${
                          b.status === 'active'
                            ? 'bg-secondary/15 text-secondary border border-secondary/30'
                            : b.status === 'upcoming'
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-outline/15 text-outline'
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.checkInStatus && (
                        <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                          ✓ Checked In
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {b.areaId === 'area-1' ? 'Work Area 1 (Main Floor)' : 'Work Area 2 (Work Room 2)'} • {b.podName}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-outline mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">
                          calendar_month
                        </span>
                        {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-secondary">
                          schedule
                        </span>
                        {b.duration} ({b.startTime} - {b.endTime})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!b.checkInStatus && (
                    <button
                      onClick={() => onCheckIn(b.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(78,222,163,0.2)]"
                    >
                      <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                      <span>Check In</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenEdit(b)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">edit</span>
                    <span>Edit Slot/Seat</span>
                  </button>

                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="px-3 py-1.5 rounded-xl bg-error/10 hover:bg-error/20 text-error border border-error/30 text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-high/40 flex justify-between items-center text-xs text-outline">
          <span>Bookings sync automatically with calendar invite (.ics).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
