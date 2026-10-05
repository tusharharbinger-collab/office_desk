import { Desk, Room, UserProfile, Booking, SystemHealthMetric } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Alex Mercer',
    email: 'admin@smartdesk.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    active: true
  },
  {
    id: 'usr-manager',
    name: 'Sarah Jenkins',
    email: 'manager@smartdesk.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    active: true
  },
  {
    id: 'usr-employee',
    name: 'David Chen',
    email: 'employee@smartdesk.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    active: true
  }
];

export const INITIAL_SYSTEM_HEALTH: SystemHealthMetric = {
  serverStatus: 'optimal',
  socketConnections: 48,
  latencyMs: 14,
  dbPoolHealth: 98,
  redisLockActive: 3,
  uptime: '99.98%'
};

// Seed occupants for realistic Manager Live View
const SAMPLE_OCCUPANTS = [
  { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', role: 'Staff Engineer', bookedTime: '09:00 - 18:00', hoursRemaining: '3h' },
  { name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', role: 'Lead Designer', bookedTime: '09:00 - 17:00', hoursRemaining: '2h' },
  { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80', role: 'Senior ML Engineer', bookedTime: '10:00 - 19:00', hoursRemaining: '4h' },
  { name: 'Marcus Brody', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80', role: 'Engineering Lead', bookedTime: '08:30 - 17:30', hoursRemaining: '2.5h' },
  { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80', role: 'Automation Eng', bookedTime: '09:00 - 18:00', hoursRemaining: '3h' },
  { name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80', role: 'InfoSec Analyst', bookedTime: '10:00 - 18:00', hoursRemaining: '3.5h' },
  { name: 'Aisha Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80', role: 'Product Marketing', bookedTime: '09:30 - 17:30', hoursRemaining: '3h' },
  { name: 'Kenji Sato', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80', role: 'Fullstack Dev', bookedTime: '09:00 - 18:00', hoursRemaining: '3h' },
  { name: 'Chloe Dubois', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', role: 'Product Manager', bookedTime: '08:00 - 16:30', hoursRemaining: '1h' },
  { name: 'Liam O’Connor', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80', role: 'Account Exec', bookedTime: '11:00 - 19:00', hoursRemaining: '5h' },
  { name: 'Zoe Morales', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&h=120&q=80', role: 'Operations Mgr', bookedTime: '09:00 - 18:00', hoursRemaining: '3h' },
  { name: 'Devon Vance', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80', role: 'VP Operations', bookedTime: '08:00 - 18:00', hoursRemaining: '4h' }
];

// Helper to construct Work Area 1 Desks (Exactly 130 seats matching Media (6).jpg)
export function generateWorkArea1Desks(): Desk[] {
  const desks: Desk[] = [];
  const nextOccupant = () => undefined;

  // 1. Left Perimeter Wall: 14 Desks (Facing Right inward)
  // Top segment: 3 desks
  for (let i = 1; i <= 3; i++) {
    const isBooked = i === 2;
    desks.push({
      id: `WA1-LW-${String(i).padStart(2, '0')}`,
      code: `W${i}`,
      areaId: 'area-1',
      zoneName: 'Zone A // West Perimeter Bank',
      podName: 'West Wall (North)',
      row: i,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Window View', 'Dual 4K Monitor', 'Power Outlet'],
      occupant: isBooked ? nextOccupant() : undefined,
      pricePerHour: 15
    });
  }

  // Middle segment: 6 desks (between Pillar 1 and 2)
  for (let i = 4; i <= 9; i++) {
    const isBooked = i === 5 || i === 8;
    desks.push({
      id: `WA1-LW-${String(i).padStart(2, '0')}`,
      code: `W${i}`,
      areaId: 'area-1',
      zoneName: 'Zone A // West Perimeter Bank',
      podName: 'West Wall (Mid Section)',
      row: i,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Window View', 'Single Ultrawide', 'USB-C Dock'],
      occupant: isBooked ? nextOccupant() : undefined,
      pricePerHour: 15
    });
  }

  // Bottom segment: 5 desks (below Pillar 2)
  for (let i = 10; i <= 14; i++) {
    const isBooked = i === 11 || i === 13;
    desks.push({
      id: `WA1-LW-${String(i).padStart(2, '0')}`,
      code: `W${i}`,
      areaId: 'area-1',
      zoneName: 'Zone A // West Perimeter Bank',
      podName: 'West Wall (South)',
      row: i,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Window View', 'Ergonomic Chair', 'Power Outlet'],
      occupant: isBooked ? nextOccupant() : undefined,
      pricePerHour: 15
    });
  }

  // 2. North Pods: 2 Pods of 5 Pairs = 20 Desks (Face-to-Face Front & Back)
  // Top Pod 1 (N1 to N10)
  for (let row = 1; row <= 5; row++) {
    // Left desk (facing right toward divider)
    const leftNum = (row - 1) * 2 + 1;
    const isBookedLeft = leftNum === 3;
    desks.push({
      id: `WA1-NP1-${String(leftNum).padStart(2, '0')}`,
      code: `N${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone B // North Collaboration Pods',
      podName: 'North Pod 1 (West Side)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Standing Desk', 'Type-C 100W Hub'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 18
    });

    // Right desk (facing left toward divider - front to front!)
    const rightNum = (row - 1) * 2 + 2;
    const isBookedRight = rightNum === 4;
    desks.push({
      id: `WA1-NP1-${String(rightNum).padStart(2, '0')}`,
      code: `N${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone B // North Collaboration Pods',
      podName: 'North Pod 1 (East Side)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Standing Desk', 'Type-C 100W Hub'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 18
    });
  }

  // Top Pod 2 (N11 to N20)
  for (let row = 1; row <= 5; row++) {
    const leftNum = 10 + (row - 1) * 2 + 1;
    const isBookedLeft = leftNum === 13 || leftNum === 17;
    desks.push({
      id: `WA1-NP2-${String(leftNum - 10).padStart(2, '0')}`,
      code: `N${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone B // North Collaboration Pods',
      podName: 'North Pod 2 (West Side)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Ergonomic Seating'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 18
    });

    const rightNum = 10 + (row - 1) * 2 + 2;
    const isBookedRight = rightNum === 14;
    desks.push({
      id: `WA1-NP2-${String(rightNum - 10).padStart(2, '0')}`,
      code: `N${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone B // North Collaboration Pods',
      podName: 'North Pod 2 (East Side)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Ergonomic Seating'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 18
    });
  }

  // 3. Lower Main Floor Pods: 3 Pods of 9 Pairs = 54 Desks
  // South Pod 1 (18 desks)
  for (let row = 1; row <= 9; row++) {
    const leftNum = (row - 1) * 2 + 1;
    const isBookedLeft = row === 2 || row === 5 || row === 8;
    desks.push({
      id: `WA1-SP1-${String(leftNum).padStart(2, '0')}`,
      code: `S1-${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'South Pod Alpha (West Side)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Dual Monitor', 'Power Outlet', 'Silent Zone'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 16
    });

    const rightNum = (row - 1) * 2 + 2;
    const isBookedRight = row === 3 || row === 7;
    desks.push({
      id: `WA1-SP1-${String(rightNum).padStart(2, '0')}`,
      code: `S1-${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'South Pod Alpha (East Side)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Dual Monitor', 'Power Outlet', 'Silent Zone'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 16
    });
  }

  // South Pod 2 (18 desks)
  for (let row = 1; row <= 9; row++) {
    const leftNum = (row - 1) * 2 + 1;
    const isBookedLeft = row === 1 || row === 6;
    desks.push({
      id: `WA1-SP2-${String(leftNum).padStart(2, '0')}`,
      code: `S2-${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'South Pod Beta (West Side)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Dual Monitor', 'Power Outlet'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 16
    });

    const rightNum = (row - 1) * 2 + 2;
    const isBookedRight = row === 4 || row === 8;
    desks.push({
      id: `WA1-SP2-${String(rightNum).padStart(2, '0')}`,
      code: `S2-${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'South Pod Beta (East Side)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Dual Monitor', 'Power Outlet'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 16
    });
  }

  // South Pod 3 (18 desks)
  for (let row = 1; row <= 9; row++) {
    const leftNum = (row - 1) * 2 + 1;
    const isBookedLeft = row === 3 || row === 7;
    desks.push({
      id: `WA1-SP3-${String(leftNum).padStart(2, '0')}`,
      code: `S3-${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'South Pod Gamma (West Side)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Dual Monitor', 'Standing Desk'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 16
    });

    const rightNum = (row - 1) * 2 + 2;
    const isBookedRight = row === 2 || row === 9;
    desks.push({
      id: `WA1-SP3-${String(rightNum).padStart(2, '0')}`,
      code: `S3-${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'South Pod Gamma (East Side)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Dual Monitor', 'Standing Desk'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 16
    });
  }

  // 4. Center Pod with Pillars: 14 Desks
  // Top segment (2 pairs = 4 desks)
  for (let row = 1; row <= 2; row++) {
    const leftNum = (row - 1) * 2 + 1;
    desks.push({
      id: `WA1-CP-0${leftNum}`,
      code: `CP-${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'Pillar Pod (North Section)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Ergonomic Chair'],
      pricePerHour: 17
    });

    const rightNum = (row - 1) * 2 + 2;
    const isBooked = rightNum === 2;
    desks.push({
      id: `WA1-CP-0${rightNum}`,
      code: `CP-${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'Pillar Pod (North Section)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Ergonomic Chair'],
      occupant: isBooked ? nextOccupant() : undefined,
      pricePerHour: 17
    });
  }

  // Lower segment (5 pairs = 10 desks)
  for (let row = 1; row <= 5; row++) {
    const leftNum = 4 + (row - 1) * 2 + 1;
    const isBookedLeft = row === 2 || row === 4;
    desks.push({
      id: `WA1-CP-${String(leftNum).padStart(2, '0')}`,
      code: `CP-${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'Pillar Pod (South Section)',
      row: row + 2,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Ergonomic Chair'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 17
    });

    const rightNum = 4 + (row - 1) * 2 + 2;
    const isBookedRight = row === 3;
    desks.push({
      id: `WA1-CP-${String(rightNum).padStart(2, '0')}`,
      code: `CP-${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone C // Central Modular Floor',
      podName: 'Pillar Pod (South Section)',
      row: row + 2,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Dual 4K Monitor', 'Ergonomic Chair'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 17
    });
  }

  // 5. Right Pods: 2 Pods of 7 Pairs = 28 Desks (East Zone)
  // East Pod 1 (14 desks)
  for (let row = 1; row <= 7; row++) {
    const leftNum = (row - 1) * 2 + 1;
    const isBookedLeft = row === 2 || row === 5;
    desks.push({
      id: `WA1-EP1-${String(leftNum).padStart(2, '0')}`,
      code: `E1-${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone D // East Innovation Wing',
      podName: 'East Pod 1 (West Side)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Ultra-wide Display', 'Standing Desk'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 16
    });

    const rightNum = (row - 1) * 2 + 2;
    const isBookedRight = row === 3 || row === 6;
    desks.push({
      id: `WA1-EP1-${String(rightNum).padStart(2, '0')}`,
      code: `E1-${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone D // East Innovation Wing',
      podName: 'East Pod 1 (East Side)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Ultra-wide Display', 'Standing Desk'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 16
    });
  }

  // East Pod 2 (14 desks)
  for (let row = 1; row <= 7; row++) {
    const leftNum = (row - 1) * 2 + 1;
    const isBookedLeft = row === 1 || row === 4;
    desks.push({
      id: `WA1-EP2-${String(leftNum).padStart(2, '0')}`,
      code: `E2-${leftNum}`,
      areaId: 'area-1',
      zoneName: 'Zone D // East Innovation Wing',
      podName: 'East Pod 2 (West Side)',
      row,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Ultra-wide Display', 'Standing Desk'],
      occupant: isBookedLeft ? nextOccupant() : undefined,
      pricePerHour: 16
    });

    const rightNum = (row - 1) * 2 + 2;
    const isBookedRight = row === 5;
    desks.push({
      id: `WA1-EP2-${String(rightNum).padStart(2, '0')}`,
      code: `E2-${rightNum}`,
      areaId: 'area-1',
      zoneName: 'Zone D // East Innovation Wing',
      podName: 'East Pod 2 (East Side)',
      row,
      col: 2,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Ultra-wide Display', 'Standing Desk'],
      occupant: isBookedRight ? nextOccupant() : undefined,
      pricePerHour: 16
    });
  }

  return desks;
}

// Helper to construct Work Area 2 Desks (Exactly 80 seats matching Media (5).jpg)
export function generateWorkArea2Desks(): Desk[] {
  const desks: Desk[] = [];
  const nextOccupant = () => undefined;

  // 1. Left Wall: 5 Desks (Facing Right inward)
  for (let i = 1; i <= 5; i++) {
    const isBooked = i === 2 || i === 4;
    desks.push({
      id: `WA2-LW-${String(i).padStart(2, '0')}`,
      code: `L${i}`,
      areaId: 'area-2',
      zoneName: 'West Perimeter Wall',
      podName: 'Left Perimeter Wall',
      row: i,
      col: 1,
      orientation: 'facing-right',
      status: 'available',
      amenities: ['Single Ultrawide', 'Standard Desk', 'Window View'],
      occupant: isBooked ? nextOccupant() : undefined,
      pricePerHour: 14
    });
  }

  // 2. 7 Central Pods of 5 Pairs = 70 Desks (Facing each other across central divider)
  for (let podIdx = 1; podIdx <= 7; podIdx++) {
    for (let row = 1; row <= 5; row++) {
      // Left desk (facing right toward divider)
      const leftNum = (row - 1) * 2 + 1;
      const isBookedLeft = (podIdx === 1 && row === 2) || (podIdx === 3 && row === 4) || (podIdx === 5 && row === 1) || (podIdx === 6 && row === 3);
      desks.push({
        id: `WA2-P${podIdx}-${String(leftNum).padStart(2, '0')}`,
        code: `P${podIdx}-${leftNum}`,
        areaId: 'area-2',
        zoneName: `Pod Bay ${podIdx}`,
        podName: `Pod ${podIdx} (West Side)`,
        row,
        col: 1,
        orientation: 'facing-right',
        status: 'available',
        amenities: ['Dual 4K Monitor', 'Standing Desk', 'Type-C Hub'],
        occupant: isBookedLeft ? nextOccupant() : undefined,
        pricePerHour: 16
      });

      // Right desk (facing left toward divider)
      const rightNum = (row - 1) * 2 + 2;
      const isBookedRight = (podIdx === 2 && row === 3) || (podIdx === 4 && row === 2) || (podIdx === 7 && row === 5);
      desks.push({
        id: `WA2-P${podIdx}-${String(rightNum).padStart(2, '0')}`,
        code: `P${podIdx}-${rightNum}`,
        areaId: 'area-2',
        zoneName: `Pod Bay ${podIdx}`,
        podName: `Pod ${podIdx} (East Side)`,
        row,
        col: 2,
        orientation: 'facing-left',
        status: 'available',
        amenities: ['Dual 4K Monitor', 'Standing Desk', 'Type-C Hub'],
        occupant: isBookedRight ? nextOccupant() : undefined,
        pricePerHour: 16
      });
    }
  }

  // 3. Right Wall: 5 Desks (Facing Left inward)
  for (let i = 1; i <= 5; i++) {
    const isBooked = i === 1 || i === 5;
    desks.push({
      id: `WA2-RW-${String(i).padStart(2, '0')}`,
      code: `R${i}`,
      areaId: 'area-2',
      zoneName: 'East Perimeter Wall',
      podName: 'Right Perimeter Wall',
      row: i,
      col: 1,
      orientation: 'facing-left',
      status: 'available',
      amenities: ['Single Ultrawide', 'Standard Desk', 'Window View'],
      occupant: isBooked ? nextOccupant() : undefined,
      pricePerHour: 14
    });
  }

  return desks;
}

export const WORK_AREA_1_ROOMS: Room[] = [];

export const WORK_AREA_2_ROOMS: Room[] = [];

export const INITIAL_BOOKINGS: Booking[] = [];

