import React, { useState, useEffect } from 'react';
import {
  Desk,
  Room,
  UserProfile,
  Booking,
  Role,
  SystemHealthMetric,
  OfficeLocation
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
import { OFFICES } from './data/officeConfig';

import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { SignUpModal } from './components/SignUpModal';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { FloorPlanViewport } from './components/FloorPlanViewport';
import { BookingBar } from './components/BookingBar';
import { SeatBookingModal } from './components/SeatBookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { EditBookingModal } from './components/EditBookingModal';
import { ManagerAnalyticsModal } from './components/ManagerAnalyticsModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { AdminHealthModal } from './components/AdminHealthModal';
import { RegisterModal } from './components/RegisterModal';
import { TimeGridModal } from './components/TimeGridModal';
import { RoomBookingModal } from './components/RoomBookingModal';
import { MeetingRoomsModal } from './components/MeetingRoomsModal';
import { MicrosoftSSOModal } from './components/MicrosoftSSOModal';
import { OutlookEmailsModal } from './components/OutlookEmailsModal';
import { OfficeSelectionModal } from './components/OfficeSelectionModal';
import { Avatar } from './components/Avatar';
import { getTodayISODate } from './utils/dateTime';

export const App: React.FC = () => {
  // Authentication & View State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  // Office Campus Location State (Global Port vs Siddhant)
  const [selectedOffice, setSelectedOffice] = useState<OfficeLocation>(() => {
    const saved = localStorage.getItem('smartdesk_selected_office');
    if (saved === 'siddhant' || saved === 'global-port') return saved;
    return 'global-port';
  });
  const [showOfficeModal, setShowOfficeModal] = useState<boolean>(false);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);

  // Selected Employee for Allocation (Admins and Managers allocate for chosen employees)
  const [selectedTargetUser, setSelectedTargetUser] = useState<UserProfile | null>(null);

  // Seat Booking Multi-Day & Custom Schedule Modal
  const [isSeatModalOpen, setIsSeatModalOpen] = useState<boolean>(false);

  // Auth Modals
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignUpModal, setShowSignUpModal] = useState<boolean>(false);
  const [showMicrosoftSSOModal, setShowMicrosoftSSOModal] = useState<boolean>(false);

  // Layout UI State (Default to spacious slim rail mode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [activeArea, setActiveArea] = useState<'area-1' | 'area-2'>('area-1');
  const [activeTab, setActiveTab] = useState<ActiveTab>('floor-plan');

  // Search & Highlight
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedDeskId, setHighlightedDeskId] = useState<string | null>(null);

  // Desks & Rooms state from SQLite database
  const [area1Desks, setArea1Desks] = useState<Desk[]>(() => generateWorkArea1Desks());
  const [area2Desks, setArea2Desks] = useState<Desk[]>(() => generateWorkArea2Desks());
  const [area1Rooms, setArea1Rooms] = useState<Room[]>(WORK_AREA_1_ROOMS);
  const [area2Rooms, setArea2Rooms] = useState<Room[]>(WORK_AREA_2_ROOMS);
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  // Active Floor Plan selection & settings
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('Full Day (8h)');

  // Exact Date and Time Slot state for dynamic allocation & de-allocation
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayISODate());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('full-day');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');

  // Bookings list
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  // System Health
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetric>(INITIAL_SYSTEM_HEALTH);

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [showOutlookEmailsModal, setShowOutlookEmailsModal] = useState<boolean>(false);
  const [outlookEmailsCount, setOutlookEmailsCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };


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
        (d.occupant && d.occupant.name.toLowerCase().includes(q))
    );

    if (matched) {
      setHighlightedDeskId(matched.id);
    } else {
      setHighlightedDeskId(null);
    }
  };

  // Handler to switch office campus (Global Port vs Siddhant)
  const handleSelectOffice = (office: OfficeLocation) => {
    setSelectedOffice(office);
    localStorage.setItem('smartdesk_selected_office', office);
    sessionStorage.setItem('smartdesk_office_chosen', 'true');
    setShowOfficeModal(false);
    setSelectedDesk(null);
    setHighlightedDeskId(null);
    refreshDesks(selectedDate, startTime, endTime, office);
    refreshBookingsData(office);
    showToast(`Switched active workspace to ${office === 'siddhant' ? 'Siddhant Campus' : 'Global Port'}`);
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
            setShowOfficeModal(true);
            showToast(`Welcome, ${res.user.name}! (Microsoft 365)`);
          } catch (err: any) {
            showToast(err.message || 'Failed to complete Microsoft login');
          }
        }

        const me = await api.getMe();
        if (me) {
          setCurrentUser(me);
          setIsAuthenticated(true);
          if (sessionStorage.getItem('smartdesk_office_chosen') !== 'true') {
            setShowOfficeModal(true);
          }
        }

        const dbUsers = await api.getUsers().catch(() => null);
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
        }

        const [desks1, desks2] = await Promise.all([
          api.getDesks('area-1', selectedDate, startTime, endTime, selectedOffice).catch(() => null),
          api.getDesks('area-2', selectedDate, startTime, endTime, selectedOffice).catch(() => null)
        ]);
        if (desks1 && desks1.length > 0) setArea1Desks(desks1);
        if (desks2 && desks2.length > 0) setArea2Desks(desks2);

        const [rooms1, rooms2, allR] = await Promise.all([
          api.getRooms('area-1', selectedDate, startTime, endTime, selectedOffice).catch(() => null),
          api.getRooms('area-2', selectedDate, startTime, endTime, selectedOffice).catch(() => null),
          api.getRooms('all', selectedDate, startTime, endTime, selectedOffice).catch(() => null)
        ]);
        if (rooms1 && rooms1.length > 0) setArea1Rooms(rooms1);
        if (rooms2 && rooms2.length > 0) setArea2Rooms(rooms2);
        if (allR && allR.length > 0) {
          setAllRooms(allR);
        } else {
          setAllRooms([...(rooms1 || WORK_AREA_1_ROOMS), ...(rooms2 || WORK_AREA_2_ROOMS)]);
        }

        const all = await api.getAllBookings(selectedOffice).catch(() => []);
        if (all) setAllBookings(all);

        if (me) {
          const myBookings = await api.getMyBookings(selectedOffice).catch(() => []);
          setBookings(myBookings);
        }

        const ems = await api.getEmailNotifications().catch(() => []);
        if (ems) setOutlookEmailsCount(ems.length);
      } catch (err) {
        console.warn('Backend SQLite sync...', err);
      }
    }

    loadData();
  }, [isAuthenticated]);

  // Refresh both allBookings (for seat rules) and user's myBookings
  const refreshBookingsData = async (office = selectedOffice) => {
    try {
      const all = await api.getAllBookings(office).catch(() => []);
      if (all) setAllBookings(all);
      const my = await api.getMyBookings(office).catch(() => []);
      if (my) setBookings(my);
      const ems = await api.getEmailNotifications().catch(() => []);
      if (ems) setOutlookEmailsCount(ems.length);
    } catch {
      // fallback
    }
  };

  // Refresh active desks and rooms with date/time slot & office filtering
  const refreshDesks = async (
    date = selectedDate,
    start = startTime,
    end = endTime,
    office = selectedOffice
  ) => {
    try {
      const [desks1, desks2, rooms1, rooms2, allR, all] = await Promise.all([
        api.getDesks('area-1', date, start, end, office).catch(() => null),
        api.getDesks('area-2', date, start, end, office).catch(() => null),
        api.getRooms('area-1', date, start, end, office).catch(() => null),
        api.getRooms('area-2', date, start, end, office).catch(() => null),
        api.getRooms('all', date, start, end, office).catch(() => null),
        api.getAllBookings(office).catch(() => null)
      ]);
      if (desks1) setArea1Desks(desks1);
      if (desks2) setArea2Desks(desks2);
      if (rooms1) setArea1Rooms(rooms1);
      if (rooms2) setArea2Rooms(rooms2);
      if (allR) setAllRooms(allR);
      if (all) setAllBookings(all);
    } catch {
      // fallback
    }
  };

  // Re-sync allocations whenever selectedDate, startTime, endTime, activeArea, or selectedOffice change
  // Also periodically poll every 30s to de-allocate expired seats dynamically
  useEffect(() => {
    refreshDesks(selectedDate, startTime, endTime, selectedOffice);
    const interval = setInterval(() => {
      refreshDesks(selectedDate, startTime, endTime, selectedOffice);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedDate, startTime, endTime, activeArea, selectedOffice]);

  // Auto-collapse sidebar on screens < 1024px for maximum floor plan space
  useEffect(() => {
    const handleScreenResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    handleScreenResize();
    window.addEventListener('resize', handleScreenResize);
    return () => window.removeEventListener('resize', handleScreenResize);
  }, []);

  const currentDesks = activeArea === 'area-1' ? area1Desks : area2Desks;
  const currentRooms = activeArea === 'area-1' ? area1Rooms : area2Rooms;

  const totalSeats = currentDesks.length;
  const bookedSeats = currentDesks.filter((d) => d.status === 'booked').length;
  const occupancyRate = Math.round((bookedSeats / totalSeats) * 100);

  // Ensure token is synced with active currentUser so bookings never fail with token errors
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smartdesk_user_id', currentUser.id);
      localStorage.setItem('smartdesk_user_email', currentUser.email);
      localStorage.setItem('smartdesk_user_role', currentUser.role);
      api.getTokenForUser({ id: currentUser.id, email: currentUser.email, role: currentUser.role })
        .catch(() => {});
    }
  }, [currentUser]);

  // Quick Demo Login from Landing Page
  const handleQuickDemoLogin = async (role: 'admin' | 'manager' | 'employee') => {
    let user = INITIAL_USERS[0];
    if (role === 'manager') user = INITIAL_USERS[1];
    else if (role === 'employee') user = INITIAL_USERS[2];

    try {
      const res = await api.getTokenForUser({ role: user.role, email: user.email });
      if (res && res.user) user = res.user;
    } catch {}

    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'manager') {
      setSelectedTargetUser(null);
    } else {
      setSelectedTargetUser(user);
    }
    setIsAuthenticated(true);
    setShowOfficeModal(true); // Prompts user/manager/admin to select campus
    showToast(`Welcome! Logged in as ${user.name} (${user.role.toUpperCase()})`);
    refreshBookingsData(selectedOffice);
    refreshDesks(selectedDate, startTime, endTime, selectedOffice);
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
    setShowOfficeModal(true); // Prompts user/manager/admin to select campus
    showToast(`Welcome back, ${user.name}!`);
    refreshBookingsData(selectedOffice);
    refreshDesks(selectedDate, startTime, endTime, selectedOffice);
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

  // Confirm Desk Reservation (Real SQLite DB creation with role enforcement & multi-day support)
  const handleConfirmReservation = async (customParams?: {
    dates?: string[];
    duration?: string;
    startTime?: string;
    endTime?: string;
    targetUser?: UserProfile | null;
  }) => {
    if (!selectedDesk) return;

    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';
    const effectiveUser = customParams?.targetUser || (isAdminOrManager ? selectedTargetUser : currentUser);

    if (isAdminOrManager && (!effectiveUser || effectiveUser.id === currentUser.id)) {
      showToast('Admins and Managers cannot book seats for themselves. Please select an employee to allocate this seat.');
      return;
    }

    const targetDates = customParams?.dates && customParams.dates.length > 0
      ? customParams.dates
      : [selectedDate];
    const targetDuration = customParams?.duration || selectedDuration;
    const targetStart = customParams?.startTime || startTime;
    const targetEnd = customParams?.endTime || endTime;

    // Business Rule Check across all targetDates: strictly 1 seat per user per day
    const effectiveUserId = effectiveUser?.id || currentUser.id;
    const effectiveUserName = effectiveUser?.name || currentUser.name;

    for (const singleDate of targetDates) {
      const existingDayBooking = allBookings.find(
        (b) =>
          (b.userId === effectiveUserId || b.userName === effectiveUserName) &&
          b.date === singleDate &&
          b.status !== 'cancelled' &&
          b.status !== 'completed' &&
          Boolean(b.deskId)
      );

      if (existingDayBooking) {
        const seatLabel = existingDayBooking.deskCode || existingDayBooking.deskId;
        if (isAdminOrManager) {
          showToast(`Rule Violation: ${effectiveUserName} already has Seat ${seatLabel} reserved on ${singleDate}. Limit: strictly 1 seat per user per day.`);
        } else {
          showToast(`Rule Violation: You already have Seat ${seatLabel} reserved on ${singleDate}. Limit: strictly 1 seat per user per day.`);
        }
        return;
      }
    }

    try {
      const result = await api.createBooking({
        deskId: selectedDesk.id,
        areaId: activeArea,
        officeId: selectedOffice,
        duration: targetDuration,
        bookingDates: targetDates,
        startTime: targetStart,
        endTime: targetEnd,
        targetUserId: isAdminOrManager && effectiveUser ? effectiveUser.id : undefined,
        callerUserId: currentUser.id,
        callerRole: currentUser.role
      });

      const newBookingsList: Booking[] = Array.isArray((result as any).bookings) && (result as any).bookings.length > 0
        ? (result as any).bookings
        : [result as Booking];

      setBookings((prev) => [...newBookingsList, ...prev]);
      setAllBookings((prev) => [...newBookingsList, ...prev]);

      const effectiveUserForOccupant = effectiveUser || currentUser;
      const updateDesk = (desksList: Desk[]) =>
        desksList.map((d) =>
          d.id === selectedDesk.id
            ? {
                ...d,
                status: 'booked' as const,
                occupant: {
                  name: effectiveUserForOccupant.name,
                  avatar: effectiveUserForOccupant.avatar,
                  role: `${effectiveUserForOccupant.role.toUpperCase()}`,
                  bookedTime: `${targetStart} - ${targetEnd}`,
                  hoursRemaining: targetDuration.includes('Morning') ? '4h' : '8h'
                }
              }
            : d
        );

      if (activeArea === 'area-1') setArea1Desks(updateDesk);
      else setArea2Desks(updateDesk);

      setSelectedDesk(null);
      setIsSeatModalOpen(false);
      if (isAdminOrManager) setSelectedTargetUser(null);
      refreshDesks(selectedDate, startTime, endTime, selectedOffice);
      refreshBookingsData(selectedOffice);

      const campusLabel = selectedOffice === 'siddhant' ? ' (Siddhant Campus)' : ' (Global Port)';
      const daysCount = targetDates.length;
      if (daysCount === 1) {
        showToast(
          isAdminOrManager
            ? `🎉 Seat ${selectedDesk.code || selectedDesk.id}${campusLabel} allocated to ${effectiveUserForOccupant.name} for ${targetDates[0]}! Calendar invite sent to ${effectiveUserForOccupant.email}.`
            : `🎉 Reservation confirmed! Seat ${selectedDesk.code || selectedDesk.id}${campusLabel} booked for ${targetDates[0]}. Calendar invite sent to ${effectiveUserForOccupant.email}.`
        );
      } else {
        showToast(
          isAdminOrManager
            ? `🎉 Seat ${selectedDesk.code || selectedDesk.id}${campusLabel} allocated to ${effectiveUserForOccupant.name} across ${daysCount} days (${targetDates[0]} to ${targetDates[daysCount - 1]})!`
            : `🎉 Multi-day reservation confirmed! Seat ${selectedDesk.code || selectedDesk.id}${campusLabel} booked across ${daysCount} days (${targetDates[0]} to ${targetDates[daysCount - 1]})!`
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to complete reservation');
      throw err;
    }
  };

  // Cancel Booking (Immediately de-allocates the seat in SQLite)
  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId) || allBookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      await api.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setAllBookings((prev) => prev.filter((b) => b.id !== bookingId));

      refreshDesks(selectedDate, startTime, endTime);
      refreshBookingsData();
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
      setAllBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );

      refreshDesks(selectedDate, startTime, endTime);
      refreshBookingsData();
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
    setHighlightedDeskId(deskId);
    showToast(`Panning to Seat ${deskId}...`);
  };

  // Meeting Room CRUD Handlers (Managers and Admins)
  const handleCreateRoom = async (roomData: {
    name: string;
    code: string;
    areaId: 'area-1' | 'area-2';
    capacity: number;
    amenities: string[];
    officeId?: OfficeLocation;
  }) => {
    try {
      await api.createRoom({
        ...roomData,
        officeId: roomData.officeId || selectedOffice
      });
      await refreshDesks(selectedDate, startTime, endTime, selectedOffice);
      showToast(`Meeting room "${roomData.name}" created successfully in ${selectedOffice === 'siddhant' ? 'Siddhant Campus' : 'Global Port'}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create room');
      throw err;
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await api.deleteRoom(roomId);
      await refreshDesks(selectedDate, startTime, endTime, selectedOffice);
      showToast('Meeting room deleted and associated bookings released.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete room');
      throw err;
    }
  };

  // Room booking confirmation (Users, Managers, and Admins; includes Microsoft Teams & multi-attendee invitations)
  const handleConfirmRoomBooking = async (
    room: Room,
    duration: string,
    bookingDate: string,
    roomStart: string,
    roomEnd: string,
    targetUserId?: string,
    attendeeIds?: string[],
    includeTeams?: boolean
  ) => {
    try {
      await api.createBooking({
        roomId: room.id,
        areaId: room.areaId || activeArea,
        officeId: room.officeId || selectedOffice,
        duration,
        bookingDate,
        startTime: roomStart,
        endTime: roomEnd,
        targetUserId,
        callerUserId: currentUser.id,
        callerRole: currentUser.role,
        attendeeIds,
        includeTeams: includeTeams !== false
      });

      await refreshDesks(selectedDate, startTime, endTime, selectedOffice);
      await refreshBookingsData(selectedOffice);
      setSelectedRoomForBooking(null);

      const targetUser = targetUserId ? users.find((u) => u.id === targetUserId) : currentUser;
      const count = attendeeIds?.length || 0;
      const teamsNote = includeTeams !== false ? ' Microsoft Teams meeting created & ' : ' ';
      const attendeeNote = count > 0 ? `syncing to ${count} attendees' schedules.` : `confirmed for ${targetUser?.name || 'you'}.`;

      showToast(`🎉 Meeting Room ${room.name} booked!${teamsNote}${attendeeNote}`);
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
    <div className="flex h-screen w-full overflow-hidden bg-surface text-on-surface">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface-container-high/95 backdrop-blur-2xl border border-primary/50 text-on-surface px-5 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.7)] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar (Supports Collapsible Rail Mode & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={currentUser.role}
        bookingsCount={bookings.length}
        isCollapsed={isSidebarCollapsed}
        selectedOffice={selectedOffice}
        onOpenOfficeModal={() => setShowOfficeModal(true)}
        onLogout={handleLogout}
        onCollapse={() => setIsSidebarCollapsed(true)}
      />

      {/* Main View Area (Responsive left margin for mobile / desktop) */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-200 ${
          isSidebarCollapsed ? 'pl-0 md:pl-16' : 'pl-0 md:pl-64'
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
          selectedOffice={selectedOffice}
          onOfficeChange={handleSelectOffice}
          onOpenOfficeModal={() => setShowOfficeModal(true)}
          selectedDate={selectedDate}
          onDateChange={(d) => {
            setSelectedDate(d);
            refreshDesks(d, startTime, endTime, selectedOffice);
          }}
          selectedTimeSlot={selectedTimeSlot}
          onTimeSlotChange={(slotId, sTime, eTime) => {
            setSelectedTimeSlot(slotId);
            const s = sTime || startTime;
            const e = eTime || endTime;
            setStartTime(s);
            setEndTime(e);
            refreshDesks(selectedDate, s, e, selectedOffice);
          }}
          startTime={startTime}
          endTime={endTime}
          onCustomTimeChange={(s, e) => {
            setSelectedTimeSlot('custom');
            setStartTime(s);
            setEndTime(e);
            refreshDesks(selectedDate, s, e, selectedOffice);
          }}
          currentUser={currentUser}
          allUsers={users}
          onSwitchUser={async (user) => {
            try {
              const res = await api.getTokenForUser({ id: user.id, email: user.email, role: user.role });
              if (res && res.user) user = res.user;
            } catch {}
            setCurrentUser(user);
            if (user.role === 'admin' || user.role === 'manager') {
              setSelectedTargetUser(null);
            } else {
              setSelectedTargetUser(user);
            }
            setShowOfficeModal(true);
            showToast(`Switched active profile to ${user.name} (${user.role.toUpperCase()})`);
          }}
          onOpenRegister={() => setShowRegisterModal(true)}
          occupancyRate={occupancyRate}
          totalSeats={totalSeats}
          bookedSeats={bookedSeats}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onOpenOutlookEmails={() => setShowOutlookEmailsModal(true)}
          emailCount={outlookEmailsCount}
        />

        {/* Central Content Viewport: Page Router for Sidebar Navigation */}
        <main className="flex-1 pt-14 relative overflow-hidden bg-[#090D16] h-full flex flex-col">
          {/* VIEW 1: FLOOR PLAN MAP */}
          {activeTab === 'floor-plan' && (
            <div className="w-full h-full relative overflow-hidden flex-1">
              {/* Allocation mode banner for Admin & Manager - Docked safely at top-right with dismiss button */}
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && selectedTargetUser && (
                <div
                  style={{ backgroundColor: '#131826' }}
                  className="absolute top-3.5 right-6 z-20 hidden md:flex items-center gap-2.5 bg-[#131826] border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.85)] text-xs pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse flex-shrink-0" />
                  <span className="text-slate-400 text-[11px]">Allocating for:</span>
                  <Avatar
                    src={selectedTargetUser.avatar}
                    name={selectedTargetUser.name}
                    size="xs"
                    rounded="rounded-full"
                  />
                  <span className="font-semibold text-slate-100">{selectedTargetUser.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">({selectedTargetUser.role.toUpperCase()})</span>
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
                selectedOffice={selectedOffice}
                desks={currentDesks}
                rooms={currentRooms}
                selectedDesk={selectedDesk}
                highlightedDeskId={highlightedDeskId}
                onSelectDesk={handleSelectDesk}
                onSelectRoom={setSelectedRoomForBooking}
              />

              {/* Floating Bottom Booking Drawer (Appears ONLY when seat is selected) */}
              <BookingBar
                selectedDesk={selectedDesk}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                selectedDate={selectedDate}
                onDateChange={(newDate) => {
                  setSelectedDate(newDate);
                  refreshDesks(newDate, startTime, endTime, selectedOffice);
                }}
                startTime={startTime}
                endTime={endTime}
                onTimeChange={(newStart, newEnd) => {
                  setStartTime(newStart);
                  setEndTime(newEnd);
                  setSelectedDuration(`${newStart} - ${newEnd}`);
                  refreshDesks(selectedDate, newStart, newEnd, selectedOffice);
                }}
                onOpenScheduleModal={() => setIsSeatModalOpen(true)}
                onConfirm={() => handleConfirmReservation()}
                onClearSelection={() => setSelectedDesk(null)}
                currentUser={currentUser}
                users={users}
                selectedTargetUser={selectedTargetUser}
                onSelectTargetUser={setSelectedTargetUser}
                bookings={allBookings}
              />
            </div>
          )}

          {/* VIEW 2: TIME GRID SCHEDULER PAGE */}
          {activeTab === 'time-grid' && (
            <TimeGridModal
              isOpen={true}
              isPageView={true}
              onClose={() => setActiveTab('floor-plan')}
              activeArea={activeArea}
              selectedOffice={selectedOffice}
              onAreaChange={(area) => {
                setActiveArea(area);
                setSelectedDesk(null);
                setHighlightedDeskId(null);
              }}
              desks={currentDesks}
              selectedDate={selectedDate}
              onSelectDesk={(desk) => {
                handleSelectDesk(desk);
                setActiveTab('floor-plan');
              }}
            />
          )}

          {/* VIEW 3: MY BOOKINGS PAGE */}
          {activeTab === 'my-bookings' && (
            <MyBookingsModal
              isOpen={true}
              isPageView={true}
              onClose={() => setActiveTab('floor-plan')}
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
              onCheckIn={handleCheckIn}
              onOpenEdit={(b) => {
                setEditingBooking(b);
                setShowEditBookingModal(true);
              }}
              onLocateSeat={handleLocateSeat}
            />
          )}

          {/* VIEW 4: MEETING ROOMS BOOKING & MANAGEMENT PAGE */}
          {activeTab === 'meeting-rooms' && (
            <MeetingRoomsModal
              isOpen={true}
              isPageView={true}
              onClose={() => setActiveTab('floor-plan')}
              rooms={allRooms.length > 0 ? allRooms : [...area1Rooms, ...area2Rooms]}
              userRole={currentUser.role}
              selectedOffice={selectedOffice}
              onSelectRoomForBooking={(room) => setSelectedRoomForBooking(room)}
              onCreateRoom={handleCreateRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          )}

          {/* VIEW 5: MANAGER WORKPLACE ANALYTICS PAGE */}
          {activeTab === 'analytics' && (
            <ManagerAnalyticsModal
              isOpen={true}
              isPageView={true}
              onClose={() => setActiveTab('floor-plan')}
              area1Desks={area1Desks}
              area2Desks={area2Desks}
              onLocateSeat={handleLocateSeat}
              onReleaseSeat={handleReleaseGhostSeat}
              users={users}
              bookings={allBookings}
              selectedDate={selectedDate}
              selectedOffice={selectedOffice}
              rooms={allRooms.length > 0 ? allRooms : [...area1Rooms, ...area2Rooms]}
              onBookForUser={(emp) => {
                setSelectedTargetUser(emp);
                setActiveTab('floor-plan');
                showToast(`Allocating seat for ${emp.name}. Select an available green desk.`);
              }}
            />
          )}

          {/* VIEW 6: USERS DIRECTORY PAGE */}
          {activeTab === 'admin-users' && (
            <AdminUsersModal
              isOpen={true}
              isPageView={true}
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
          )}

          {/* VIEW 7: SYSTEM HEALTH PAGE */}
          {activeTab === 'admin-health' && (
            <AdminHealthModal
              isOpen={true}
              isPageView={true}
              onClose={() => setActiveTab('floor-plan')}
              health={systemHealth}
              totalSeats={totalSeats}
              occupiedSeats={bookedSeats}
            />
          )}
        </main>
      </div>

      {/* Action Dialog Modals */}

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
        userRole={currentUser.role}
        users={users}
        currentUserId={currentUser.id}
      />

      <MicrosoftSSOModal
        isOpen={showMicrosoftSSOModal}
        onClose={() => setShowMicrosoftSSOModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <OutlookEmailsModal
        isOpen={showOutlookEmailsModal}
        onClose={() => setShowOutlookEmailsModal(false)}
        currentUser={currentUser}
      />

      <SeatBookingModal
        isOpen={isSeatModalOpen && !!selectedDesk}
        onClose={() => setIsSeatModalOpen(false)}
        desk={selectedDesk}
        initialDate={selectedDate}
        initialStartTime={startTime}
        initialEndTime={endTime}
        initialDuration={selectedDuration}
        currentUser={currentUser}
        users={users}
        bookings={bookings}
        allBookings={allBookings}
        onConfirmBooking={handleConfirmReservation}
        selectedTargetUser={selectedTargetUser}
        onSelectTargetUser={setSelectedTargetUser}
      />

      {/* Office Campus Chooser Modal (Global Port vs Siddhant) */}
      <OfficeSelectionModal
        isOpen={showOfficeModal}
        currentOffice={selectedOffice}
        onSelectOffice={handleSelectOffice}
        onClose={() => setShowOfficeModal(false)}
        canDismiss={true}
      />
    </div>
  );
};
