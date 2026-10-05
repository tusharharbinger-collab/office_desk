import { Desk, Room, Booking, UserProfile } from '../types';

/**
 * Escapes a cell value according to RFC-4180 CSV standard.
 */
function escapeCSV(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Downloads a CSV file in the browser with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number | boolean)[][]): void {
  const headerLine = headers.map(escapeCSV).join(',');
  const rowLines = rows.map((r) => r.map(escapeCSV).join(',')).join('\r\n');
  const csvContent = `\uFEFF${headerLine}\r\n${rowLines}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Daily Occupancy & Attendance Report
 */
export function exportAttendanceReport(desks: Desk[], date: string): void {
  const headers = [
    'Date',
    'Area',
    'Desk ID',
    'Seat Code',
    'Zone / Pod Name',
    'Employee Name',
    'Role',
    'Shift Window',
    'Remaining Duration',
    'Status'
  ];

  const rows: (string | number | boolean)[][] = desks
    .filter((d) => d.status === 'booked' && d.occupant)
    .map((d) => [
      date,
      d.areaId === 'area-1' ? 'Work Area 1 (Main Floor)' : 'Work Area 2 (Room 2)',
      d.id,
      d.code,
      `${d.zoneName} - ${d.podName}`,
      d.occupant?.name || 'Assigned User',
      d.occupant?.role || 'Staff',
      d.occupant?.bookedTime || '09:00 - 17:00',
      d.occupant?.hoursRemaining || 'Active',
      'Occupied'
    ]);

  const filename = `SmartDesk_Daily_Attendance_${date.replace(/[^0-9-]/g, '_')}.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * 2. Complete Employee Utilization Log
 */
export function exportEmployeeUtilizationLog(bookings: Booking[], users: UserProfile[]): void {
  const headers = [
    'Booking ID',
    'Employee Name',
    'Employee Email',
    'Workstation ID',
    'Seat Code',
    'Zone / Pod',
    'Area',
    'Reservation Date',
    'Shift Hours',
    'Duration',
    'Check-In Status',
    'Booking Status'
  ];

  const rows = bookings.map((b) => {
    const user = users.find((u) => u.id === b.userId || u.name === b.userName);
    return [
      b.id,
      b.userName || user?.name || 'Employee',
      user?.email || 'N/A',
      b.deskId,
      b.deskCode,
      b.podName,
      b.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2',
      b.date,
      `${b.startTime} - ${b.endTime}`,
      b.duration,
      b.checkInStatus ? 'Verified Check-In' : 'Pending Check-In',
      b.status.toUpperCase()
    ];
  });

  const now = new Date().toISOString().split('T')[0];
  downloadCSV(`SmartDesk_Employee_Utilization_Log_${now}.csv`, headers, rows);
}

/**
 * 3. Zone & Pod Efficiency Report
 */
export function exportZoneEfficiencyReport(desks: Desk[], date: string): void {
  const headers = [
    'Area',
    'Zone Name',
    'Pod Name',
    'Total Workstations',
    'Booked Count',
    'Available Count',
    'Pod Utilization Rate %',
    'Amenities'
  ];

  // Group by podName
  const podMap = new Map<string, {
    areaId: string;
    zoneName: string;
    podName: string;
    total: number;
    booked: number;
    amenities: Set<string>;
  }>();

  desks.forEach((d) => {
    const key = `${d.areaId}_${d.podName}`;
    if (!podMap.has(key)) {
      podMap.set(key, {
        areaId: d.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2',
        zoneName: d.zoneName,
        podName: d.podName,
        total: 0,
        booked: 0,
        amenities: new Set()
      });
    }
    const item = podMap.get(key)!;
    item.total++;
    if (d.status === 'booked') item.booked++;
    d.amenities.forEach((a) => item.amenities.add(a));
  });

  const rows = Array.from(podMap.values()).map((p) => [
    p.areaId,
    p.zoneName,
    p.podName,
    p.total,
    p.booked,
    p.total - p.booked,
    `${Math.round((p.booked / p.total) * 100)}%`,
    Array.from(p.amenities).join(' | ')
  ]);

  downloadCSV(`SmartDesk_Zone_Efficiency_Report_${date}.csv`, headers, rows);
}

/**
 * 4. Meeting Room & Boardroom Reservations Report
 */
export function exportMeetingRoomReport(rooms: Room[], bookings: Booking[], date: string): void {
  const headers = [
    'Room ID',
    'Room Name',
    'Area',
    'Capacity (Persons)',
    'Current Status',
    'Amenities',
    'Reserved By',
    'Scheduled Time Window',
    'Report Date'
  ];

  const rows = rooms.map((r) => {
    const roomBooking = bookings.find((b) => b.roomId === r.id && b.status === 'active');
    return [
      r.id,
      r.name,
      r.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2',
      r.capacity,
      r.status.toUpperCase(),
      r.amenities.join(' | '),
      roomBooking?.userName || (r.occupant?.name) || 'None',
      roomBooking ? `${roomBooking.startTime} - ${roomBooking.endTime}` : (r.occupant?.bookedTime || 'Open'),
      date
    ];
  });

  downloadCSV(`SmartDesk_Meeting_Rooms_Audit_${date}.csv`, headers, rows);
}
