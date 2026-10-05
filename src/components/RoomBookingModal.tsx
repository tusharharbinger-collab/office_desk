import React, { useState, useMemo } from 'react';
import { Room, Role, UserProfile } from '../types';
import { getTodayISODate, getTomorrowISODate, formatDisplayDate } from '../utils/dateTime';

interface RoomBookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  onConfirmRoomBooking: (
    room: Room,
    duration: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    targetUserId?: string,
    attendeeIds?: string[],
    includeTeams?: boolean
  ) => void;
  userRole?: Role;
  users?: UserProfile[];
  currentUserId?: string;
}

export const RoomBookingModal: React.FC<RoomBookingModalProps> = ({
  room,
  isOpen,
  onClose,
  selectedDate: initialDate,
  defaultStartTime = '09:00',
  defaultEndTime = '11:00',
  onConfirmRoomBooking,
  userRole = 'user',
  users = [],
  currentUserId
}) => {
  if (!isOpen || !room) return null;

  const todayIso = getTodayISODate();
  const tomorrowIso = getTomorrowISODate();

  const [date, setDate] = useState(initialDate || todayIso);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [duration, setDuration] = useState('2 Hours (09:00 - 11:00)');
  const isOccupied = room.status === 'occupied';

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';
  const [bookForOthers, setBookForOthers] = useState(false);
  const [selectedTargetUserId, setSelectedTargetUserId] = useState<string>(() => {
    const firstOther = users.find((u) => u.id !== currentUserId);
    return firstOther ? firstOther.id : (users[0]?.id || '');
  });

  // Microsoft Teams & Multi-Attendee State
  const [includeTeams, setIncludeTeams] = useState<boolean>(true);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState<string>('');

  const effectiveOrganizerId = (isManagerOrAdmin && bookForOthers && selectedTargetUserId)
    ? selectedTargetUserId
    : currentUserId;

  const availableAttendees = useMemo(() => {
    return users.filter((u) => u.id !== effectiveOrganizerId);
  }, [users, effectiveOrganizerId]);

  const filteredAttendees = useMemo(() => {
    if (!attendeeSearchQuery.trim()) return availableAttendees;
    const q = attendeeSearchQuery.toLowerCase();
    return availableAttendees.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
    );
  }, [availableAttendees, attendeeSearchQuery]);

  const selectedAttendees = useMemo(() => {
    return users.filter((u) => selectedAttendeeIds.includes(u.id));
  }, [users, selectedAttendeeIds]);

  const toggleAttendee = (userId: string) => {
    setSelectedAttendeeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const removeAttendee = (userId: string) => {
    setSelectedAttendeeIds((prev) => prev.filter((id) => id !== userId));
  };

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

  const handleConfirm = () => {
    const target = (isManagerOrAdmin && bookForOthers && selectedTargetUserId)
      ? selectedTargetUserId
      : undefined;
    onConfirmRoomBooking(
      room,
      duration,
      date,
      startTime,
      endTime,
      target,
      selectedAttendeeIds,
      includeTeams
    );
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#121724] border border-white/[0.1] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">meeting_room</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{room.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{room.code} • Capacity: {room.capacity} Persons</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1 custom-scrollbar">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold text-[11px] ${
                isOccupied
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isOccupied ? 'Currently In Use' : 'Available for Booking'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Room Amenities:</span>
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px]"
                >
                  ✓ {a}
                </span>
              ))}
            </div>
          </div>

          {isOccupied && room.occupant && (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1">
              <span className="text-slate-400 text-[11px] block">Booked by:</span>
              <p className="text-xs font-semibold text-white">{room.occupant.name}</p>
              <p className="text-[11px] text-emerald-400 font-mono">Until {room.occupant.bookedTime.split('-')[1]} ({room.occupant.hoursRemaining} left)</p>
            </div>
          )}

          {!isOccupied && (
            <div className="space-y-4 pt-1">
              {/* Manager & Admin: Booking Recipient Selector */}
              {isManagerOrAdmin && users.length > 0 && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-sky-400">badge</span>
                      Organizer / Host
                    </label>
                    <span className="text-[10px] font-mono text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-400/30 font-semibold">
                      {userRole.toUpperCase()} PRIVILEGE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookForOthers(false)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border text-center cursor-pointer transition-all ${
                        !bookForOthers
                          ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-semibold shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      Book as Myself
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookForOthers(true)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border text-center cursor-pointer transition-all ${
                        bookForOthers
                          ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-semibold shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      Book for Employee
                    </button>
                  </div>

                  {bookForOthers && (
                    <div className="pt-1">
                      <label className="text-[10px] text-slate-400 block mb-1">Select Lead Host / Organizer:</label>
                      <select
                        value={selectedTargetUserId}
                        onChange={(e) => setSelectedTargetUserId(e.target.value)}
                        className="w-full bg-[#0d111a] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email}) — {u.role.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Date selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 block">Reservation Date</label>
                  <span className="text-sky-400 font-mono text-[11px]">{formatDisplayDate(date)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setDate(todayIso)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                      date === todayIso
                        ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-semibold'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(tomorrowIso)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                      date === tomorrowIso
                        ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-semibold'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0d111a] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white font-mono cursor-pointer focus:border-sky-400 focus:outline-none"
                />
              </div>

              {/* Time window selection */}
              <div>
                <label className="text-slate-400 block mb-1">Meeting Duration Preset</label>
                <select
                  value={duration}
                  onChange={(e) => handleDurationPreset(e.target.value)}
                  className="w-full bg-[#0d111a] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer mb-2"
                >
                  <option value="1 Hour (09:00 - 10:00)">1 Hour (09:00 - 10:00)</option>
                  <option value="2 Hours (09:00 - 11:00)">2 Hours (09:00 - 11:00)</option>
                  <option value="Half Day (09:00 - 13:00)">Half Day (09:00 - 13:00)</option>
                  <option value="Full Day (09:00 - 17:00)">Full Day (09:00 - 17:00)</option>
                </select>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Start Time</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#0d111a] border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <span className="text-slate-500 text-xs mt-3">→</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block mb-0.5">End Time</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#0d111a] border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* MICROSOFT TEAMS VIDEO INTEGRATION SECTION */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#464EB8]/10 via-[#121724] to-[#121724] border border-[#464EB8]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#464EB8] text-white flex items-center justify-center shadow-[0_0_12px_rgba(70,78,184,0.5)]">
                      <span className="material-symbols-outlined text-lg">video_call</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Microsoft Teams Meeting</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#464EB8]/30 text-indigo-300 font-semibold">
                          INTEGRATED
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Include video conferencing link in invitation
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTeams}
                      onChange={(e) => setIncludeTeams(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#464EB8]"></div>
                  </label>
                </div>

                {includeTeams && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#090D16]/90 border border-[#464EB8]/20 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-indigo-300 truncate">
                      <span className="material-symbols-outlined text-xs text-[#7B83EB]">link</span>
                      <span className="font-mono truncate">teams.microsoft.com/l/meetup-join/...</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex-shrink-0">
                      Auto-Generated
                    </span>
                  </div>
                )}
              </div>

              {/* INVITE ATTENDEES & TEAM MEMBERS SECTION */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-sky-400">group_add</span>
                    Invite Team Members / Attendees
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    <strong className="text-sky-400">{selectedAttendeeIds.length}</strong> invited • Cap: {room.capacity}
                  </span>
                </div>

                {/* Selected Attendees Chips */}
                {selectedAttendees.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#0d111a] border border-white/[0.06] max-h-24 overflow-y-auto custom-scrollbar">
                    {selectedAttendees.map((att) => (
                      <span
                        key={att.id}
                        className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-200 text-[11px] animate-in fade-in"
                      >
                        <img
                          src={att.avatar}
                          alt={att.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="font-medium">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttendee(att.id)}
                          className="text-sky-300 hover:text-white hover:bg-sky-400/20 rounded p-0.5 transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search Colleagues */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search colleagues by name, email, department..."
                    value={attendeeSearchQuery}
                    onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                    className="w-full bg-[#0d111a] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Available Colleagues List */}
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredAttendees.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-2">
                      No matching colleagues found
                    </p>
                  ) : (
                    filteredAttendees.map((user) => {
                      const isSelected = selectedAttendeeIds.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleAttendee(user.id)}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-sky-500/15 border-sky-400/40 text-white'
                              : 'bg-white/[0.02] border-white/[0.04] text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-medium text-xs truncate leading-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {user.department && (
                              <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">
                                {user.department.split('&')[0]}
                              </span>
                            )}
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-sky-500 text-black'
                                  : 'bg-white/[0.05] text-slate-400 hover:text-white'
                              }`}
                            >
                              {isSelected ? '✓ Added' : '+ Add'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                  <span className="material-symbols-outlined text-xs text-sky-400">info</span>
                  <span>All selected attendees will receive Outlook calendar invites and will see this meeting on their personal schedule.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-white/[0.08] flex-shrink-0">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {selectedAttendeeIds.length > 0
              ? `${selectedAttendeeIds.length} attendee${selectedAttendeeIds.length > 1 ? 's' : ''} invited`
              : 'Solo reservation'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            {!isOccupied && (
              <button
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {includeTeams && <span className="material-symbols-outlined text-sm">video_call</span>}
                <span>Reserve Room {selectedAttendeeIds.length > 0 ? `& Invite (${selectedAttendeeIds.length})` : ''}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

