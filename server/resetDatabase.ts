import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'smartdesk.db');
const db = new DatabaseSync(dbPath);

console.log('--- Cleaning smartdesk.db ---');

// 1. Clear all bookings, attendees, email notifications, and system logs
db.exec('DELETE FROM booking_attendees;');
db.exec('DELETE FROM email_notifications;');
db.exec('DELETE FROM bookings;');
db.exec('DELETE FROM system_logs;');

console.log('✓ Cleared bookings, attendees, notifications, and logs.');

// 2. Reset all desks to available status
db.exec("UPDATE desks SET status = 'available';");
console.log('✓ Reset all 210 desks to available status.');

// 3. Reset rooms to the clean 8 standard conference and meeting rooms
db.exec('DELETE FROM rooms;');
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
console.log('✓ Seeded 8 standard rooms with available status.');

// 4. Clean users table: Keep ONLY 3 IDs (admin, manager, user)
db.exec("DELETE FROM users WHERE id NOT IN ('usr-admin', 'usr-manager', 'usr-employee');");

const salt = bcrypt.genSaltSync(10);
const hash = (pw: string) => bcrypt.hashSync(pw, salt);

// Upsert Admin
const upsertUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, name, role, department, avatar, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(id) DO UPDATE SET
    email = excluded.email,
    password_hash = excluded.password_hash,
    name = excluded.name,
    role = excluded.role,
    department = excluded.department,
    avatar = excluded.avatar,
    active = 1;
`);

upsertUser.run(
  'usr-admin',
  'admin@smartdesk.com',
  hash('admin123'),
  'Alex Mercer',
  'admin',
  'DevOps & Infrastructure',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
);

upsertUser.run(
  'usr-manager',
  'manager@smartdesk.com',
  hash('manager123'),
  'Sarah Jenkins',
  'manager',
  'Frontend Engineering',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80'
);

upsertUser.run(
  'usr-employee',
  'employee@smartdesk.com',
  hash('user123'),
  'David Chen',
  'user',
  'Product Design',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
);

console.log('✓ Successfully retained exactly 3 users:');
const users = db.prepare('SELECT id, email, name, role, department FROM users').all();
console.table(users);

// Verify table counts
const tables = ['users', 'desks', 'rooms', 'bookings', 'system_logs', 'email_notifications', 'booking_attendees'];
console.log('\nFinal DB Summary:');
for (const t of tables) {
  const cnt = db.prepare(`SELECT count(*) as c FROM ${t}`).get() as { c: number };
  console.log(`  - ${t}: ${cnt.c} rows`);
}
console.log('\n--- Database Reset Complete ---');
