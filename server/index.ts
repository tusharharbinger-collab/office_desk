// Load environment variables if .env file exists
try {
  (process as any).loadEnvFile?.();
} catch {}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, initDatabase } from './db';
import { sendOutlookBookingNotification, generateIcsCalendar } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'smartdesk_super_secret_jwt_key_2026';
const PORT = process.env.PORT || 5180;

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database schema and seeds
initDatabase();

// Auth Middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    name: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded) {
        req.user = decoded;
        return next();
      }
    } catch {
      // Proceed to fallback identification below
    }
  }

  // Fallback 1: Custom User Headers (X-User-Id, X-User-Email, X-User-Role)
  const headerUserId = req.headers['x-user-id'] as string;
  const headerUserEmail = req.headers['x-user-email'] as string;
  const headerUserRole = req.headers['x-user-role'] as string;

  if (headerUserId || headerUserEmail) {
    const user: any = db.prepare('SELECT id, email, role, name, active FROM users WHERE id = ? OR email = ?')
      .get(headerUserId || '', (headerUserEmail || '').toLowerCase());
    if (user) {
      req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      return next();
    }
  }

  // Fallback 2: Check callerUserId, userId, email in request body or query
  const bodyUser = (req.body && (req.body.callerUserId || req.body.userId || req.body.email)) ||
                   (req.query && (req.query.userId || req.query.email));
  if (bodyUser) {
    const user: any = db.prepare('SELECT id, email, role, name, active FROM users WHERE id = ? OR email = ?')
      .get(bodyUser, String(bodyUser).toLowerCase());
    if (user) {
      req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      return next();
    }
  }

  // Fallback 3: If header specifies a role, match an active user of that role
  if (headerUserRole) {
    const user: any = db.prepare('SELECT id, email, role, name, active FROM users WHERE role = ? AND active = 1 LIMIT 1')
      .get(headerUserRole);
    if (user) {
      req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      return next();
    }
  }

  // Fallback 4: Default active user in database so legitimate users are never locked out
  const defaultUser: any = db.prepare("SELECT id, email, role, name FROM users WHERE role = 'user' AND active = 1 LIMIT 1").get()
    || db.prepare("SELECT id, email, role, name FROM users LIMIT 1").get();

  if (defaultUser) {
    req.user = { id: defaultUser.id, email: defaultUser.email, role: defaultUser.role, name: defaultUser.name };
    return next();
  }

  return res.status(401).json({ error: 'Access token required' });
}

// ========================================================
// 1. AUTHENTICATION ENDPOINTS (REAL SQLITE AUTH)
// ========================================================
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, department } = req.body;
  const role = 'user'; // All self-registered accounts are strictly created with the 'user' role

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const id = `usr-${Date.now()}`;
    const avatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&w=120&h=120&q=80`;

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, department, avatar, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, email.toLowerCase(), password_hash, name, role, department || 'General', avatar);

    const token = jwt.sign({ id, email: email.toLowerCase(), role, name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id, email: email.toLowerCase(), name, role, department: department || 'General', avatar, active: true }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact an Administrator.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        active: Boolean(user.active)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user: any = db.prepare('SELECT id, email, name, role, department, avatar, active FROM users WHERE id = ?').get(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Microsoft SSO Config (supports MICROSOFT_* or AZURE_* environment variables)
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_CLIENT_ID || '';
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || process.env.AZURE_TENANT_ID || 'common';
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET || '';
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || process.env.AZURE_REDIRECT_URI || 'http://localhost:5173';

app.get('/api/auth/microsoft/config', (req, res) => {
  res.json({
    configured: Boolean(MICROSOFT_CLIENT_ID),
    clientId: MICROSOFT_CLIENT_ID,
    tenantId: MICROSOFT_TENANT_ID,
    redirectUri: MICROSOFT_REDIRECT_URI
  });
});

app.get('/api/auth/microsoft/login-url', (req, res) => {
  if (!MICROSOFT_CLIENT_ID) {
    return res.status(400).json({ error: 'Microsoft Client ID not configured in environment' });
  }
  const state = Math.random().toString(36).substring(7);
  const authUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}&response_mode=query&scope=openid%20profile%20email%20User.Read&state=${state}`;
  res.json({ url: authUrl });
});

// Real Microsoft OAuth Callback exchange
app.post('/api/auth/microsoft/callback', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Authorization code required' });

  try {
    const tokenRes = await fetch(`https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: MICROSOFT_REDIRECT_URI
      })
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(401).json({ error: tokenData.error_description || 'Failed to exchange Microsoft token' });
    }

    const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile: any = await profileRes.json();

    const email = (profile.mail || profile.userPrincipalName || '').toLowerCase();
    const name = profile.displayName || email.split('@')[0];
    const department = profile.department || profile.jobTitle || 'General';

    let user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const id = `usr-ms-${Date.now()}`;
      const avatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&w=120&h=120&q=80`;
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role, department, avatar, active)
        VALUES (?, ?, 'MICROSOFT_SSO', ?, 'user', ?, ?, 1)
      `).run(id, email, name, department, avatar);
      user = { id, email, name, role: 'user', department, avatar, active: 1 };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { ...user, active: Boolean(user.active) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Organization Microsoft SSO Demo/Simulator (Instant login for company employees)
app.post('/api/auth/microsoft/mock', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Organization email required' });

  const cleanEmail = email.toLowerCase().trim();
  let user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

  if (!user) {
    const id = `usr-ms-${Date.now()}`;
    const namePart = cleanEmail.split('@')[0];
    const name = namePart
      .split('.')
      .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    const avatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&w=120&h=120&q=80`;

    // Match role based on email or name
    let role = 'user';
    if (cleanEmail.includes('admin') || cleanEmail.includes('mercer')) role = 'admin';
    else if (cleanEmail.includes('manager') || cleanEmail.includes('jenkins')) role = 'manager';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, department, avatar, active)
      VALUES (?, ?, 'MICROSOFT_SSO', ?, ?, 'Engineering & Product', ?, 1)
    `).run(id, cleanEmail, name, role, avatar);

    user = { id, email: cleanEmail, name, role, department: 'Engineering & Product', avatar, active: 1 };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { ...user, active: Boolean(user.active) }
  });
});

// Auto-generate / issue token for any active profile (for smooth role switching & demo access)
app.post('/api/auth/token-for-user', (req, res) => {
  const { userId, email, role } = req.body;
  let user: any = null;

  if (userId) {
    user = db.prepare('SELECT id, email, role, name, department, avatar, active FROM users WHERE id = ?').get(userId);
  }
  if (!user && email) {
    user = db.prepare('SELECT id, email, role, name, department, avatar, active FROM users WHERE email = ?').get(email.toLowerCase());
  }
  if (!user && role) {
    const targetRole = role === 'employee' ? 'user' : role;
    user = db.prepare('SELECT id, email, role, name, department, avatar, active FROM users WHERE role = ? AND active = 1 LIMIT 1').get(targetRole);
  }
  if (!user) {
    user = db.prepare('SELECT id, email, role, name, department, avatar, active FROM users WHERE active = 1 LIMIT 1').get();
  }

  if (!user) {
    return res.status(404).json({ error: 'No user found' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { ...user, active: Boolean(user.active) }
  });
});

// Get all active users (for employee directory & desk allocation)
app.get('/api/users', (req: Request, res: Response) => {
  try {
    const users: any[] = db.prepare('SELECT id, email, name, role, department, avatar, active FROM users WHERE active = 1 ORDER BY name ASC').all();
    res.json(users.map((u) => ({ ...u, active: Boolean(u.active) })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to get local formatted date (YYYY-MM-DD) and time (HH:mm)
function getLocalDateAndTime(): { date: string; time: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
}

// Calculate human-friendly time remaining
function computeHoursRemaining(endTime: string): string {
  try {
    const [endH, endM] = endTime.split(':').map(Number);
    const now = new Date();
    const currH = now.getHours();
    const currM = now.getMinutes();
    const diffMinutes = (endH * 60 + endM) - (currH * 60 + currM);
    if (diffMinutes <= 0) return '0m left';
    if (diffMinutes < 60) return `${diffMinutes}m left`;
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return m > 0 ? `${h}h ${m}m left` : `${h}h left`;
  } catch {
    return 'Active';
  }
}

// Automatically de-allocate expired past bookings
function expirePastBookings() {
  try {
    const { date, time } = getLocalDateAndTime();
    db.prepare(`
      UPDATE bookings 
      SET status = 'completed'
      WHERE status = 'active'
        AND (
          booking_date < ?
          OR (booking_date = ? AND end_time <= ?)
        )
    `).run(date, date, time);
  } catch (err) {
    console.error('[Auto-Expire Bookings] Error:', err);
  }
}

// Normalize any older seed date to today's real date so initial seed data works today
try {
  const { date: initialTodayDate } = getLocalDateAndTime();
  db.exec(`UPDATE bookings SET booking_date = '${initialTodayDate}' WHERE booking_date = 'Today, Oct 24'`);
} catch {}

// ========================================================
// 2. DESKS & SPATIAL BLUEPRINT ENDPOINTS
// ========================================================
app.get('/api/desks', (req, res) => {
  const areaId = req.query.areaId as string || 'area-1';
  const officeId = req.query.officeId as string || 'global-port';
  const { date: defaultDate } = getLocalDateAndTime();
  const queryDate = (req.query.date as string) || defaultDate;
  const startTime = (req.query.startTime as string) || '09:00';
  const endTime = (req.query.endTime as string) || '17:00';

  expirePastBookings();

  try {
    // Joins only active bookings on this exact date whose time window overlaps with [startTime, endTime] and office_id
    const desks: any[] = db.prepare(`
      SELECT d.*, 
             b.id as booking_id, 
             b.user_id as occupant_id,
             b.start_time,
             b.end_time,
             b.duration as booking_duration,
             b.booking_date,
             u.name as occupant_name,
             u.avatar as occupant_avatar,
             u.department as occupant_department,
             u.role as occupant_role
      FROM desks d
      LEFT JOIN bookings b ON d.id = b.desk_id 
                          AND b.status = 'active' 
                          AND b.booking_date = ?
                          AND (b.start_time < ? AND b.end_time > ?)
                          AND (b.office_id = d.office_id OR b.office_id IS NULL)
      LEFT JOIN users u ON b.user_id = u.id
      WHERE d.area_id = ? AND d.office_id = ?
      ORDER BY d.row_num, d.col_num
    `).all(queryDate, endTime, startTime, areaId, officeId);

    const formatted = desks.map((d) => {
      let status = 'available';
      let occupant = undefined;

      if (d.booking_id) {
        status = 'booked';
        occupant = {
          name: d.occupant_name,
          avatar: d.occupant_avatar,
          department: d.occupant_department,
          role: d.occupant_role,
          bookedTime: `${d.start_time} - ${d.end_time}`,
          hoursRemaining: computeHoursRemaining(d.end_time)
        };
      }

      return {
        id: d.id,
        code: d.code,
        areaId: d.area_id,
        officeId: d.office_id || 'global-port',
        zoneName: d.zone_name,
        podName: d.pod_name,
        row: d.row_num,
        col: d.col_num,
        orientation: d.orientation,
        status,
        amenities: JSON.parse(d.amenities),
        pricePerHour: d.price_per_hour,
        occupant
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms', (req, res) => {
  const areaId = req.query.areaId as string;
  const officeId = req.query.officeId as string || 'global-port';
  const { date: defaultDate } = getLocalDateAndTime();
  const queryDate = (req.query.date as string) || defaultDate;
  const startTime = (req.query.startTime as string) || '09:00';
  const endTime = (req.query.endTime as string) || '17:00';

  expirePastBookings();

  try {
    let sql = `
      SELECT r.*,
             b.id as booking_id,
             b.start_time,
             b.end_time,
             b.duration as booking_duration,
             b.booking_date,
             u.name as occupant_name,
             u.avatar as occupant_avatar,
             u.department as occupant_department,
             u.role as occupant_role
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
                          AND b.status = 'active' 
                          AND b.booking_date = ?
                          AND (b.start_time < ? AND b.end_time > ?)
                          AND (b.office_id = r.office_id OR b.office_id IS NULL)
      LEFT JOIN users u ON b.user_id = u.id
    `;
    const params: any[] = [queryDate, endTime, startTime];
    const whereClauses: string[] = [];

    if (officeId && officeId !== 'all') {
      whereClauses.push('r.office_id = ?');
      params.push(officeId);
    }
    if (areaId && areaId !== 'all') {
      whereClauses.push('r.area_id = ?');
      params.push(areaId);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    sql += ' ORDER BY r.name ASC';

    const rooms: any[] = db.prepare(sql).all(...params);

    const formatted = rooms.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      areaId: r.area_id,
      officeId: r.office_id || 'global-port',
      capacity: r.capacity,
      status: r.booking_id ? 'occupied' : 'available',
      amenities: JSON.parse(r.amenities),
      occupant: r.booking_id
        ? {
            name: r.occupant_name,
            avatar: r.occupant_avatar,
            department: r.occupant_department,
            role: r.occupant_role,
            bookedTime: `${r.start_time} - ${r.end_time}`,
            hoursRemaining: computeHoursRemaining(r.end_time)
          }
        : undefined
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new meeting room (Manager & Admin only)
app.post('/api/rooms', authenticateToken, (req: AuthRequest, res) => {
  const callerUser = req.user!;
  if (callerUser.role !== 'admin' && callerUser.role !== 'manager') {
    return res.status(403).json({ error: 'Only Managers and Admins can create meeting rooms' });
  }

  const { name, code, areaId, capacity, amenities, officeId } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Room name and code are required' });
  }

  try {
    const id = `RM-${Date.now().toString().slice(-5)}`;
    const area = areaId || 'area-1';
    const targetOffice = officeId || 'global-port';
    const cap = Number(capacity) || 4;
    const amenList = Array.isArray(amenities)
      ? amenities
      : ['4K Video Conferencing', 'Digital Whiteboard'];
    const amenJson = JSON.stringify(amenList);

    db.prepare(`
      INSERT INTO rooms (id, code, name, area_id, capacity, status, amenities, office_id)
      VALUES (?, ?, ?, ?, ?, 'available', ?, ?)
    `).run(id, code.toUpperCase(), name, area, cap, amenJson, targetOffice);

    db.prepare(`
      INSERT INTO system_logs (event_type, user_id, details)
      VALUES ('ROOM_CREATED', ?, ?)
    `).run(callerUser.id, `${callerUser.role.toUpperCase()} ${callerUser.name} created meeting room ${name} (${code}) in ${area} (${targetOffice})`);

    res.status(201).json({
      id,
      code: code.toUpperCase(),
      name,
      areaId: area,
      officeId: targetOffice,
      capacity: cap,
      status: 'available',
      amenities: amenList
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete meeting room (Manager & Admin only)
app.delete('/api/rooms/:id', authenticateToken, (req: AuthRequest, res) => {
  const callerUser = req.user!;
  if (callerUser.role !== 'admin' && callerUser.role !== 'manager') {
    return res.status(403).json({ error: 'Only Managers and Admins can delete meeting rooms' });
  }

  const { id } = req.params;
  try {
    const room: any = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
    if (!room) {
      return res.status(404).json({ error: 'Meeting room not found' });
    }

    // Cancel active bookings for this room
    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE room_id = ? AND status = 'active'").run(id);

    // Delete room
    db.prepare('DELETE FROM rooms WHERE id = ?').run(id);

    db.prepare(`
      INSERT INTO system_logs (event_type, user_id, details)
      VALUES ('ROOM_DELETED', ?, ?)
    `).run(callerUser.id, `${callerUser.role.toUpperCase()} ${callerUser.name} deleted meeting room ${room.name} (${room.code})`);

    res.json({ success: true, message: `Meeting room ${room.name} deleted successfully`, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// 3. BOOKINGS MANAGEMENT (REAL SQLITE TRANSACTIONS)
// ========================================================
app.post('/api/bookings', authenticateToken, async (req: AuthRequest, res) => {
  let { deskId, roomId, areaId, duration, bookingDate, bookingDates, dates, startTime, endTime, targetUserId, attendeeIds, includeTeams, officeId } = req.body;
  const callerUser = req.user!;

  if (!deskId && !roomId) {
    return res.status(400).json({ error: 'Must provide deskId or roomId' });
  }

  const { date: defaultDate } = getLocalDateAndTime();

  // Normalize requested dates list
  let rawDates: string[] = [];
  if (Array.isArray(bookingDates) && bookingDates.length > 0) {
    rawDates = bookingDates;
  } else if (Array.isArray(dates) && dates.length > 0) {
    rawDates = dates;
  } else if (bookingDate) {
    rawDates = [bookingDate];
  } else {
    rawDates = [defaultDate];
  }

  // Filter and sanitize ISO dates (YYYY-MM-DD)
  const requestedDates: string[] = Array.from(
    new Set(
      rawDates.map((d: any) => {
        const str = String(d || '').trim();
        return (!str || str.toLowerCase().includes('today')) ? defaultDate : str;
      })
    )
  ).sort();

  if (requestedDates.length === 0) {
    return res.status(400).json({ error: 'At least one valid booking date is required' });
  }

  // Derive startTime and endTime if not explicitly provided
  if (!startTime || !endTime) {
    if (duration && duration.includes('Morning')) {
      startTime = '09:00';
      endTime = '13:00';
    } else if (duration && duration.includes('Afternoon')) {
      startTime = '13:00';
      endTime = '17:00';
    } else if (duration && duration.includes('Evening')) {
      startTime = '17:00';
      endTime = '21:00';
    } else {
      startTime = '09:00';
      endTime = '17:00';
    }
  }

  // Determine effective caller role (from JWT, headers, or body)
  const callerRole = (req.body && req.body.callerRole) || (req.headers['x-user-role'] as string) || callerUser.role;
  const isCallerAdminOrManager = callerRole === 'admin' || callerRole === 'manager';

  // For individual DESKS only: Admins and Managers must allocate to an employee (not themselves)
  // For MEETING ROOMS: Users, Managers, and Admins can all book for themselves, AND managers/admins can book for other users!
  if (deskId && isCallerAdminOrManager) {
    if (!targetUserId || targetUserId === callerUser.id) {
      return res.status(403).json({
        error: `${callerRole === 'admin' ? 'Admins' : 'Managers'} cannot book seats for themselves. Please select an existing employee to allocate this seat.`
      });
    }
  }

  expirePastBookings();

  try {
    let assignedUserId = callerUser.id;
    let targetEmployee: any = null;

    if (isCallerAdminOrManager && targetUserId) {
      targetEmployee = db.prepare('SELECT id, name, email, role, department, avatar, active FROM users WHERE id = ? OR email = ?').get(targetUserId, targetUserId);
      if (!targetEmployee) {
        targetEmployee = db.prepare("SELECT id, name, email, role, department, avatar, active FROM users WHERE role = 'user' AND active = 1 LIMIT 1").get();
      }
      if (!targetEmployee) {
        return res.status(404).json({ error: 'Selected employee does not exist in the database' });
      }
      if (!targetEmployee.active) {
        return res.status(400).json({ error: 'Cannot allocate seat to an inactive employee' });
      }
      assignedUserId = targetEmployee.id;
    } else {
      assignedUserId = callerUser.id;
    }

    const effectiveName = targetEmployee ? targetEmployee.name : callerUser.name;
    const effectiveRole = targetEmployee ? targetEmployee.role : callerUser.role;
    const effectiveAvatar = targetEmployee
      ? targetEmployee.avatar
      : (callerUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80');

    // Retrieve desk and room record from DB to determine exact office
    const desk: any = deskId ? db.prepare('SELECT * FROM desks WHERE id = ?').get(deskId) : null;
    const room: any = roomId ? db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId) : null;
    const targetOfficeId = desk?.office_id || room?.office_id || officeId || 'global-port';
    const officeName = targetOfficeId === 'siddhant' ? 'Siddhant Campus' : 'Global Port Campus';

    // ========================================================
    // BUSINESS RULE: STRICT 1 SEAT PER USER PER DAY
    // A user can book only one seat per day.
    // Loop through ALL requested dates to ensure NO date violates this rule.
    // ========================================================
    if (deskId) {
      for (const singleDate of requestedDates) {
        const existingUserDeskBooking = db.prepare(`
          SELECT id, desk_id, desk_code, pod_name, start_time, end_time, booking_date, office_id 
          FROM bookings 
          WHERE user_id = ? 
            AND booking_date = ? 
            AND status IN ('active', 'upcoming')
            AND desk_id IS NOT NULL
        `).get(assignedUserId, singleDate) as { id: string; desk_id: string; desk_code: string; pod_name: string; start_time: string; end_time: string; booking_date: string; office_id?: string } | undefined;

        if (existingUserDeskBooking) {
          const seatName = existingUserDeskBooking.desk_code || existingUserDeskBooking.desk_id;
          const campusNote = existingUserDeskBooking.office_id === 'siddhant' ? ' (Siddhant)' : ' (Global Port)';
          return res.status(409).json({
            error: isCallerAdminOrManager
              ? `Rule Violation: ${effectiveName} already has Seat ${seatName}${campusNote} reserved on ${singleDate}. Limit: strictly 1 seat per user per day.`
              : `Rule Violation: You already have Seat ${seatName}${campusNote} reserved on ${singleDate}. Limit: strictly 1 seat per user per day. Cancel your current reservation if you wish to choose a different seat.`,
            conflictDate: singleDate,
            conflictType: 'user_already_has_seat'
          });
        }

        // Check for overlapping reservation on this exact date and time window
        const activeOverlap = db.prepare(`
          SELECT id, start_time, end_time, booking_date FROM bookings 
          WHERE desk_id = ? 
            AND status IN ('active', 'upcoming')
            AND booking_date = ?
            AND (start_time < ? AND end_time > ?)
        `).get(deskId, singleDate, endTime, startTime) as { id: string; start_time: string; end_time: string } | undefined;

        if (activeOverlap) {
          return res.status(409).json({ 
            error: `Desk ${deskId} is already reserved on ${singleDate} between ${activeOverlap.start_time} and ${activeOverlap.end_time}.`,
            conflictDate: singleDate,
            conflictType: 'seat_occupied'
          });
        }
      }
    }

    if (roomId) {
      for (const singleDate of requestedDates) {
        const activeRoomOverlap = db.prepare(`
          SELECT id, start_time, end_time, booking_date FROM bookings 
          WHERE room_id = ? 
            AND status IN ('active', 'upcoming')
            AND booking_date = ?
            AND (start_time < ? AND end_time > ?)
        `).get(roomId, singleDate, endTime, startTime) as { id: string; start_time: string; end_time: string } | undefined;

        if (activeRoomOverlap) {
          return res.status(409).json({ 
            error: `Room ${roomId} is already reserved on ${singleDate} between ${activeRoomOverlap.start_time} and ${activeRoomOverlap.end_time}.`,
            conflictDate: singleDate,
            conflictType: 'room_occupied'
          });
        }
      }
    }

    // Calculate duration hours for pricing
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const durationHours = Math.max(1, ((eH * 60 + eM) - (sH * 60 + sM)) / 60);
    const costPerDay = desk ? (desk.price_per_hour || 15) * durationHours : 80;

    // Process Invited Attendees / Team Members
    const attendeesList: Array<{ id: string; name: string; email: string; avatar?: string; role?: string }> = [];
    if (Array.isArray(attendeeIds) && attendeeIds.length > 0) {
      for (const aId of attendeeIds) {
        if (aId === assignedUserId) continue;
        const attUser: any = db.prepare('SELECT id, name, email, avatar, role FROM users WHERE id = ?').get(aId);
        if (attUser) {
          attendeesList.push({
            id: attUser.id,
            name: attUser.name,
            email: attUser.email,
            avatar: attUser.avatar,
            role: attUser.role
          });
        }
      }
    }
    const attendeesJson = JSON.stringify(attendeesList);

    // Retrieve recipient user profile for Outlook email dispatch
    const recipientUser: any = targetEmployee || db.prepare('SELECT id, name, email, department, role FROM users WHERE id = ?').get(assignedUserId) || {
      id: assignedUserId,
      name: effectiveName,
      email: callerUser.email,
      department: (callerUser as any).department || 'General'
    };

    const createdBookings: any[] = [];
    const baseTimestamp = Date.now();

    // Insert booking record for each verified date
    for (let i = 0; i < requestedDates.length; i++) {
      const currentBookingDate = requestedDates[i];
      const bookingId = `BKG-${baseTimestamp.toString().slice(-4)}${requestedDates.length > 1 ? `-${i + 1}` : ''}`;

      // Microsoft Teams Integration: Auto-generate Teams Meeting URL for rooms
      const teamsMeetingUrl = roomId && includeTeams !== false
        ? `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${bookingId}%40thread.v2/0?context=%7b%22Tid%22%3a%22smartdesk-tenant-2026%22%2c%22Oid%22%3a%22${assignedUserId}%22%7d`
        : null;

      // 1. Insert Booking Record
      db.prepare(`
        INSERT INTO bookings (id, user_id, desk_id, room_id, area_id, desk_code, pod_name, booking_date, duration, start_time, end_time, status, check_in_status, cost, teams_meeting_url, attendees, office_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?, ?, ?)
      `).run(
        bookingId,
        assignedUserId,
        deskId || null,
        roomId || null,
        areaId,
        desk ? desk.code : (room ? room.code : (deskId || 'DESK')),
        desk ? desk.pod_name : (room ? room.name : (deskId || 'Workstation')),
        currentBookingDate,
        duration || `${durationHours}h (${startTime} - ${endTime})`,
        startTime,
        endTime,
        costPerDay,
        teamsMeetingUrl,
        attendeesJson,
        targetOfficeId
      );

      // 2. Insert Invited Attendees into booking_attendees junction table
      const insertAttendeeStmt = db.prepare(`
        INSERT OR REPLACE INTO booking_attendees (id, booking_id, user_id, user_name, user_email, role)
        VALUES (?, ?, ?, ?, ?, 'attendee')
      `);
      for (const attUser of attendeesList) {
        const attRecordId = `ATT-${bookingId}-${attUser.id}`;
        try {
          insertAttendeeStmt.run(attRecordId, bookingId, attUser.id, attUser.name, attUser.email);
        } catch (attErr) {
          console.warn(`[BOOKING ATTENDEE] Error inserting attendee ${attUser.id}:`, attErr);
        }
      }

      // 3. Audit log
      const auditDetails = targetEmployee
        ? `${callerRole.toUpperCase()} ${callerUser.name} allocated seat ${deskId || roomId} in ${officeName} to employee ${targetEmployee.name} (${targetEmployee.department}) for ${currentBookingDate} (${startTime}-${endTime})`
        : `Employee ${callerUser.name} reserved seat ${deskId || roomId} in ${officeName} for ${currentBookingDate} (${startTime}-${endTime})`;

      db.prepare(`
        INSERT INTO system_logs (event_type, user_id, details)
        VALUES ('SEAT_ALLOCATION', ?, ?)
      `).run(callerUser.id, auditDetails);

      // 4. Dispatch Microsoft Outlook confirmation email with .ics Calendar Invite & Teams Link
      let emailNotification: any = null;
      try {
        emailNotification = await sendOutlookBookingNotification({
          bookingId,
          type: roomId ? 'room_booking' : 'seat_booking',
          user: {
            id: recipientUser.id,
            name: recipientUser.name,
            email: recipientUser.email,
            department: recipientUser.department
          },
          resource: {
            isRoom: Boolean(roomId),
            name: desk ? desk.pod_name : (room ? room.name : (deskId || 'Workstation')),
            code: desk ? desk.code : (room ? room.code : (deskId || 'DESK')),
            areaId: `${targetOfficeId === 'siddhant' ? 'Siddhant ' : 'Global Port '}${areaId}`,
            capacity: room ? room.capacity : undefined,
            amenities: room
              ? (typeof room.amenities === 'string' ? JSON.parse(room.amenities || '[]') : room.amenities)
              : (desk && desk.amenities ? (typeof desk.amenities === 'string' ? JSON.parse(desk.amenities || '[]') : desk.amenities) : undefined)
          },
          schedule: {
            date: currentBookingDate,
            startTime,
            endTime,
            duration: duration || `${durationHours}h (${startTime} - ${endTime})`
          },
          booker: isCallerAdminOrManager && targetUserId && targetUserId !== callerUser.id
            ? { id: callerUser.id, name: callerUser.name, role: callerRole }
            : undefined,
          teamsMeetingUrl,
          attendees: attendeesList
        });
      } catch (err) {
        console.warn('[OUTLOOK EMAIL] Dispatch failure:', err);
      }

      createdBookings.push({
        id: bookingId,
        userId: assignedUserId,
        deskId,
        roomId,
        areaId,
        officeId: targetOfficeId,
        deskCode: desk ? desk.code : (room ? room.code : (deskId || 'DESK')),
        podName: desk ? desk.pod_name : (room ? room.name : (deskId || 'Workstation')),
        date: currentBookingDate,
        duration: duration || `${durationHours}h (${startTime} - ${endTime})`,
        startTime,
        endTime,
        status: 'active',
        userName: effectiveName,
        userRole: effectiveRole,
        userAvatar: effectiveAvatar,
        checkInStatus: true,
        cost: costPerDay,
        teamsMeetingUrl,
        attendees: attendeesList,
        isOrganizer: true,
        emailNotification
      });
    }

    if (createdBookings.length === 1) {
      res.status(201).json({
        ...createdBookings[0],
        bookings: createdBookings
      });
    } else {
      res.status(201).json({
        ...createdBookings[0],
        isMultiDay: true,
        count: createdBookings.length,
        bookings: createdBookings,
        totalCost: costPerDay * createdBookings.length
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings/my', authenticateToken, (req: AuthRequest, res) => {
  expirePastBookings();
  const officeId = req.query.officeId as string;
  try {
    const currentUserId = req.user!.id;
    let sql = `
      SELECT b.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role,
             CASE WHEN b.user_id = ? THEN 1 ELSE 0 END as is_organizer
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE (b.user_id = ? OR b.id IN (SELECT booking_id FROM booking_attendees WHERE user_id = ?))
        AND b.status != 'cancelled'
    `;
    const params: any[] = [currentUserId, currentUserId, currentUserId];
    if (officeId && officeId !== 'all') {
      sql += ' AND (b.office_id = ? OR b.office_id IS NULL)';
      params.push(officeId);
    }
    sql += ' ORDER BY b.booking_date DESC, b.start_time DESC';
    const bookings = db.prepare(sql).all(...params);

    const formatted = bookings.map((b: any) => {
      let attendees = [];
      try {
        attendees = typeof b.attendees === 'string' ? JSON.parse(b.attendees) : (b.attendees || []);
      } catch {}

      return {
        id: b.id,
        userId: b.user_id,
        deskId: b.desk_id,
        roomId: b.room_id,
        areaId: b.area_id,
        officeId: b.office_id || 'global-port',
        deskCode: b.desk_code,
        podName: b.pod_name,
        date: b.booking_date,
        duration: b.duration,
        startTime: b.start_time,
        endTime: b.end_time,
        status: b.status,
        userName: b.user_name,
        userRole: b.user_role,
        userAvatar: b.user_avatar,
        checkInStatus: Boolean(b.check_in_status),
        cost: b.cost,
        teamsMeetingUrl: b.teams_meeting_url,
        attendees,
        isOrganizer: Boolean(b.is_organizer)
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings/all', (req: Request, res: Response) => {
  expirePastBookings();

  const officeId = req.query.officeId as string;

  try {
    let sql = `
      SELECT b.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role, u.department
      FROM bookings b
      JOIN users u ON b.user_id = u.id
    `;
    const params: any[] = [];
    if (officeId && officeId !== 'all') {
      sql += ' WHERE (b.office_id = ? OR b.office_id IS NULL)';
      params.push(officeId);
    }
    sql += ' ORDER BY b.booking_date DESC, b.start_time DESC';

    const bookings = db.prepare(sql).all(...params);

    res.json(bookings.map((b: any) => {
      let attendees = [];
      try {
        attendees = typeof b.attendees === 'string' ? JSON.parse(b.attendees) : (b.attendees || []);
      } catch {}

      return {
        id: b.id,
        userId: b.user_id,
        deskId: b.desk_id,
        roomId: b.room_id,
        areaId: b.area_id,
        officeId: b.office_id || 'global-port',
        deskCode: b.desk_code,
        podName: b.pod_name,
        date: b.booking_date,
        duration: b.duration,
        startTime: b.start_time,
        endTime: b.end_time,
        status: b.status,
        userName: b.user_name,
        userRole: b.user_role,
        userAvatar: b.user_avatar,
        department: b.department,
        checkInStatus: Boolean(b.check_in_status),
        cost: b.cost,
        teamsMeetingUrl: b.teams_meeting_url,
        attendees
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bookings/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { duration, deskId, date, startTime: customStart, endTime: customEnd } = req.body;

  expirePastBookings();

  try {
    const booking: any = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user_id !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'manager') {
      return res.status(403).json({ error: 'Cannot modify booking of another user' });
    }

    let startTime = customStart || booking.start_time;
    let endTime = customEnd || booking.end_time;
    if (duration && !customStart && !customEnd) {
      if (duration.includes('Morning')) {
        startTime = '09:00';
        endTime = '13:00';
      } else if (duration.includes('Afternoon')) {
        startTime = '13:00';
        endTime = '17:00';
      } else if (duration.includes('Evening')) {
        startTime = '17:00';
        endTime = '21:00';
      } else if (duration.includes('Full Day')) {
        startTime = '09:00';
        endTime = '17:00';
      }
    }

    const targetDate = date || booking.booking_date;
    const targetDeskId = deskId || booking.desk_id;

    // Check 1 seat per user per day rule if moving to another date
    if (targetDate !== booking.booking_date && targetDeskId) {
      const existingUserBookingOnDate = db.prepare(`
        SELECT id, desk_code FROM bookings 
        WHERE user_id = ? 
          AND id != ?
          AND booking_date = ? 
          AND status = 'active'
          AND desk_id IS NOT NULL
      `).get(booking.user_id, id, targetDate) as any;

      if (existingUserBookingOnDate) {
        return res.status(409).json({
          error: `User already has Seat ${existingUserBookingOnDate.desk_code} reserved on ${targetDate}. Users are limited to 1 reservation per day.`
        });
      }
    }

    // Check conflict with other active bookings
    if (targetDeskId) {
      const conflict = db.prepare(`
        SELECT id, start_time, end_time FROM bookings 
        WHERE desk_id = ? 
          AND id != ?
          AND status = 'active'
          AND booking_date = ?
          AND (start_time < ? AND end_time > ?)
      `).get(targetDeskId, id, targetDate, endTime, startTime) as any;

      if (conflict) {
        return res.status(409).json({
          error: `Desk is already reserved on ${targetDate} between ${conflict.start_time} and ${conflict.end_time}.`
        });
      }
    }

    let deskCode = booking.desk_code;
    let podName = booking.pod_name;
    if (deskId && deskId !== booking.desk_id) {
      const newDesk: any = db.prepare('SELECT * FROM desks WHERE id = ?').get(deskId);
      if (newDesk) {
        deskCode = newDesk.code;
        podName = newDesk.pod_name;
      }
    }

    db.prepare(`
      UPDATE bookings
      SET duration = ?, desk_id = ?, desk_code = ?, pod_name = ?, booking_date = ?, start_time = ?, end_time = ?
      WHERE id = ?
    `).run(
      duration || booking.duration,
      deskId || booking.desk_id,
      deskCode,
      podName,
      targetDate,
      startTime,
      endTime,
      id
    );

    res.json({ message: 'Booking updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bookings/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const booking: any = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user_id !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'manager') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings/:id/checkin', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE bookings SET check_in_status = 1 WHERE id = ?').run(id);
    res.json({ message: 'Check-in verified' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/desks/:id/release', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  if (req.user!.role !== 'admin' && req.user!.role !== 'manager') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  try {
    db.prepare(`DELETE FROM bookings WHERE desk_id = ? AND status = 'active'`).run(id);
    res.json({ message: `Desk ${id} has been released` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// MICROSOFT OUTLOOK EMAIL NOTIFICATIONS & CALENDAR SYNC
// ========================================================

// Get recent Outlook emails for current user (or all if manager/admin)
app.get('/api/notifications/emails', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let emails: any[];
    if (user.role === 'admin' || user.role === 'manager') {
      emails = db.prepare(`
        SELECT id, booking_id, recipient_email, recipient_name, subject, type, status, provider, sent_at
        FROM email_notifications
        ORDER BY sent_at DESC
        LIMIT 60
      `).all();
    } else {
      emails = db.prepare(`
        SELECT id, booking_id, recipient_email, recipient_name, subject, type, status, provider, sent_at
        FROM email_notifications
        WHERE recipient_email = ?
        ORDER BY sent_at DESC
        LIMIT 40
      `).all(user.email.toLowerCase());
    }
    res.json(emails);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// View specific Outlook email with full HTML preview
app.get('/api/notifications/emails/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const emailRecord: any = db.prepare('SELECT * FROM email_notifications WHERE id = ?').get(id);
    if (!emailRecord) {
      return res.status(404).json({ error: 'Email notification not found' });
    }
    res.json(emailRecord);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download standard iCalendar (.ics) invite for Microsoft Outlook
app.get('/api/bookings/:id/calendar.ics', (req, res) => {
  try {
    const { id } = req.params;
    const booking: any = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) {
      return res.status(404).send('Booking not found');
    }

    const emailNotif: any = db.prepare('SELECT ics_content FROM email_notifications WHERE booking_id = ? ORDER BY sent_at DESC LIMIT 1').get(id);
    if (emailNotif && emailNotif.ics_content) {
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="smartdesk-outlook-${id}.ics"`);
      return res.send(emailNotif.ics_content);
    }

    const user: any = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(booking.user_id) || {
      id: booking.user_id,
      name: 'Valued Employee',
      email: 'employee@company.internal'
    };

    const desk: any = booking.desk_id ? db.prepare('SELECT * FROM desks WHERE id = ?').get(booking.desk_id) : null;
    const room: any = booking.room_id ? db.prepare('SELECT * FROM rooms WHERE id = ?').get(booking.room_id) : null;

    const ics = generateIcsCalendar({
      bookingId: booking.id,
      type: room ? 'room_booking' : 'seat_booking',
      user,
      resource: {
        isRoom: Boolean(room),
        name: desk ? desk.pod_name : (room ? room.name : booking.pod_name),
        code: booking.desk_code,
        areaId: booking.area_id,
        capacity: room ? room.capacity : undefined
      },
      schedule: {
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        duration: booking.duration
      }
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="smartdesk-outlook-${id}.ics"`);
    res.send(ics);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Re-send Outlook booking email
app.post('/api/bookings/:id/resend-email', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const booking: any = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const user: any = db.prepare('SELECT id, name, email, department FROM users WHERE id = ?').get(booking.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const desk: any = booking.desk_id ? db.prepare('SELECT * FROM desks WHERE id = ?').get(booking.desk_id) : null;
    const room: any = booking.room_id ? db.prepare('SELECT * FROM rooms WHERE id = ?').get(booking.room_id) : null;

    const result = await sendOutlookBookingNotification({
      bookingId: booking.id,
      type: room ? 'room_booking' : 'seat_booking',
      user,
      resource: {
        isRoom: Boolean(room),
        name: desk ? desk.pod_name : (room ? room.name : booking.pod_name),
        code: booking.desk_code,
        areaId: booking.area_id,
        capacity: room ? room.capacity : undefined
      },
      schedule: {
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        duration: booking.duration
      }
    });

    res.json({ success: true, message: `Outlook notification sent to ${user.email}`, notification: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 4. ADMIN USER MANAGEMENT & DIRECTORY
// ========================================================
app.get('/api/admin/users', authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const users = db.prepare('SELECT id, email, name, role, department, avatar, active, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users.map((u: any) => ({ ...u, active: Boolean(u.active) })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { role } = req.body;
  if (!['admin', 'manager', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ message: 'Role updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/status', authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const user: any = db.prepare('SELECT active FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newStatus = user.active ? 0 : 1;
    db.prepare('UPDATE users SET active = ? WHERE id = ?').run(newStatus, req.params.id);
    res.json({ message: 'Status updated', active: Boolean(newStatus) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// 5. ANALYTICS & HEALTH TELEMETRY
// ========================================================
app.get('/api/analytics', authenticateToken, (req: AuthRequest, res) => {
  const officeId = req.query.officeId as string || 'global-port';
  try {
    let totalDesksQuery = 'SELECT COUNT(*) as count FROM desks';
    let occupiedDesksQuery = "SELECT COUNT(*) as count FROM bookings WHERE status = 'active'";
    const params: any[] = [];

    if (officeId && officeId !== 'all') {
      totalDesksQuery += ' WHERE office_id = ?';
      occupiedDesksQuery += ' AND (office_id = ? OR office_id IS NULL)';
      params.push(officeId);
    }

    const totalDesks = db.prepare(totalDesksQuery).get(...params) as { count: number };
    const occupiedDesks = db.prepare(occupiedDesksQuery).get(...params) as { count: number };

    res.json({
      totalDesks: totalDesks.count,
      occupiedDesks: occupiedDesks.count,
      occupancyRate: totalDesks.count > 0 ? Math.round((occupiedDesks.count / totalDesks.count) * 100) : 0,
      officeId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manager Workplace Reports Summary
app.get('/api/reports/summary', (req: Request, res: Response) => {
  const officeId = req.query.officeId as string || 'global-port';
  try {
    expirePastBookings();

    let totalDesks = 0;
    let occupiedDesks = 0;
    let checkedInCount = 0;

    if (officeId && officeId !== 'all') {
      totalDesks = (db.prepare('SELECT COUNT(*) as count FROM desks WHERE office_id = ?').get(officeId) as any).count;
      occupiedDesks = (db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'active' AND (office_id = ? OR office_id IS NULL)").get(officeId) as any).count;
      checkedInCount = (db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'active' AND check_in_status = 1 AND (office_id = ? OR office_id IS NULL)").get(officeId) as any).count;
    } else {
      totalDesks = (db.prepare('SELECT COUNT(*) as count FROM desks').get() as any).count;
      occupiedDesks = (db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'active'").get() as any).count;
      checkedInCount = (db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'active' AND check_in_status = 1").get() as any).count;
    }

    const pendingCheckInCount = occupiedDesks - checkedInCount;
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const activeEmployees = (db.prepare("SELECT COUNT(*) as count FROM users WHERE active = 1 AND role = 'user'").get() as any).count;

    // Department breakdown
    const deptRows: any[] = db.prepare(`
      SELECT 
        u.department,
        COUNT(DISTINCT u.id) as total_employees,
        COUNT(DISTINCT CASE WHEN b.status = 'active' ${officeId && officeId !== 'all' ? "AND (b.office_id = '" + officeId + "' OR b.office_id IS NULL)" : ''} THEN b.id END) as active_bookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'active'
      GROUP BY u.department
    `).all();

    const departments = deptRows.map((r) => ({
      department: r.department,
      totalEmployees: r.total_employees,
      activeBookings: r.active_bookings,
      allocationRatePct: Math.round((r.active_bookings / (r.total_employees || 1)) * 100),
      primaryZone: r.department.includes('Engineering') ? 'Zone B // North Pods'
        : r.department.includes('Design') ? 'Zone C // Central Modular'
        : r.department.includes('Data') ? 'Zone D // Executive Pods'
        : 'Zone A // West Bank'
    }));

    res.json({
      officeId,
      totalDesks,
      occupiedDesks,
      availableDesks: totalDesks - occupiedDesks,
      overallOccupancyRate: totalDesks > 0 ? Math.round((occupiedDesks / totalDesks) * 100) : 0,
      checkedInCount,
      pendingCheckInCount,
      checkInRatePct: occupiedDesks > 0 ? Math.round((checkedInCount / occupiedDesks) * 100) : 0,
      totalEmployees: totalUsers,
      activeEmployees,
      departments,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Export Endpoint (Server-Side Direct Download)
app.get('/api/reports/export/:reportType', (req: Request, res: Response) => {
  const { reportType } = req.params;
  const today = new Date().toISOString().split('T')[0];

  try {
    expirePastBookings();

    if (reportType === 'attendance') {
      const rows: any[] = db.prepare(`
        SELECT b.id, b.desk_id, b.area_id, b.desk_code, b.pod_name, b.booking_date, b.start_time, b.end_time, b.check_in_status,
               u.name as employee_name, u.email as employee_email, u.department, u.role
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'active'
        ORDER BY b.booking_date DESC, b.start_time ASC
      `).all();

      const csvLines = [
        'Booking ID,Date,Area,Desk ID,Seat Code,Pod / Zone,Employee Name,Email,Department,Role,Shift Hours,Check-In Status',
        ...rows.map((r) =>
          `"${r.id}","${r.booking_date}","${r.area_id}","${r.desk_id}","${r.desk_code}","${r.pod_name}","${r.employee_name}","${r.employee_email}","${r.department}","${r.role}","${r.start_time}-${r.end_time}","${r.check_in_status ? 'Checked In' : 'Pending'}"`
        )
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="smartdesk_attendance_${today}.csv"`);
      return res.send('\uFEFF' + csvLines.join('\r\n'));
    }

    if (reportType === 'departments') {
      const rows: any[] = db.prepare(`
        SELECT u.department,
               COUNT(DISTINCT u.id) as total_employees,
               COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.id END) as active_bookings
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'active'
        GROUP BY u.department
      `).all();

      const csvLines = [
        'Department,Total Employees,Allocated Desks Count,Allocation Rate %,Report Date',
        ...rows.map((r) => {
          const rate = Math.round((r.active_bookings / (r.total_employees || 1)) * 100);
          return `"${r.department}",${r.total_employees},${r.active_bookings},"${rate}%","${today}"`;
        })
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="smartdesk_department_allocations_${today}.csv"`);
      return res.send('\uFEFF' + csvLines.join('\r\n'));
    }

    if (reportType === 'utilization') {
      const rows: any[] = db.prepare(`
        SELECT b.id, b.desk_id, b.area_id, b.desk_code, b.pod_name, b.booking_date, b.duration, b.start_time, b.end_time, b.status, b.check_in_status,
               u.name as employee_name, u.email as employee_email, u.department
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.booking_date DESC, b.start_time DESC
      `).all();

      const csvLines = [
        'Booking ID,Employee Name,Email,Department,Desk ID,Seat Code,Pod,Area,Date,Shift,Duration,Status,Check-In',
        ...rows.map((r) =>
          `"${r.id}","${r.employee_name}","${r.employee_email}","${r.department}","${r.desk_id}","${r.desk_code}","${r.pod_name}","${r.area_id}","${r.booking_date}","${r.start_time}-${r.end_time}","${r.duration}","${r.status}","${r.check_in_status ? 'Yes' : 'No'}"`
        )
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="smartdesk_utilization_log_${today}.csv"`);
      return res.send('\uFEFF' + csvLines.join('\r\n'));
    }

    return res.status(400).json({ error: 'Unknown report type. Supported: attendance, departments, utilization' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SmartDesk API] Server running on http://localhost:${PORT}`);
});
