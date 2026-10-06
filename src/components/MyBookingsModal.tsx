import React, { useState, useMemo } from 'react';
import { Booking } from '../types';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onCheckIn: (bookingId: string) => void;
  onOpenEdit: (booking: Booking) => void;
  isPageView?: boolean;
  onLocateSeat?: (areaId: 'area-1' | 'area-2', deskId: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onCheckIn,
  onOpenEdit,
  isPageView = true,
  onLocateSeat
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'checked_in'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'desks' | 'meetings'>('all');

  const activeBookings = useMemo(() => bookings.filter((b) => b.status === 'active'), [bookings]);
  const upcomingBookings = useMemo(() => bookings.filter((b) => b.status === 'upcoming'), [bookings]);
  const meetingBookings = useMemo(() => bookings.filter((b) => Boolean(b.roomId || b.teamsMeetingUrl)), [bookings]);
  const deskBookings = useMemo(() => bookings.filter((b) => !b.roomId && !b.teamsMeetingUrl), [bookings]);
  const checkedInCount = useMemo(() => bookings.filter((b) => b.checkInStatus).length, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase();
      const deskId = b.deskId || '';
      const deskCode = b.deskCode || '';
      const podName = b.podName || '';
      const date = b.date || '';
      const attendeesText = (b.attendees || []).map((a) => a.name).join(' ').toLowerCase();

      const matchesSearch =
        !q ||
        deskId.toLowerCase().includes(q) ||
        deskCode.toLowerCase().includes(q) ||
        podName.toLowerCase().includes(q) ||
        date.includes(q) ||
        attendeesText.includes(q);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? b.status === 'active'
          : statusFilter === 'upcoming'
          ? b.status === 'upcoming'
          : b.checkInStatus;

      const isMeeting = Boolean(b.roomId || b.teamsMeetingUrl);
      const matchesType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'desks'
          ? !isMeeting
          : isMeeting;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchQuery, statusFilter, typeFilter]);

  const content = (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Top Page Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#121724]/90 border border-white/[0.08] shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] flex-shrink-0">
            <span className="material-symbols-outlined text-[26px]">bookmark</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Workspace / Passes & Meetings
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-mono font-bold uppercase">
                Active Passes ({bookings.length})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              My Office Passes & Teams Meetings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review confirmed desk passes, join Microsoft Teams room sessions, or view invited attendees.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>Book Space</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Total Passes</span>
            <span className="material-symbols-outlined text-xs text-sky-400">confirmation_number</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{bookings.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">All registered bookings</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Workstation Desks</span>
            <span className="material-symbols-outlined text-xs text-emerald-400">desk</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{deskBookings.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Individual seat reservations</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-[#464EB8]/30 shadow-sm bg-gradient-to-br from-[#464EB8]/10 to-transparent">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-indigo-300">
            <span>Teams Meetings</span>
            <span className="material-symbols-outlined text-xs text-[#7B83EB]">video_call</span>
          </div>
          <p className="text-2xl font-bold font-mono text-indigo-300 mt-1">{meetingBookings.length}</p>
          <span className="text-[11px] text-indigo-400/80 mt-1 block">Room & video sync</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121724] border border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
            <span>Check-in Verified</span>
            <span className="material-symbols-outlined text-xs text-teal-400">verified</span>
          </div>
          <p className="text-2xl font-bold font-mono text-teal-300 mt-1">{checkedInCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Confirmed attendance</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#121724] border border-white/[0.08]">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 focus-within:border-sky-500/50">
          <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Search by code, seat, room, date, or attendee..."
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

        {/* Type & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Toggle: All / Desks / Meetings */}
          <div className="inline-flex p-0.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setTypeFilter('desks')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'desks'
                  ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Desks ({deskBookings.length})
            </button>
            <button
              onClick={() => setTypeFilter('meetings')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === 'meetings'
                  ? 'bg-[#464EB8]/30 text-indigo-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xs">video_call</span>
              <span>Meetings ({meetingBookings.length})</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="inline-flex p-0.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white/[0.1] text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter('checked_in')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'checked_in'
                  ? 'bg-teal-500/20 text-teal-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Checked In
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Card List */}
      <div className="space-y-3.5 flex-1">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#121724] border border-white/[0.08]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-4xl">event_busy</span>
            </div>
            <h3 className="text-base font-bold text-white">No Workstation Passes Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {bookings.length === 0
                ? "You haven't reserved any workstations yet. Choose a desk on the interactive Floor Plan Map to reserve your space."
                : 'No bookings match your selected filter criteria.'}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              <span>Explore Floor Plan Map</span>
            </button>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const isRoom = Boolean(b.roomId || b.teamsMeetingUrl);
            const attendeesList = b.attendees || [];

            return (
              <div
                key={b.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#121724] border transition-all flex flex-wrap items-center justify-between gap-4 shadow-sm ${
                  isRoom
                    ? 'border-[#464EB8]/30 hover:border-[#464EB8]/60 bg-gradient-to-r from-[#464EB8]/5 to-transparent'
                    : 'border-white/[0.08] hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                  {/* Badge: ROOM vs SEAT */}
                  {isRoom ? (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#464EB8]/30 to-[#464EB8]/10 border border-[#464EB8]/40 flex flex-col items-center justify-center shadow-inner flex-shrink-0">
                      <span className="text-[9px] text-[#A6ACF7] uppercase font-mono tracking-wider">ROOM</span>
                      <span className="text-sm font-bold text-white font-mono leading-tight truncate px-1">
                        {b.deskCode || 'CONF'}
                      </span>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-black/60 to-black/30 border border-white/[0.1] flex flex-col items-center justify-center shadow-inner flex-shrink-0">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">SEAT</span>
                      <span className="text-lg font-bold text-sky-400 font-mono leading-tight">
                        {b.deskCode}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono truncate">
                        {isRoom ? (b.podName || b.deskId) : b.deskId}
                      </span>

                      {/* Office Campus Badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border flex items-center gap-1 ${
                          b.officeId === 'siddhant'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-sky-500/15 text-sky-300 border-sky-400/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {b.officeId === 'siddhant' ? 'location_city' : 'corporate_fare'}
                        </span>
                        <span>{b.officeId === 'siddhant' ? 'Siddhant' : 'Global Port'}</span>
                      </span>

                      {/* Status */}
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold ${
                          b.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                            : b.status === 'upcoming'
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {b.status}
                      </span>

                      {/* Room Role: Organizer vs Invited Attendee */}
                      {isRoom && (
                        b.isOrganizer !== false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 font-mono font-semibold">
                            ORGANIZER
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/30 font-mono font-semibold">
                            INVITED ATTENDEE
                          </span>
                        )
                      )}

                      {/* Microsoft Teams badge */}
                      {b.teamsMeetingUrl && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#464EB8]/20 text-indigo-300 border border-[#464EB8]/30 flex items-center gap-1 font-mono font-semibold">
                          <span className="material-symbols-outlined text-xs">video_call</span>
                          Teams
                        </span>
                      )}

                      {b.checkInStatus ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono font-semibold">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          Checked In
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Check-In Pending
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-1 truncate">
                      {b.areaId === 'area-1' ? 'Work Area 1 (Main Floor)' : 'Work Area 2 (Room 2)'} • {b.podName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400 mt-2 font-mono">
                      <span className="flex items-center gap-1 text-sky-300">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {b.date}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {b.duration} ({b.startTime} - {b.endTime})
                      </span>
                    </div>

                    {/* Attendee Roster Stack for Meetings */}
                    {isRoom && attendeesList.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                        <span className="text-[11px] text-slate-400 flex-shrink-0">
                          Attendees ({attendeesList.length}):
                        </span>
                        <div className="flex -space-x-1.5 overflow-hidden flex-shrink-0">
                          {attendeesList.slice(0, 4).map((att) => (
                            <img
                              key={att.id}
                              src={att.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&h=60&q=80'}
                              alt={att.name}
                              title={att.name}
                              className="inline-block h-5 w-5 rounded-full ring-2 ring-[#121724] object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-300 font-medium truncate max-w-xs">
                          {attendeesList.map((a) => a.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {/* Join Microsoft Teams Meeting Button */}
                  {b.teamsMeetingUrl && (
                    <a
                      href={b.teamsMeetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-[#464EB8] hover:bg-[#5B5FC7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(70,78,184,0.4)] transition-all cursor-pointer"
                      title="Join Microsoft Teams Video Conference"
                    >
                      <span className="material-symbols-outlined text-sm">video_call</span>
                      <span>Join on Teams</span>
                    </a>
                  )}

                  {!b.checkInStatus && (
                    <button
                      onClick={() => onCheckIn(b.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(52,211,153,0.2)] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                      <span>Check In</span>
                    </button>
                  )}

                  {!isRoom && onLocateSeat && (
                    <button
                      onClick={() => onLocateSeat(b.areaId, b.deskId)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Locate on Map"
                    >
                      <span className="material-symbols-outlined text-sm text-sky-400">my_location</span>
                      <span>Locate</span>
                    </button>
                  )}

                  {!isRoom && (
                    <button
                      onClick={() => onOpenEdit(b)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-sky-400">edit</span>
                      <span>Modify</span>
                    </button>
                  )}

                  {/* Add to Microsoft Outlook Calendar */}
                  <a
                    href={`/api/bookings/${b.id}/calendar.ics`}
                    download={`smartdesk-outlook-${b.id}.ics`}
                    className="px-3 py-1.5 rounded-xl bg-[#0078D4]/15 hover:bg-[#0078D4]/25 text-sky-300 border border-[#0078D4]/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Add this booking to Microsoft Outlook Calendar (.ics)"
                  >
                    <span className="material-symbols-outlined text-sm text-[#00a4ef]">event</span>
                    <span>Outlook (.ics)</span>
                  </a>

                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-400/30 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>{isRoom && b.isOrganizer === false ? 'Decline' : 'Cancel'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/[0.08] flex flex-wrap justify-between items-center text-xs text-slate-400 gap-3">
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-sm">sync</span>
          Passes sync automatically with Microsoft Outlook & Google Calendar (.ics).
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all cursor-pointer"
        >
          Return to Floor Plan
        </button>
      </div>
    </div>
  );

  if (isPageView) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#090D16] p-4 sm:p-6 lg:p-8 flex flex-col animate-in fade-in duration-150">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 p-6 overflow-hidden">
        {content}
      </div>
    </div>
  );
};
