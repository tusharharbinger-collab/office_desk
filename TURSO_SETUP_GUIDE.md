# 🚀 Turso Cloud Database Setup Guide

This guide explains how to connect your **SmartDesk Web App** and **Android User APK** to a **100% Free Turso Cloud Database (LibSQL)**.

---

## 🗑️ 1. Local SQLite Data Purged
All local SQLite database files (`smartdesk.db`, `smartdesk.db-wal`, `smartdesk.db-shm`) have been removed from the repository.

---

## ⚡ 2. Set Up Free Turso Cloud Database (2 Minutes)

### Step 1: Install Turso CLI & Sign Up (Free)
Run in your terminal (PowerShell / Bash):
```bash
# Install Turso CLI
curl -sSfL https://get.turso.tech | bash

# Log in / Sign up for free
turso auth signup
```

### Step 2: Create your SmartDesk Database
```bash
turso db create smartdesk-db
```

### Step 3: Get Database URL and Auth Token
```bash
# Show Database URL
turso db show smartdesk-db --url

# Generate Auth Token
turso db tokens create smartdesk-db
```

---

## 🔑 3. Configure `.env` File
Create or update your `.env` file in the root project folder:

```env
PORT=5180
JWT_SECRET=smartdesk_super_secret_jwt_key_2026

# Paste your Turso credentials here:
TURSO_DATABASE_URL=libsql://smartdesk-db-[your-username].turso.io
TURSO_AUTH_TOKEN=your_generated_turso_auth_token
```

---

## 🔄 4. Start the Application
Run the dev server:
```bash
npm run dev
```

Your web app and Android APK will automatically connect to your **Turso Cloud Database**, ensuring all seat reservations, floor plans, and bookings are stored safely in the cloud for free!
