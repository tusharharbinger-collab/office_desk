# 🚀 Cloud Architecture & Deployment Guide
## Vercel (Frontend) + Render (Backend) + Turso (Database) + Android APK

This guide provides step-by-step instructions to deploy your application to production for free, with full real-time synchronization between your **Vercel Web App** and **Android APK**.

---

## 🏗️ Architecture Topology

```
+-----------------------------------+       +-----------------------------------+
|         Vercel Web App            |       |        Android Mobile APK         |
|  (https://smartdesk.vercel.app)   |       |   (Native WebView / Android 14)   |
+-----------------+-----------------+       +-----------------+-----------------+
                  |                                           |
                  +---------------------+---------------------+
                                        | (REST API Calls)
                                        v
                        +-------------------------------+
                        |    Render Backend Server      |
                        | (https://smartdesk-api.render)|
                        +---------------+---------------+
                                        | (LibSQL Protocol)
                                        v
                        +-------------------------------+
                        |    Turso Cloud Database       |
                        | (libsql://smartdesk-db.turso) |
                        +-------------------------------+
```

---

## 🟢 Step 1: Deploy Turso Cloud Database

1. Sign up / log in to [Turso](https://turso.tech) using Turso CLI:
   ```bash
   curl -sSfL https://get.turso.tech | bash
   turso auth signup
   ```
2. Create your cloud database:
   ```bash
   turso db create smartdesk-db
   ```
3. Get your **Database URL** and **Auth Token**:
   ```bash
   turso db show smartdesk-db --url
   turso db tokens create smartdesk-db
   ```
   *Copy these two values for Step 2!*

---

## 🟣 Step 2: Deploy Backend API to Render.com

1. Push your repository to GitHub: `https://github.com/tusharharbinger-collab/office_desk.git`.
2. Go to [Render Dashboard](https://dashboard.render.com/) ➔ Click **New** ➔ Select **Web Service**.
3. Connect your GitHub repository.
4. Fill in the deployment details:
   - **Name**: `smartdesk-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
5. Under **Environment Variables**, add:
   - `TURSO_DATABASE_URL` = *(Your Turso DB URL from Step 1)*
   - `TURSO_AUTH_TOKEN` = *(Your Turso Auth Token from Step 1)*
   - `JWT_SECRET` = `smartdesk_production_secret_key_2026`
   - `PORT` = `5180`
6. Click **Create Web Service**.
7. Copy your deployed backend URL (e.g. `https://smartdesk-api.onrender.com`).

---

## 🔺 Step 3: Deploy Frontend Web App to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) ➔ Click **Add New** ➔ **Project**.
2. Select your GitHub repository.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://smartdesk-api.onrender.com` *(Your Render URL from Step 2)*
5. Click **Deploy**.
6. Copy your live Vercel URL (e.g. `https://smartdesk.vercel.app`).

---

## 📱 Step 4: Link Android APK to Production Web App

1. Open [`android_user_app`](file:///d:/FacilitiesSeatingArrangement/android_user_app) in **Android Studio**.
2. Open [`MainActivity.kt`](file:///d:/FacilitiesSeatingArrangement/android_user_app/app/src/main/java/com/harbinger/office_desk/user/MainActivity.kt) and [`strings.xml`](file:///d:/FacilitiesSeatingArrangement/android_user_app/app/src/main/res/values/strings.xml).
3. Set default target URL to your production Vercel address:
   ```kotlin
   private val DEFAULT_URL = "https://smartdesk.vercel.app"
   ```
4. Build release APK (`Build` ➔ `Build Bundle(s) / APK(s)` ➔ `Build APK(s)`).
5. Copy generated `app-release.apk` to [`public/downloads/smartdesk-user-app.apk`](file:///d:/FacilitiesSeatingArrangement/public/downloads/smartdesk-user-app.apk).

---

## 🎯 Verification & Real-time Sync
- **Web App**: Anyone visiting `https://smartdesk.vercel.app` can reserve seats.
- **Android APK**: Anyone using the installed APK sees the exact same floor plan and live availability.
- **Data Persistence**: All bookings, check-ins, and user profiles persist instantly to your **Turso Cloud Database**.
