import React, { useEffect } from 'react';
import { Desk, Booking, Role, UserProfile } from '../types';
import { Avatar } from './Avatar';

interface BookedSeatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  desk: Desk | null;
  currentUser: UserProfile | null;
  userRole?: Role;
  selectedDate: string;
  booking?: Booking | null;
  onCheckIn?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
  onOpenEdit?: (booking: Booking) => void;
  onReleaseSeat?: (deskId: string) => void;
}

export const BookedSeatDetailsModal: React.FC<BookedSeatDetailsModalProps> = ({
  isOpen,
  onClose,
  desk,
  currentUser,
  userRole,
  selectedDate,
  booking,
  onCheckIn,
  onCancelBooking,
  onOpenEdit,
  onReleaseSeat
}) => {
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !desk) return null;

  const isSelf = Boolean(
    desk.isSelfBooked ||
    (desk.occupant?.userId && currentUser?.id && desk.occupant.userId === currentUser.id) ||
    (desk.occupant?.name && currentUser?.name && desk.occupant.name.toLowerCase() === currentUser.name.toLowerCase())
  );

  const isAdminOrManager = userRole === 'admin' || userRole === 'manager';

  // If a regular user tries to open someone else's booking, prevent rendering
  if (!isSelf && !isAdminOrManager) {
    return null;
  }

  const effectiveBookingId = booking?.id || desk.occupant?.bookingId;
  const isCheckedIn = Boolean(booking?.checkInStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#101522] border border-white/[0.12] p-6 shadow-2xl flex flex-col space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg ${
              isSelf
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-sky-500/20 text-sky-300 border-sky-400/30 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {isSelf ? 'confirmation_number' : 'manage_search'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                  isSelf
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                }`}>
                  {isSelf ? 'Your Active Reservation' : 'Admin Allocation Inspector'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {desk.officeId === 'siddhant' ? 'Siddhant Campus' : 'Global Port Campus'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {isSelf ? `Workstation Pass • Seat ${desk.code}` : `Inspection • Seat ${desk.code} (${desk.id})`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Seat Specification & Blueprint Details */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Seat Code & ID</span>
            <span className="text-sky-300 font-bold text-sm">{desk.code} ({desk.id})</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Floor & Work Area</span>
            <span className="text-slate-200 font-medium">
              {desk.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2'} • {desk.podName}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Target Date</span>
            <span className="text-emerald-300 font-semibold">{booking?.date || selectedDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Time Window</span>
            <span className="text-emerald-300 font-semibold">{desk.occupant?.bookedTime || '09:00 - 17:00'}</span>
          </div>
        </div>

        {/* Booker / Occupant Profile Card */}
        {desk.occupant && (
          <div className="p-4 rounded-2xl bg-[#141a29] border border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <Avatar
                src={desk.occupant.avatar}
                name={desk.occupant.name}
                size="md"
                rounded="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">
                    {desk.occupant.name}
                  </h3>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase border ${
                    desk.occupant.role?.toLowerCase() === 'admin'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : desk.occupant.role?.toLowerCase() === 'manager'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}>
                    {desk.occupant.role}
                  </span>
                  {isSelf && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-bold uppercase">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {desk.occupant.department || 'Workspace Member'}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[10px] text-slate-400 block font-mono">REMAINING</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {desk.occupant.hoursRemaining} left
                </span>
              </div>
            </div>

            {/* Check-In Status Banner */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Check-in Status:</span>
              {isCheckedIn ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Checked In</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Pending Check-in</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Employee Self Actions */}
          {isSelf && (
            <div className="flex items-center gap-2">
              {!isCheckedIn && effectiveBookingId && onCheckIn && (
                <button
                  type="button"
                  onClick={() => {
                    onCheckIn(effectiveBookingId);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                  <span>Check In Now</span>
                </button>
              )}

              {booking && onOpenEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEdit(booking);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-sky-400">edit</span>
                  <span>Modify</span>
                </button>
              )}

              {effectiveBookingId && onCancelBooking && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to cancel your reservation for Seat ${desk.code}?`)) {
                      onCancelBooking(effectiveBookingId);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  <span>Cancel Pass</span>
                </button>
              )}
            </div>
          )}

          {/* Admin / Manager Override: Force Release Ghost Seat */}
          {isAdminOrManager && (
            <div className="flex items-center gap-2">
              {onReleaseSeat && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Force release seat ${desk.code} (${desk.id}) from ${desk.occupant?.name || 'occupant'} and open it for company booking?`)) {
                      onReleaseSeat(desk.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(244,63,94,0.25)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">person_remove</span>
                  <span>Release Seat</span>
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs ml-auto transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

