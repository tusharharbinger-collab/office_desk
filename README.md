# office_desk

A modern, full-stack hybrid workplace office desk reservation and floor plan allocation system with real-time dynamic booking, time-window slot engine, SQLite persistence, and enterprise administrative controls.

## 🚀 Key Features

- **Interactive Floor Plan Blueprints**: High-fidelity architectural floor layout for Work Area 1 (130 desks) and Work Area 2 (80 desks) with pod grouping, meeting rooms, executive boardrooms, and live status dots.
- **Dynamic Date & Time Allocation**: Bookings are reserved for exact dates and time slots (Full Day, Morning, Afternoon, Evening, or Custom hours) with automatic de-allocation when reservation windows expire.
- **Real-Time Live Presence & Radar**: Interactive occupancy visualization and live telemetry.
- **Role-Based Access Control**:
  - **Employee**: Book available desks, check into assigned seats, view active & upcoming passes, cancel bookings.
  - **Manager**: Team seating allocation, department-level booking, live occupancy tracking.
  - **Admin**: Enterprise seat assignment, user directory management, system health and telemetry monitoring.
- **Enterprise Authentication & SSO**: Local SQLite authentication and Microsoft Azure AD SSO readiness with corporate domain restrictions.
- **System Health & Infrastructure Telemetry**: Real-time engine telemetry, p95 API latency, active WebSockets, database pool health, and endpoint status monitor.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide / Material Symbols, Vite
- **Backend**: Node.js, Express, better-sqlite3 (WAL Mode), WebSocket, JWT, bcryptjs
- **Database**: SQLite (persisted locally with Write-Ahead Logging for high concurrency)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/tusharharbinger-collab/office_desk.git
cd office_desk
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

### 4. Running the Development Server
```bash
npm run dev
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5180`

### 5. Production Build
```bash
npm run build
```

---

## 🔒 Security & Domain Enforcement
For enterprise setups, see [`ORGANIZATION_ACCESS_SECURITY.md`](./ORGANIZATION_ACCESS_SECURITY.md) for full instructions on configuring Azure AD Single Sign-On and restricting account access strictly to your corporate domain.
