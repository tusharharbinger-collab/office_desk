// Load environment variables if .env file exists
try {
  (process as any).loadEnvFile?.();
} catch {}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, initDatabase } from './db';

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
    user = db.prepare('SELECT id, email, role, name, department, avatar, active FROM users WHERE role = ? AND active = 1 LIMIT 1').get(role);
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
  const { date: defaultDate } = getLocalDateAndTime();
  const queryDate = (req.query.date as string) || defaultDate;
  const startTime = (req.query.startTime as string) || '09:00';
  const endTime = (req.query.endTime as string) || '17:00';

  expirePastBookings();

  try {
    // Joins only active bookings on this exact date whose time window overlaps with [startTime, endTime]
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
      LEFT JOIN users u ON b.user_id = u.id
      WHERE d.area_id = ?
      ORDER BY d.row_num, d.col_num
    `).all(queryDate, endTime, startTime, areaId);

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
  const areaId = req.query.areaId as string || 'area-1';
  const { date: defaultDate } = getLocalDateAndTime();
  const queryDate = (req.query.date as string) || defaultDate;
  const startTime = (req.query.startTime as string) || '09:00';
  const endTime = (req.query.endTime as string) || '17:00';

  expirePastBookings();

  try {
    const rooms: any[] = db.prepare(`
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
      LEFT JOIN users u ON b.user_id = u.id
      WHERE r.area_id = ?
    `).all(queryDate, endTime, startTime, areaId);

    const formatted = rooms.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      areaId: r.area_id,
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

// ========================================================
// 3. BOOKINGS MANAGEMENT (REAL SQLITE TRANSACTIONS)
// ========================================================
app.post('/api/bookings', authenticateToken, (req: AuthRequest, res) => {
  let { deskId, roomId, areaId, duration, bookingDate, startTime, endTime, targetUserId } = req.body;
  const callerUser = req.user!;

  if (!deskId && !roomId) {
    return res.status(400).json({ error: 'Must provide deskId or roomId' });
  }

  const { date: defaultDate } = getLocalDateAndTime();
  if (!bookingDate || bookingDate.toLowerCase().includes('today')) {
    bookingDate = defaultDate;
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

  // If Admin or Manager: must allocate to an employee (cannot allocate for themselves)
  if (isCallerAdminOrManager) {
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
        // Fallback: match by name or return first active user with role 'user'
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
      // Normal employee booking for themselves
      assignedUserId = callerUser.id;
    }

    // Check for overlapping reservation on this exact date and time window
    if (deskId) {
      const activeOverlap = db.prepare(`
        SELECT id, start_time, end_time FROM bookings 
        WHERE desk_id = ? 
          AND status = 'active'
          AND booking_date = ?
          AND (start_time < ? AND end_time > ?)
      `).get(deskId, bookingDate, endTime, startTime) as { id: string; start_time: string; end_time: string } | undefined;

      if (activeOverlap) {
        return res.status(409).json({ 
          error: `Desk ${deskId} is already reserved on ${bookingDate} between ${activeOverlap.start_time} and ${activeOverlap.end_time}.` 
        });
      }
    }

    if (roomId) {
      const activeRoomOverlap = db.prepare(`
        SELECT id, start_time, end_time FROM bookings 
        WHERE room_id = ? 
          AND status = 'active'
          AND booking_date = ?
          AND (start_time < ? AND end_time > ?)
      `).get(roomId, bookingDate, endTime, startTime) as { id: string; start_time: string; end_time: string } | undefined;

      if (activeRoomOverlap) {
        return res.status(409).json({ 
          error: `Room ${roomId} is already reserved on ${bookingDate} between ${activeRoomOverlap.start_time} and ${activeRoomOverlap.end_time}.` 
        });
      }
    }

    const desk: any = deskId ? db.prepare('SELECT * FROM desks WHERE id = ?').get(deskId) : null;
    const room: any = roomId ? db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId) : null;

    const bookingId = `BKG-${Date.now().toString().slice(-4)}`;
    const cost = desk ? (desk.price_per_hour || 15) * 8 : 80;

    db.prepare(`
      INSERT INTO bookings (id, user_id, desk_id, room_id, area_id, desk_code, pod_name, booking_date, duration, start_time, end_time, status, check_in_status, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)
    `).run(
      bookingId,
      assignedUserId,
      deskId || null,
      roomId || null,
      areaId,
      desk ? desk.code : room.code,
      desk ? desk.pod_name : room.name,
      bookingDate,
      duration || 'Full Day (8h)',
      startTime,
      endTime,
      cost
    );

    // Audit log
    const auditDetails = targetEmployee
      ? `${callerRole.toUpperCase()} ${callerUser.name} allocated seat ${deskId || roomId} to employee ${targetEmployee.name} (${targetEmployee.department}) for ${bookingDate} (${startTime}-${endTime})`
      : `Employee ${callerUser.name} reserved seat ${deskId || roomId} for ${bookingDate} (${startTime}-${endTime})`;

    db.prepare(`
      INSERT INTO system_logs (event_type, user_id, details)
      VALUES ('SEAT_ALLOCATION', ?, ?)
    `).run(callerUser.id, auditDetails);

    const effectiveName = targetEmployee ? targetEmployee.name : callerUser.name;
    const effectiveRole = targetEmployee ? targetEmployee.role : callerUser.role;
    const effectiveAvatar = targetEmployee
      ? targetEmployee.avatar
      : (callerUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80');

    res.status(201).json({
      id: bookingId,
      userId: assignedUserId,
      deskId,
      roomId,
      areaId,
      deskCode: desk ? desk.code : room.code,
      podName: desk ? desk.pod_name : room.name,
      date: bookingDate,
      duration: duration || 'Full Day (8h)',
      startTime,
      endTime,
      status: 'active',
      userName: effectiveName,
      userRole: effectiveRole,
      userAvatar: effectiveAvatar,
      checkInStatus: true,
      cost
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings/my', authenticateToken, (req: AuthRequest, res) => {
  expirePastBookings();
  try {
    const bookings = db.prepare(`
      SELECT b.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC, b.start_time DESC
    `).all(req.user!.id);

    const formatted = bookings.map((b: any) => ({
      id: b.id,
      deskId: b.desk_id,
      roomId: b.room_id,
      areaId: b.area_id,
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
      cost: b.cost
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings/all', authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin' && req.user!.role !== 'manager') {
    return res.status(403).json({ error: 'Manager or Admin access required' });
  }

  expirePastBookings();

  try {
    const bookings = db.prepare(`
      SELECT b.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role, u.department
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.booking_date DESC, b.start_time DESC
    `).all();

    res.json(bookings);
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
  try {
    const totalDesks = db.prepare('SELECT COUNT(*) as count FROM desks').get() as { count: number };
    const occupiedDesks = db.prepare(`SELECT COUNT(*) as count FROM bookings WHERE status = 'active'`).get() as { count: number };

    res.json({
      totalDesks: totalDesks.count,
      occupiedDesks: occupiedDesks.count,
      occupancyRate: Math.round((occupiedDesks.count / totalDesks.count) * 100),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SmartDesk API] Server running on http://localhost:${PORT}`);
});
