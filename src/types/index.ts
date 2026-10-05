export type Role = 'user' | 'manager' | 'admin';

export type DeskStatus = 'available' | 'selected' | 'booked' | 'hold';

export type DeskOrientation = 'facing-left' | 'facing-right' | 'facing-up' | 'facing-down';

export interface Occupant {
  name: string;
  avatar: string;
  role: string;
  bookedTime: string;
  hoursRemaining: string;
}

export interface Desk {
  id: string;              // e.g. "WA1-LW-01", "WA1-BP1-01"
  code: string;            // Display code e.g. "01", "14", "N1"
  areaId: 'area-1' | 'area-2';
  zoneName: string;        // "Zone A // North Collaboration", "Zone C // Central Modular", etc.
  podName: string;         // "Left Perimeter Wall", "Pod 1 (South)", etc.
  row: number;
  col: number;
  orientation: DeskOrientation; // which way chair is facing
  status: DeskStatus;
  amenities: string[];
  occupant?: Occupant;
  pricePerHour?: number;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  areaId: 'area-1' | 'area-2';
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  amenities: string[];
  occupant?: Occupant;
}

export interface Booking {
  id: string;
  userId?: string;
  deskId: string;
  roomId?: string;
  areaId: 'area-1' | 'area-2';
  deskCode: string;
  podName: string;
  date: string;
  duration: string;        // "Full Day (8h)", "Morning (4h)", "Afternoon (4h)", "Custom (2h)"
  startTime: string;
  endTime: string;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  userName: string;
  userRole: Role;
  userAvatar: string;
  checkInStatus: boolean;
  cost: number;
  teamsMeetingUrl?: string;
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  }>;
  isOrganizer?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  active: boolean;
  department?: string;
}

export interface SystemHealthMetric {
  serverStatus: 'optimal' | 'warning' | 'degraded';
  socketConnections: number;
  latencyMs: number;
  dbPoolHealth: number; // percentage
  redisLockActive: number;
  uptime: string;
}

export interface EmailNotification {
  id: string;
  booking_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  type: 'seat_booking' | 'room_booking' | 'booking_cancellation';
  status: 'sent' | 'failed' | 'queued';
  provider: string;
  html_content?: string;
  ics_content?: string;
  sent_at: string;
}
