import React, { useState, useMemo } from 'react';
import { Room, Role, OfficeLocation } from '../types';

interface MeetingRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  userRole: Role;
  selectedOffice?: OfficeLocation;
  onSelectRoomForBooking: (room: Room) => void;
  onCreateRoom: (roomData: {
    name: string;
    code: string;
    areaId: 'area-1' | 'area-2';
    capacity: number;
    amenities: string[];
    officeId?: OfficeLocation;
  }) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
  isPageView?: boolean;
}

export const MeetingRoomsModal: React.FC<MeetingRoomsModalProps> = ({
  isOpen,
  onClose,
  rooms,
  userRole,
  selectedOffice = 'global-port',
  onSelectRoomForBooking,
  onCreateRoom,
  onDeleteRoom,
  isPageView = true
}) => {
  if (!isOpen) return null;

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<'all' | 'area-1' | 'area-2'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');

  // Create Room Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newAreaId, setNewAreaId] = useState<'area-1' | 'area-2'>('area-1');
  const [newCapacity, setNewCapacity] = useState(6);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '4K Video Conferencing',
    'Digital Whiteboard'
  ]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Common amenities library
  const availableAmenitiesPool = [
    '4K Video Conferencing',
    '85" Digital Whiteboard',
    'Polycom Mic Array',
    'Acoustic Insulation',
    'Glass Privacy Frosting',
    'Ergonomic Chairs',
    'Dual 65" Displays',
    'Presentation Clicker',
    'Webcam Bar',
    'Soundproof Door',
    'Private Balcony Access'
  ];

  // Stats
  const totalRooms = rooms.length;
  const availableCount = useMemo(() => rooms.filter((r) => r.status !== 'occupied').length, [rooms]);
  const occupiedCount = useMemo(() => rooms.filter((r) => r.status === 'occupied').length, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        room.name.toLowerCase().includes(q) ||
        room.code.toLowerCase().includes(q) ||
        room.amenities.some((a) => a.toLowerCase().includes(q));

      const matchesArea = areaFilter === 'all' || room.areaId === areaFilter;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'available'
          ? room.status !== 'occupied'
          : room.status === 'occupied';

      const matchesCapacity =
        capacityFilter === 'all'
          ? true
          : capacityFilter === 'small'
          ? room.capacity <= 4
          : capacityFilter === 'medium'
          ? room.capacity >= 5 && room.capacity <= 8
          : room.capacity >= 9;

      return matchesSearch && matchesArea && matchesStatus && matchesCapacity;
    });
  }, [rooms, searchQuery, areaFilter, statusFilter, capacityFilter]);

  // Handle Amenity toggle in create modal
  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities([...selectedAmenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreateRoom({
        name: newName.trim(),
        code: newCode.trim(),
        areaId: newAreaId,
        capacity: newCapacity,
        amenities: selectedAmenities,
        officeId: selectedOffice
      });
      setShowCreateModal(false);
      setNewName('');
      setNewCode('');
      setNewCapacity(6);
      setSelectedAmenities(['4K Video Conferencing', 'Digital Whiteboard']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    try {
      await onDeleteRoom(roomId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const content = (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Top Page Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#121724]/90 border border-white/[0.08] shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] flex-shrink-0">
            <span className="material-symbols-outlined text-[26px]">meeting_room</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Workspace / Collaboration
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 font-mono font-bold uppercase">
                {totalRooms} Meeting Rooms
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Meeting Room & Conference Suites Booking
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse soundproof cabins, executive boardrooms, and focus suites. All team members can book rooms for meetings.
            </p>
          </div>
        </div>

        {/* Action Header Pill & Create Button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 bg-[#0d111a] border border-white/[0.08] px-3.5 py-2 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-semibold text-white">{availableCount}</span> Available
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
              <span className="font-semibold text-white">{occupiedCount}</span> In Use
            </div>
          </div>

          {/* Manager & Admin: Create Room Button */}
          {isManagerOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Create Meeting Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0e1422]/80 border border-white/[0.06] backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Search by room name, code, amenity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090D16] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Area Filter */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#090D16] border border-white/[0.08] text-xs">
            <button
              onClick={() => setAreaFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                areaFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Floors
            </button>
            <button
              onClick={() => setAreaFilter('area-1')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                areaFilter === 'area-1'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Area 1
            </button>
            <button
              onClick={() => setAreaFilter('area-2')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                areaFilter === 'area-2'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Area 2
            </button>
          </div>

          {/* Status Filter */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#090D16] border border-white/[0.08] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'available'
                  ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setStatusFilter('occupied')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'occupied'
                  ? 'bg-rose-500/20 text-rose-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Use
            </button>
          </div>

          {/* Capacity Filter */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#090D16] border border-white/[0.08] text-xs">
            <button
              onClick={() => setCapacityFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                capacityFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Any Size
            </button>
            <button
              onClick={() => setCapacityFilter('small')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                capacityFilter === 'small'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1-4
            </button>
            <button
              onClick={() => setCapacityFilter('medium')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                capacityFilter === 'medium'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5-8
            </button>
            <button
              onClick={() => setCapacityFilter('large')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                capacityFilter === 'large'
                  ? 'bg-sky-500/20 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              9+
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-[#0e1422]/60 border border-white/[0.06] text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] text-slate-500 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-3xl">meeting_room</span>
          </div>
          <h3 className="text-base font-semibold text-white">No meeting rooms found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            {isManagerOrAdmin
              ? 'No meeting rooms match your filter. You can create a new meeting room using the button above.'
              : 'No meeting rooms match your filter. Try adjusting your search query or filters.'}
          </p>
          {isManagerOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-semibold cursor-pointer hover:bg-sky-500/30 transition-all"
            >
              + Create Meeting Room
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === 'occupied';

            return (
              <div
                key={room.id}
                className="bg-[#101625]/90 border border-white/[0.08] hover:border-sky-500/40 transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between shadow-xl shadow-black/40 group relative"
              >
                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === room.id && (
                  <div className="absolute inset-0 bg-[#0d111a]/95 backdrop-blur-md rounded-3xl p-5 flex flex-col items-center justify-center text-center z-20 animate-in fade-in">
                    <span className="material-symbols-outlined text-rose-400 text-3xl mb-1">
                      warning
                    </span>
                    <h4 className="text-sm font-bold text-white">Delete Meeting Room?</h4>
                    <p className="text-xs text-slate-400 mb-4 max-w-[220px]">
                      This will permanently remove <strong>{room.name}</strong> from the database.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-rose-500/30"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-xl">co_present</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                            {room.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                            {room.code}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {room.areaId === 'area-1' ? 'Area 1 (Main)' : 'Area 2 (Work Room)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button (Manager / Admin) */}
                    {isManagerOrAdmin && (
                      <button
                        onClick={() => setDeleteConfirmId(room.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 flex items-center justify-center transition-colors cursor-pointer border border-rose-500/20"
                        title="Delete Meeting Room"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>

                  {/* Room Meta Badges */}
                  <div className="flex items-center gap-2 mb-3.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 font-mono">
                      <span className="material-symbols-outlined text-sm text-sky-400">group</span>
                      <span>Capacity: {room.capacity} Persons</span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-semibold ${
                        isOccupied
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOccupied ? 'bg-rose-400 shadow-[0_0_6px_#fb7185]' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                        }`}
                      />
                      <span>{isOccupied ? 'In Use' : 'Available'}</span>
                    </div>
                  </div>

                  {/* Occupant Details if Occupied */}
                  {isOccupied && room.occupant && (
                    <div className="mb-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
                      <img
                        src={room.occupant.avatar}
                        alt={room.occupant.name}
                        className="w-8 h-8 rounded-full border border-sky-400/40 object-cover"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">
                          {room.occupant.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Slot: {room.occupant.bookedTime} ({room.occupant.hoursRemaining} left)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Amenities List */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                      Included Amenities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {room.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300 text-[11px] flex items-center gap-1"
                        >
                          <span className="text-sky-400 text-[12px]">✓</span>
                          <span>{amenity}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Instant Pass
                  </div>
                  <button
                    onClick={() => onSelectRoomForBooking(room)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span>{isOccupied ? 'Reserve Next Slot' : 'Book Room'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info & Floor Plan Return Bar */}
      <div className="p-4 rounded-2xl bg-[#0e1422]/90 border border-white/[0.08] flex flex-wrap justify-between items-center text-xs text-slate-400 gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-sky-400">info</span>
          <span>
            Meeting room reservations instantly update real-time occupancy across all floor plans.
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all cursor-pointer shadow-md shadow-sky-500/20"
        >
          Return to Floor Plan
        </button>
      </div>

      {/* ========================================================
          CREATE MEETING ROOM MODAL (Manager & Admin only)
         ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121724] border border-white/[0.1] rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">add_business</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Meeting Room</h3>
                  <p className="text-xs text-slate-400">Configure room details, capacity, and equipment</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Room Name */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">Room Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Boardroom Alpha"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-[#090D16] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Room Code & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Room Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. CONF-01"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="w-full bg-[#090D16] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Floor / Work Area</label>
                  <select
                    value={newAreaId}
                    onChange={(e) => setNewAreaId(e.target.value as 'area-1' | 'area-2')}
                    className="w-full bg-[#090D16] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="area-1">Area 1 (Main Floor)</option>
                    <option value="area-2">Area 2 (Work Room 2)</option>
                  </select>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Seating Capacity</label>
                  <span className="text-sky-400 font-mono font-bold text-xs">{newCapacity} Persons</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2 (1-on-1 Cabin)</span>
                  <span>14 (Boardroom)</span>
                  <span>30 (All-Hands Suite)</span>
                </div>
              </div>

              {/* Amenities Picker */}
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">
                  Select Equipment & Amenities:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {availableAmenitiesPool.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-sky-500/20 text-sky-200 border-sky-400 shadow-sm'
                            : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amenity Adder */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add custom amenity..."
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                    className="flex-1 bg-[#090D16] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim() || !newCode.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Save & Publish Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isPageView) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#090D16] p-4 sm:p-6 lg:p-8 flex flex-col animate-in fade-in duration-150">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col pb-12">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0F17] border border-white/[0.1] rounded-3xl w-full max-w-5xl h-[85vh] p-6 shadow-2xl flex flex-col">
        <div className="flex justify-end pb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {content}
        </div>
      </div>
    </div>
  );
};
