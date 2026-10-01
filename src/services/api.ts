import { Desk, Room, Booking, UserProfile, Role } from '../types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('smartdesk_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const userId = localStorage.getItem('smartdesk_user_id');
  const userEmail = localStorage.getItem('smartdesk_user_email');
  const userRole = localStorage.getItem('smartdesk_user_role');
  if (userId) headers['X-User-Id'] = userId;
  if (userEmail) headers['X-User-Email'] = userEmail;
  if (userRole) headers['X-User-Role'] = userRole;
  return headers;
}

export const api = {
  // Switch or fetch token for active profile
  async getTokenForUser(user: { id?: string; email?: string; role?: string }): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/token-for-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email, role: user.role })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('smartdesk_token', data.token);
      if (data.user) {
        localStorage.setItem('smartdesk_user_id', data.user.id);
        localStorage.setItem('smartdesk_user_email', data.user.email);
        localStorage.setItem('smartdesk_user_role', data.user.role);
      }
    }
    return data;
  },

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('smartdesk_token', data.token);
    if (data.user) {
      localStorage.setItem('smartdesk_user_id', data.user.id);
      localStorage.setItem('smartdesk_user_email', data.user.email);
      localStorage.setItem('smartdesk_user_role', data.user.role);
    }
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    department: string;
    role?: Role;
  }): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('smartdesk_token', data.token);
    return data;
  },

  async getMe(): Promise<UserProfile | null> {
    const token = localStorage.getItem('smartdesk_token');
    if (!token) return null;
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getAuthHeader()
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('smartdesk_token');
  },

  // Microsoft Organization SSO
  async getMicrosoftConfig(): Promise<{ configured: boolean; clientId?: string; tenantId?: string; redirectUri?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/microsoft/config`);
      return res.json();
    } catch {
      return { configured: false };
    }
  },

  async getMicrosoftLoginUrl(): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/microsoft/login-url`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate Microsoft login URL');
    return data.url;
  },

  async loginWithMicrosoftCode(code: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/microsoft/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Microsoft login failed');
    localStorage.setItem('smartdesk_token', data.token);
    return data;
  },

  async loginWithMicrosoftDemo(email: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${BASE_URL}/auth/microsoft/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Microsoft login failed');
    localStorage.setItem('smartdesk_token', data.token);
    return data;
  },

  // Desks & Rooms from SQLite with date & time slot filtering
  async getDesks(areaId: 'area-1' | 'area-2', date?: string, startTime?: string, endTime?: string): Promise<Desk[]> {
    const params = new URLSearchParams({ areaId });
    if (date) params.append('date', date);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    const res = await fetch(`${BASE_URL}/desks?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch desks from database');
    return res.json();
  },

  async getRooms(areaId: 'area-1' | 'area-2', date?: string, startTime?: string, endTime?: string): Promise<Room[]> {
    const params = new URLSearchParams({ areaId });
    if (date) params.append('date', date);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    const res = await fetch(`${BASE_URL}/rooms?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch rooms from database');
    return res.json();
  },

  // Users Directory (for employee allocation)
  async getUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Bookings
  async createBooking(booking: {
    deskId?: string;
    roomId?: string;
    areaId: string;
    duration: string;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
    targetUserId?: string;
    callerUserId?: string;
    callerRole?: string;
  }): Promise<Booking> {
    const callerId = booking.callerUserId || localStorage.getItem('smartdesk_user_id');
    const callerRole = booking.callerRole || localStorage.getItem('smartdesk_user_role');
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        ...booking,
        callerUserId: callerId,
        callerRole: callerRole
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reserve seat');
    return data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/bookings/my`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch user bookings');
    return res.json();
  },

  async getAllBookings(): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/bookings/all`);
    if (!res.ok) throw new Error('Failed to fetch all bookings');
    return res.json();
  },

  async updateBooking(id: string, data: { duration?: string; deskId?: string; date?: string; startTime?: string; endTime?: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update booking');
    }
  },

  async cancelBooking(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to cancel reservation');
  },

  async checkInBooking(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/bookings/${id}/checkin`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to check in');
  },

  async releaseGhostSeat(deskId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/desks/${deskId}/release`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to release ghost seat');
  },

  // Admin Management
  async getAdminUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch admin users');
    return res.json();
  },

  async updateUserRole(userId: string, role: Role): Promise<void> {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error('Failed to update role');
  },

  async toggleUserActive(userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to toggle status');
  },

  async deleteUser(userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete user');
  }
};
