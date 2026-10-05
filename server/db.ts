import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'smartdesk.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for performance and data integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'user')),
      department TEXT NOT NULL,
      avatar TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS desks (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      area_id TEXT NOT NULL,
      zone_name TEXT NOT NULL,
      pod_name TEXT NOT NULL,
      row_num INTEGER NOT NULL,
      col_num INTEGER NOT NULL,
      orientation TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      amenities TEXT NOT NULL,
      price_per_hour REAL DEFAULT 15.0
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      area_id TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT DEFAULT 'available',
      amenities TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      desk_id TEXT,
      room_id TEXT,
      area_id TEXT NOT NULL,
      desk_code TEXT NOT NULL,
      pod_name TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      duration TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'upcoming', 'completed', 'cancelled')),
      check_in_status INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      user_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_notifications (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('seat_booking', 'room_booking', 'booking_cancellation')),
      status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'failed', 'queued')),
      provider TEXT DEFAULT 'outlook',
      html_content TEXT NOT NULL,
      ics_content TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS booking_attendees (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      role TEXT DEFAULT 'attendee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migrate columns in existing database if missing
  try { db.exec('ALTER TABLE bookings ADD COLUMN teams_meeting_url TEXT;'); } catch {}
  try { db.exec('ALTER TABLE bookings ADD COLUMN attendees TEXT;'); } catch {}

  seedInitialData();
}

function seedInitialData() {
  // Check if users exist
  const countUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (countUsers.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = (pw: string) => bcrypt.hashSync(pw, salt);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, department, avatar, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insertUser.run(
      'usr-admin',
      'admin@smartdesk.com',
      hash('admin123'),
      'Alex Mercer',
      'admin',
      'DevOps & Infrastructure',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
    );

    insertUser.run(
      'usr-manager',
      'manager@smartdesk.com',
      hash('manager123'),
      'Sarah Jenkins',
      'manager',
      'Frontend Engineering',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80'
    );

    insertUser.run(
      'usr-employee',
      'employee@smartdesk.com',
      hash('user123'),
      'David Chen',
      'user',
      'Product Design',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
    );
  }

  // Check if desks exist
  const countDesks = db.prepare('SELECT COUNT(*) as count FROM desks').get() as { count: number };
  if (countDesks.count === 0) {
    const insertDesk = db.prepare(`
      INSERT INTO desks (id, code, area_id, zone_name, pod_name, row_num, col_num, orientation, status, amenities, price_per_hour)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)
    `);

    // ========================================================
    // 1. WORK AREA 1: 130 DESKS (Media (6).jpg)
    // ========================================================
    // Left Wall: 14 Desks
    for (let i = 1; i <= 3; i++) {
      insertDesk.run(
        `WA1-LW-${String(i).padStart(2, '0')}`,
        `W${i}`,
        'area-1',
        'Zone A // West Perimeter Bank',
        'West Wall (North)',
        i,
        1,
        'facing-right',
        JSON.stringify(['Window View', 'Dual 4K Monitor', 'Power Outlet']),
        15.0
      );
    }
    for (let i = 4; i <= 9; i++) {
      insertDesk.run(
        `WA1-LW-${String(i).padStart(2, '0')}`,
        `W${i}`,
        'area-1',
        'Zone A // West Perimeter Bank',
        'West Wall (Mid Section)',
        i,
        1,
        'facing-right',
        JSON.stringify(['Window View', 'Single Ultrawide', 'USB-C Dock']),
        15.0
      );
    }
    for (let i = 10; i <= 14; i++) {
      insertDesk.run(
        `WA1-LW-${String(i).padStart(2, '0')}`,
        `W${i}`,
        'area-1',
        'Zone A // West Perimeter Bank',
        'West Wall (South)',
        i,
        1,
        'facing-right',
        JSON.stringify(['Window View', 'Ergonomic Chair', 'Power Outlet']),
        15.0
      );
    }

    // North Pod 1 (10 Desks, 5 Front & Back Pairs)
    for (let row = 1; row <= 5; row++) {
      const leftNum = (row - 1) * 2 + 1;
      insertDesk.run(
        `WA1-NP1-${String(leftNum).padStart(2, '0')}`,
        `N${leftNum}`,
        'area-1',
        'Zone B // North Collaboration Pods',
        'North Pod 1 (West Side)',
        row,
        1,
        'facing-right',
        JSON.stringify(['Dual 4K Monitor', 'Standing Desk', 'Type-C 100W Hub']),
        18.0
      );
      const rightNum = (row - 1) * 2 + 2;
      insertDesk.run(
        `WA1-NP1-${String(rightNum).padStart(2, '0')}`,
        `N${rightNum}`,
        'area-1',
        'Zone B // North Collaboration Pods',
        'North Pod 1 (East Side)',
        row,
        2,
        'facing-left',
        JSON.stringify(['Dual 4K Monitor', 'Standing Desk', 'Type-C 100W Hub']),
        18.0
      );
    }

    // North Pod 2 (10 Desks, 5 Front & Back Pairs)
    for (let row = 1; row <= 5; row++) {
      const leftNum = 10 + (row - 1) * 2 + 1;
      insertDesk.run(
        `WA1-NP2-${String(leftNum - 10).padStart(2, '0')}`,
        `N${leftNum}`,
        'area-1',
        'Zone B // North Collaboration Pods',
        'North Pod 2 (West Side)',
        row,
        1,
        'facing-right',
        JSON.stringify(['Dual 4K Monitor', 'Ergonomic Seating']),
        18.0
      );
      const rightNum = 10 + (row - 1) * 2 + 2;
      insertDesk.run(
        `WA1-NP2-${String(rightNum - 10).padStart(2, '0')}`,
        `N${rightNum}`,
        'area-1',
        'Zone B // North Collaboration Pods',
        'North Pod 2 (East Side)',
        row,
        2,
        'facing-left',
        JSON.stringify(['Dual 4K Monitor', 'Ergonomic Seating']),
        18.0
      );
    }

    // South Pods 1, 2, 3 (3 x 18 = 54 Desks)
    for (let pod = 1; pod <= 3; pod++) {
      const podName = pod === 1 ? 'Alpha' : pod === 2 ? 'Beta' : 'Gamma';
      for (let row = 1; row <= 9; row++) {
        const leftNum = (row - 1) * 2 + 1;
        insertDesk.run(
          `WA1-SP${pod}-${String(leftNum).padStart(2, '0')}`,
          `S${pod}-${leftNum}`,
          'area-1',
          'Zone C // Central Modular Floor',
          `South Pod ${podName} (West Side)`,
          row,
          1,
          'facing-right',
          JSON.stringify(['Dual Monitor', 'Power Outlet', 'Silent Zone']),
          16.0
        );
        const rightNum = (row - 1) * 2 + 2;
        insertDesk.run(
          `WA1-SP${pod}-${String(rightNum).padStart(2, '0')}`,
          `S${pod}-${rightNum}`,
          'area-1',
          'Zone C // Central Modular Floor',
          `South Pod ${podName} (East Side)`,
          row,
          2,
          'facing-left',
          JSON.stringify(['Dual Monitor', 'Power Outlet', 'Silent Zone']),
          16.0
        );
      }
    }

    // Center Pod with Pillars (14 Desks)
    for (let row = 1; row <= 2; row++) {
      const leftNum = (row - 1) * 2 + 1;
      insertDesk.run(
        `WA1-CP-0${leftNum}`,
        `CP-${leftNum}`,
        'area-1',
        'Zone C // Central Modular Floor',
        'Pillar Pod (North Section)',
        row,
        1,
        'facing-right',
        JSON.stringify(['Dual 4K Monitor', 'Ergonomic Chair']),
        17.0
      );
      const rightNum = (row - 1) * 2 + 2;
      insertDesk.run(
        `WA1-CP-0${rightNum}`,
        `CP-${rightNum}`,
        'area-1',
        'Zone C // Central Modular Floor',
        'Pillar Pod (North Section)',
        row,
        2,
        'facing-left',
        JSON.stringify(['Dual 4K Monitor', 'Ergonomic Chair']),
        17.0
      );
    }
    for (let row = 1; row <= 5; row++) {
      const leftNum = 4 + (row - 1) * 2 + 1;
      insertDesk.run(
        `WA1-CP-${String(leftNum).padStart(2, '0')}`,
        `CP-${leftNum}`,
        'area-1',
        'Zone C // Central Modular Floor',
        'Pillar Pod (South Section)',
        row + 2,
        1,
        'facing-right',
        JSON.stringify(['Dual 4K Monitor', 'Ergonomic Chair']),
        17.0
      );
      const rightNum = 4 + (row - 1) * 2 + 2;
      insertDesk.run(
        `WA1-CP-${String(rightNum).padStart(2, '0')}`,
        `CP-${rightNum}`,
        'area-1',
        'Zone C // Central Modular Floor',
        'Pillar Pod (South Section)',
        row + 2,
        2,
        'facing-left',
        JSON.stringify(['Dual 4K Monitor', 'Ergonomic Chair']),
        17.0
      );
    }

    // East Pods 1 & 2 (2 x 14 = 28 Desks)
    for (let pod = 1; pod <= 2; pod++) {
      for (let row = 1; row <= 7; row++) {
        const leftNum = (row - 1) * 2 + 1;
        insertDesk.run(
          `WA1-EP${pod}-${String(leftNum).padStart(2, '0')}`,
          `E${pod}-${leftNum}`,
          'area-1',
          'Zone D // East Innovation Wing',
          `East Pod ${pod} (West Side)`,
          row,
          1,
          'facing-right',
          JSON.stringify(['Ultra-wide Display', 'Standing Desk']),
          16.0
        );
        const rightNum = (row - 1) * 2 + 2;
        insertDesk.run(
          `WA1-EP${pod}-${String(rightNum).padStart(2, '0')}`,
          `E${pod}-${rightNum}`,
          'area-1',
          'Zone D // East Innovation Wing',
          `East Pod ${pod} (East Side)`,
          row,
          2,
          'facing-left',
          JSON.stringify(['Ultra-wide Display', 'Standing Desk']),
          16.0
        );
      }
    }

    // ========================================================
    // 2. WORK AREA 2: 80 DESKS (Media (5).jpg)
    // ========================================================
    // Left Wall: 5 Desks
    for (let i = 1; i <= 5; i++) {
      insertDesk.run(
        `WA2-LW-${String(i).padStart(2, '0')}`,
        `L${i}`,
        'area-2',
        'West Perimeter Wall',
        'Left Perimeter Wall',
        i,
        1,
        'facing-right',
        JSON.stringify(['Single Ultrawide', 'Standard Desk', 'Window View']),
        14.0
      );
    }

    // 7 Central Pods (7 x 10 = 70 Desks)
    for (let pod = 1; pod <= 7; pod++) {
      for (let row = 1; row <= 5; row++) {
        const leftNum = (row - 1) * 2 + 1;
        insertDesk.run(
          `WA2-P${pod}-${String(leftNum).padStart(2, '0')}`,
          `P${pod}-${leftNum}`,
          'area-2',
          `Pod Bay ${pod}`,
          `Pod ${pod} (West Side)`,
          row,
          1,
          'facing-right',
          JSON.stringify(['Dual 4K Monitor', 'Standing Desk', 'Type-C Hub']),
          16.0
        );
        const rightNum = (row - 1) * 2 + 2;
        insertDesk.run(
          `WA2-P${pod}-${String(rightNum).padStart(2, '0')}`,
          `P${pod}-${rightNum}`,
          'area-2',
          `Pod Bay ${pod}`,
          `Pod ${pod} (East Side)`,
          row,
          2,
          'facing-left',
          JSON.stringify(['Dual 4K Monitor', 'Standing Desk', 'Type-C Hub']),
          16.0
        );
      }
    }

    // Right Wall: 5 Desks
    for (let i = 1; i <= 5; i++) {
      insertDesk.run(
        `WA2-RW-${String(i).padStart(2, '0')}`,
        `R${i}`,
        'area-2',
        'East Perimeter Wall',
        'Right Perimeter Wall',
        i,
        1,
        'facing-left',
        JSON.stringify(['Single Ultrawide', 'Standard Desk', 'Window View']),
        14.0
      );
    }
  }

  // Seed Rooms
  const countRooms = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
  if (countRooms.count === 0) {
    const insertRoom = db.prepare(`
      INSERT INTO rooms (id, code, name, area_id, capacity, status, amenities)
      VALUES (?, ?, ?, ?, ?, 'available', ?)
    `);

    insertRoom.run('WA1-CONF-01', 'CONF-1', 'Executive Boardroom', 'area-1', 14, JSON.stringify(['4K Video Conferencing', '85" Digital Whiteboard', 'Polycom Mic Array']));
    insertRoom.run('WA1-EXEC-01', 'EXEC-1', 'Executive Office Suite', 'area-1', 4, JSON.stringify(['Private Office', 'Herman Miller Seating', 'Direct Sunlight']));

    insertRoom.run('WA2-RM-06', 'ROOM-6', 'Room 6 (Team Focus)', 'area-2', 4, JSON.stringify(['Acoustic Insulation', '4K Display', 'Conference Phone']));
    insertRoom.run('WA2-RM-05', 'ROOM-5', 'Room 5 (1-on-1 Cabin)', 'area-2', 2, JSON.stringify(['Glass Privacy Frosting', 'Ergonomic Chairs']));
    insertRoom.run('WA2-RM-04', 'ROOM-4', 'Room 4 (Design Sprint)', 'area-2', 6, JSON.stringify(['Digital Whiteboard', 'Standing Table']));
    insertRoom.run('WA2-RM-03', 'ROOM-3', 'Room 3 (Interview Cabin)', 'area-2', 3, JSON.stringify(['Webcam Bar', 'Soundproof Door']));
    insertRoom.run('WA2-RM-02', 'ROOM-2', 'Room 2 (Strategy Room)', 'area-2', 6, JSON.stringify(['Dual 65" Displays', 'Presentation Clicker']));
    insertRoom.run('WA2-RM-01', 'ROOM-1', 'Room 1 (Director Cabin)', 'area-2', 4, JSON.stringify(['Private Balcony Access', 'Lounge Chairs']));
  }
}
