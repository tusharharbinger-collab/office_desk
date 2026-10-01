import React, { useState, useEffect } from 'react';
import {
  Desk,
  Room,
  UserProfile,
  Booking,
  Role,
  SystemHealthMetric
} from './types';
import {
  INITIAL_USERS,
  INITIAL_SYSTEM_HEALTH,
  generateWorkArea1Desks,
  generateWorkArea2Desks,
  WORK_AREA_1_ROOMS,
  WORK_AREA_2_ROOMS
} from './data/officeLayouts';
import { api } from './services/api';

import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { SignUpModal } from './components/SignUpModal';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { FloorPlanViewport } from './components/FloorPlanViewport';
import { BookingBar } from './components/BookingBar';
import { MyBookingsModal } from './components/MyBookingsModal';
import { EditBookingModal } from './components/EditBookingModal';
import { ManagerAnalyticsModal } from './components/ManagerAnalyticsModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { AdminHealthModal } from './components/AdminHealthModal';
import { RegisterModal } from './components/RegisterModal';
import { TimeGridModal } from './components/TimeGridModal';
import { RoomBookingModal } from './components/RoomBookingModal';
import { MicrosoftSSOModal } from './components/MicrosoftSSOModal';
import { getTodayISODate } from './utils/dateTime';

export const App: React.FC = () => {
  // Authentication & View State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);

  // Selected Employee for Allocation (Admins and Managers allocate for chosen employees)
  const [selectedTargetUser, setSelectedTargetUser] = useState<UserProfile | null>(null);

  // Auth Modals
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignUpModal, setShowSignUpModal] = useState<boolean>(false);
  const [showMicrosoftSSOModal, setShowMicrosoftSSOModal] = useState<boolean>(false);

  // Layout UI State (Default to spacious slim rail mode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [activeArea, setActiveArea] = useState<'area-1' | 'area-2'>('area-1');
  const [activeTab, setActiveTab] = useState<ActiveTab>('floor-plan');

  // Zoom & Search
  const [scale, setScale] = useState<number>(0.7);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedDeskId, setHighlightedDeskId] = useState<string | null>(null);

  // Desks & Rooms state from SQLite database
  const [area1Desks, setArea1Desks] = useState<Desk[]>(() => generateWorkArea1Desks());
  const [area2Desks, setArea2Desks] = useState<Desk[]>(() => generateWorkArea2Desks());
  const [area1Rooms, setArea1Rooms] = useState<Room[]>(WORK_AREA_1_ROOMS);
  const [area2Rooms, setArea2Rooms] = useState<Room[]>(WORK_AREA_2_ROOMS);

  // Active Floor Plan selection & settings
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('Full Day (8h)');
  const [showPresence, setShowPresence] = useState(false);

  // Exact Date and Time Slot state for dynamic allocation & de-allocation
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayISODate());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('full-day');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');

  // Bookings list
  const [bookings, setBookings] = useState<Booking[]>([]);

  // System Health
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetric>(INITIAL_SYSTEM_HEALTH);

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.45));
  const handleResetZoom = () => setScale(0.8);

  // Search handler
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setHighlightedDeskId(null);
      return;
    }

    const q = query.toLowerCase();
    const currentDesksList = activeArea === 'area-1' ? area1Desks : area2Desks;
    const matched = currentDesksList.find(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.occupant && d.occupant.name.toLowerCase().includes(q)) ||
        (d.occupant && d.occupant.department.toLowerCase().includes(q))
    );

    if (matched) {
      setHighlightedDeskId(matched.id);
      if (matched.occupant && !showPresence) setShowPresence(true);
    } else {
      setHighlightedDeskId(null);
    }
  };

  // Load Initial Desks & Auth from SQLite on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Check for Microsoft OAuth redirect callback (?code=...)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        if (authCode) {
          window.history.replaceState({}, document.title, window.location.pathname);
          try {
            const res = await api.loginWithMicrosoftCode(authCode);
            setCurrentUser(res.user);
            setIsAuthenticated(true);
            showToast(`Welcome, ${res.user.name}! (Microsoft 365)`);
          } catch (err: any) {
            showToast(err.message || 'Failed to complete Microsoft login');
          }
        }

        const me = await api.getMe();
        if (me) {
          setCurrentUser(me);
          setIsAuthenticated(true);
        }

        const dbUsers = await api.getUsers().catch(() => null);
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
          const activeRole = me ? me.role : currentUser.role;
          if (activeRole === 'admin' || activeRole === 'manager') {
            const firstEmp = dbUsers.find((u: UserProfile) => u.role === 'user' && u.active);
            if (firstEmp) setSelectedTargetUser(firstEmp);
          }
        }

        const [desks1, desks2] = await Promise.all([
          api.getDesks('area-1', selectedDate, startTime, endTime).catch(() => null),
          api.getDesks('area-2', selectedDate, startTime, endTime).catch(() => null)
        ]);
        if (desks1 && desks1.length > 0) setArea1Desks(desks1);
        if (desks2 && desks2.length > 0) setArea2Desks(desks2);

        const [rooms1, rooms2] = await Promise.all([
          api.getRooms('area-1', selectedDate, startTime, endTime).catch(() => null),
          api.getRooms('area-2', selectedDate, startTime, endTime).catch(() => null)
        ]);
        if (rooms1 && rooms1.length > 0) setArea1Rooms(rooms1);
        if (rooms2 && rooms2.length > 0) setArea2Rooms(rooms2);

        if (me) {
          const myBookings = await api.getMyBookings().catch(() => []);
          setBookings(myBookings);
        }
      } catch (err) {
        console.warn('Backend SQLite sync...', err);
      }
    }

    loadData();
  }, [isAuthenticated]);

  // Refresh active desks and rooms with date/time slot filtering
  const refreshDesks = async (date = selectedDate, start = startTime, end = endTime) => {
    try {
      const [desks1, desks2, rooms1, rooms2] = await Promise.all([
        api.getDesks('area-1', date, start, end).catch(() => null),
        api.getDesks('area-2', date, start, end).catch(() => null),
        api.getRooms('area-1', date, start, end).catch(() => null),
        api.getRooms('area-2', date, start, end).catch(() => null)
      ]);
      if (desks1) setArea1Desks(desks1);
      if (desks2) setArea2Desks(desks2);
      if (rooms1) setArea1Rooms(rooms1);
      if (rooms2) setArea2Rooms(rooms2);
    } catch {
      // fallback
    }
  };

  // Re-sync allocations whenever selectedDate, startTime, endTime, or activeArea change
  // Also periodically poll every 30s to de-allocate expired seats dynamically
  useEffect(() => {
    refreshDesks(selectedDate, startTime, endTime);
    const interval = setInterval(() => {
      refreshDesks(selectedDate, startTime, endTime);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedDate, startTime, endTime, activeArea]);

  const currentDesks = activeArea === 'area-1' ? area1Desks : area2Desks;
  const currentRooms = activeArea === 'area-1' ? area1Rooms : area2Rooms;

  const totalSeats = currentDesks.length;
  const bookedSeats = currentDesks.filter((d) => d.status === 'booked').length;
  const occupancyRate = Math.round((bookedSeats / totalSeats) * 100);

  // Quick Demo Login from Landing Page
  const handleQuickDemoLogin = (role: 'admin' | 'manager' | 'employee') => {
    let user = INITIAL_USERS[0];
    if (role === 'manager') user = INITIAL_USERS[1];
    else if (role === 'employee') user = INITIAL_USERS[2];

    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'manager') {
      setSelectedTargetUser(null);
    } else {
      setSelectedTargetUser(user);
    }
    setIsAuthenticated(true);
    showToast(`Welcome! Logged in as ${user.name} (${user.role.toUpperCase()})`);
  };

  // Auth Success Handlers
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'manager') {
      setSelectedTargetUser(null);
    } else {
      setSelectedTargetUser(user);
    }
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.name}!`);
    api.getMyBookings().then(setBookings).catch(() => {});
    refreshDesks();
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    showToast('Signed out of SmartDesk');
  };

  // Desk selection handler
  const handleSelectDesk = (desk: Desk) => {
    if (desk.status === 'booked') {
      showToast(`Desk ${desk.id} is occupied by ${desk.occupant?.name || 'another team member'}.`);
      return;
    }

    if (selectedDesk?.id === desk.id) {
      setSelectedDesk(null);
    } else {
      setSelectedDesk(desk);
    }
  };

  // Confirm Desk Reservation (Real SQLite DB creation with role enforcement)
  const handleConfirmReservation = async () => {
    if (!selectedDesk) return;

    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';
    const targetEmployee = isAdminOrManager ? selectedTargetUser : currentUser;

    if (isAdminOrManager && (!targetEmployee || targetEmployee.id === currentUser.id)) {
      showToast('Admins and Managers cannot book seats for themselves. Please select an employee to allocate this seat.');
      return;
    }

    try {
      const newBooking = await api.createBooking({
        deskId: selectedDesk.id,
        areaId: activeArea,
        duration: selectedDuration,
        bookingDate: selectedDate,
        startTime,
        endTime,
        targetUserId: targetEmployee ? targetEmployee.id : undefined
      });

      setBookings((prev) => [newBooking, ...prev]);

      const effectiveUser = targetEmployee || currentUser;
      const updateDesk = (desksList: Desk[]) =>
        desksList.map((d) =>
          d.id === selectedDesk.id
            ? {
                ...d,
                status: 'booked' as const,
                occupant: {
                  name: effectiveUser.name,
                  avatar: effectiveUser.avatar,
                  department: effectiveUser.department,
                  role: `${effectiveUser.role.toUpperCase()}`,
                  bookedTime: `${newBooking.startTime} - ${newBooking.endTime}`,
                  hoursRemaining: selectedDuration.includes('Morning') ? '4h' : '8h'
                }
              }
            : d
        );

      if (activeArea === 'area-1') setArea1Desks(updateDesk);
      else setArea2Desks(updateDesk);

      setSelectedDesk(null);
      if (isAdminOrManager) setSelectedTargetUser(null);
      refreshDesks(selectedDate, startTime, endTime);
      showToast(
        isAdminOrManager
          ? `🎉 Seat ${newBooking.deskId} successfully allocated to ${effectiveUser.name}!`
          : `🎉 Reservation confirmed! Seat ${newBooking.deskId} allocated for ${newBooking.date} (${newBooking.startTime}-${newBooking.endTime}).`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to complete reservation');
    }
  };

  // Cancel Booking (Immediately de-allocates the seat in SQLite)
  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      await api.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      refreshDesks(selectedDate, startTime, endTime);
      showToast(`Reservation for seat ${booking.deskId} has been cancelled and seat is now free.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel');
    }
  };

  // Check In
  const handleCheckIn = async (bookingId: string) => {
    try {
      await api.checkInBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, checkInStatus: true } : b))
      );
      showToast(`✓ Check-In verified in SQLite!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to check in');
    }
  };

  // Save modified booking
  const handleSaveModifiedBooking = async (updatedBooking: Booking) => {
    try {
      await api.updateBooking(updatedBooking.id, {
        duration: updatedBooking.duration,
        deskId: updatedBooking.deskId,
        date: updatedBooking.date,
        startTime: updatedBooking.startTime,
        endTime: updatedBooking.endTime
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );

      refreshDesks(selectedDate, startTime, endTime);
      showToast(`Booking updated: ${updatedBooking.deskId} on ${updatedBooking.date} (${updatedBooking.startTime}-${updatedBooking.endTime}).`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update');
    }
  };

  // Force release ghost desk (Manager feature)
  const handleReleaseGhostSeat = async (deskId: string) => {
    try {
      await api.releaseGhostSeat(deskId);
      refreshDesks(selectedDate, startTime, endTime);
      setBookings((prev) => prev.filter((b) => b.deskId !== deskId));
      showToast(`Ghost desk ${deskId} released and opened for booking.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to release desk');
    }
  };

  // Locate seat on map
  const handleLocateSeat = (areaId: 'area-1' | 'area-2', deskId: string) => {
    setActiveArea(areaId);
    setActiveTab('floor-plan');
    setShowPresence(true);
    setHighlightedDeskId(deskId);
    showToast(`Panning to Seat ${deskId}...`);
  };

  // Room booking confirmation
  const handleConfirmRoomBooking = async (
    room: Room,
    duration: string,
    bookingDate: string,
    roomStart: string,
    roomEnd: string
  ) => {
    try {
      await api.createBooking({
        roomId: room.id,
        areaId: activeArea,
        duration,
        bookingDate,
        startTime: roomStart,
        endTime: roomEnd
      });

      refreshDesks(selectedDate, startTime, endTime);
      setSelectedRoomForBooking(null);
      showToast(`Meeting Room ${room.name} confirmed for ${bookingDate} (${roomStart} - ${roomEnd})!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to book room');
    }
  };

  // User management (Admin features)
  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (currentUser.id === userId) {
        setCurrentUser((prev) => ({ ...prev, role: newRole }));
      }
      showToast(`Role updated in SQLite database.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update role');
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await api.toggleUserActive(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
      );
      showToast(`Status toggled in SQLite.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast(`User removed from SQLite.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete');
    }
  };

  const handleAddUser = (newUser: Omit<UserProfile, 'id'>) => {
    api.register({
      name: newUser.name,
      email: newUser.email,
      password: 'password123',
      department: newUser.department,
      role: newUser.role
    }).then((res) => {
      setUsers((prev) => [res.user, ...prev]);
      showToast(`Employee ${newUser.name} added to SQLite.`);
    }).catch((err) => showToast(err.message));
  };

  // If unauthenticated, show the Landing Page!
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenSignUp={() => setShowSignUpModal(true)}
          onQuickDemoLogin={handleQuickDemoLogin}
          onOpenMicrosoftSSO={() => setShowMicrosoftSSOModal(true)}
          onExploreArea={(area) => {
            setActiveArea(area);
            handleQuickDemoLogin('employee');
          }}
        />

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleAuthSuccess}
          onOpenSignUp={() => {
            setShowLoginModal(false);
            setShowSignUpModal(true);
          }}
          onOpenMicrosoftSSO={() => setShowMicrosoftSSOModal(true)}
        />

        <SignUpModal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onSuccess={handleAuthSuccess}
          onOpenLogin={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
          onOpenMicrosoftSSO={() => {
            setShowSignUpModal(false);
            setShowMicrosoftSSOModal(true);
          }}
        />

        <MicrosoftSSOModal
          isOpen={showMicrosoftSSOModal}
          onClose={() => setShowMicrosoftSSOModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Authenticated Dashboard Experience (Clean, Spacious & Unblocked)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-on-surface">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface-container-high/95 backdrop-blur-2xl border border-primary/50 text-on-surface px-5 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.7)] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar (Supports Collapsible Rail Mode) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={currentUser.role}
        bookingsCount={bookings.length}
        isCollapsed={isSidebarCollapsed}
        onLogout={handleLogout}
        onGoToLanding={() => setIsAuthenticated(false)}
      />

      {/* Main View Area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
          isSidebarCollapsed ? 'pl-16' : 'pl-60'
        }`}
      >
        {/* Single Unified Sleek Header */}
        <Header
          activeArea={activeArea}
          onAreaChange={(area) => {
            setActiveArea(area);
            setSelectedDesk(null);
            setHighlightedDeskId(null);
          }}
          selectedDate={selectedDate}
          onDateChange={(d) => {
            setSelectedDate(d);
            refreshDesks(d, startTime, endTime);
          }}
          selectedTimeSlot={selectedTimeSlot}
          onTimeSlotChange={(slotId, sTime, eTime) => {
            setSelectedTimeSlot(slotId);
            const s = sTime || startTime;
            const e = eTime || endTime;
            setStartTime(s);
            setEndTime(e);
            refreshDesks(selectedDate, s, e);
          }}
          startTime={startTime}
          endTime={endTime}
          onCustomTimeChange={(s, e) => {
            setSelectedTimeSlot('custom');
            setStartTime(s);
            setEndTime(e);
            refreshDesks(selectedDate, s, e);
          }}
          currentUser={currentUser}
          allUsers={users}
          onSwitchUser={(user) => {
            setCurrentUser(user);
            if (user.role === 'admin' || user.role === 'manager') {
              setSelectedTargetUser(null);
            } else {
              setSelectedTargetUser(user);
            }
            showToast(`Switched active profile to ${user.name} (${user.role.toUpperCase()})`);
          }}
          onOpenRegister={() => setShowRegisterModal(true)}
          occupancyRate={occupancyRate}
          totalSeats={totalSeats}
          bookedSeats={bookedSeats}
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showPresence={showPresence}
          onTogglePresence={setShowPresence}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
          onGoToLanding={() => setIsAuthenticated(false)}
        />

        {/* Central Floor Plan Viewport (Full Screen & Spacious) */}
        <main className="flex-1 pt-14 relative overflow-hidden bg-background">
          {/* Allocation mode banner for Admin & Manager - Docked safely at top-right with dismiss button */}
          {(currentUser.role === 'admin' || currentUser.role === 'manager') && selectedTargetUser && (
            <div
              style={{ backgroundColor: '#131826' }}
              className="absolute top-3.5 right-6 z-20 hidden md:flex items-center gap-2.5 bg-[#131826] border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.85)] text-xs pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse flex-shrink-0" />
              <span className="text-slate-400 text-[11px]">Allocating for:</span>
              <img
                src={selectedTargetUser.avatar}
                alt={selectedTargetUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-400/50"
              />
              <span className="font-semibold text-slate-100">{selectedTargetUser.name}</span>
              <span className="text-[10px] text-emerald-400 font-mono">({selectedTargetUser.department})</span>
              <button
                type="button"
                onClick={() => setSelectedTargetUser(null)}
                className="ml-1 w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                title="Cancel allocation mode"
              >
                ✕
              </button>
            </div>
          )}

          <FloorPlanViewport
            activeArea={activeArea}
            desks={currentDesks}
            rooms={currentRooms}
            selectedDesk={selectedDesk}
            showPresence={showPresence}
            highlightedDeskId={highlightedDeskId}
            scale={scale}
            onScaleChange={setScale}
            onSelectDesk={handleSelectDesk}
            onSelectRoom={setSelectedRoomForBooking}
          />

          {/* Floating Bottom Booking Drawer (Appears ONLY when seat is selected) */}
          <BookingBar
            selectedDesk={selectedDesk}
            selectedDuration={selectedDuration}
            onDurationChange={setSelectedDuration}
            selectedDate={selectedDate}
            startTime={startTime}
            endTime={endTime}
            onShiftSelect={(slotId, s, e, dur) => {
              setSelectedTimeSlot(slotId);
              setStartTime(s);
              setEndTime(e);
              setSelectedDuration(dur);
              refreshDesks(selectedDate, s, e);
            }}
            onConfirm={handleConfirmReservation}
            onClearSelection={() => setSelectedDesk(null)}
            currentUser={currentUser}
            users={users}
            selectedTargetUser={selectedTargetUser}
            onSelectTargetUser={setSelectedTargetUser}
          />
        </main>
      </div>

      {/* Modals for App Router navigation tabs */}
      <MyBookingsModal
        isOpen={activeTab === 'my-bookings'}
        onClose={() => setActiveTab('floor-plan')}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        onCheckIn={handleCheckIn}
        onOpenEdit={(b) => {
          setEditingBooking(b);
          setShowEditBookingModal(true);
        }}
      />

      <EditBookingModal
        isOpen={showEditBookingModal}
        onClose={() => {
          setShowEditBookingModal(false);
          setEditingBooking(null);
        }}
        booking={editingBooking}
        availableDesks={currentDesks.filter((d) => d.status === 'available')}
        onSave={handleSaveModifiedBooking}
      />

      <ManagerAnalyticsModal
        isOpen={activeTab === 'analytics'}
        onClose={() => setActiveTab('floor-plan')}
        area1Desks={area1Desks}
        area2Desks={area2Desks}
        onLocateSeat={handleLocateSeat}
        onReleaseSeat={handleReleaseGhostSeat}
        users={users}
        onBookForUser={(emp) => {
          setSelectedTargetUser(emp);
          setActiveTab('floor-plan');
          showToast(`Allocating seat for ${emp.name}. Select an available green desk.`);
        }}
      />

      <AdminUsersModal
        isOpen={activeTab === 'admin-users'}
        onClose={() => setActiveTab('floor-plan')}
        users={users}
        onUpdateRole={handleUpdateRole}
        onToggleActive={handleToggleActive}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onBookForUser={(emp) => {
          setSelectedTargetUser(emp);
          setActiveTab('floor-plan');
          showToast(`Allocating seat for ${emp.name}. Select an available green desk.`);
        }}
      />

      <AdminHealthModal
        isOpen={activeTab === 'admin-health'}
        onClose={() => setActiveTab('floor-plan')}
        health={systemHealth}
      />

      <TimeGridModal
        isOpen={activeTab === 'time-grid'}
        onClose={() => setActiveTab('floor-plan')}
        activeArea={activeArea}
        desks={currentDesks}
        onSelectDesk={handleSelectDesk}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={(user) => {
          setUsers((prev) => [user, ...prev]);
          setCurrentUser(user);
          showToast(`Account registered in SQLite: ${user.name}`);
        }}
      />

      <RoomBookingModal
        isOpen={!!selectedRoomForBooking}
        room={selectedRoomForBooking}
        onClose={() => setSelectedRoomForBooking(null)}
        selectedDate={selectedDate}
        defaultStartTime={startTime}
        defaultEndTime={endTime}
        onConfirmRoomBooking={handleConfirmRoomBooking}
      />

      <MicrosoftSSOModal
        isOpen={showMicrosoftSSOModal}
        onClose={() => setShowMicrosoftSSOModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
