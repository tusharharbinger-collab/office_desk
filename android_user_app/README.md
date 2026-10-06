# 📱 SmartDesk Android User Application (WebView)

A dedicated, high-performance Android application providing a native WebView client **exclusively for Users & Employees** of the SmartDesk Office Reservation & Floor Plan System.

---

## 🌟 Key Features

- **Exclusive User Mode**: Pre-configured strictly for Employee & User interactions (desk booking, checking into assigned seats, viewing active/upcoming passes, floor plan blueprint viewing).
- **Native Android Integration**:
  - **Swipe-to-Refresh (`SwipeRefreshLayout`)**: Pull down to refresh live seating availability and pass status.
  - **Custom JavaScript Interface (`AndroidUserApp`)**: Native Haptic feedback, Toast alerts, and user role validation.
  - **Connection Telemetry & Offline Handling**: Detects network connectivity losses and displays a sleek offline fallback UI with one-tap connection retries.
  - **Dynamic Server Config Dialog**: Easily configure target server URLs (`http://10.0.2.2:5173`, local Wi-Fi IP, or production HTTPS server) directly from the in-app settings icon without rebuilding the APK.
  - **Bottom Navigation Toolbar**: Native controls for Back, Home (Employee Portal), Refresh, and Forward navigation.
  - **Network Security Configuration**: Permits HTTP cleartext traffic for local development testing (`localhost`, `10.0.2.2`, LAN IPs) as well as production HTTPS.

---

## 🏗️ Project Architecture

```
android_user_app/
├── build.gradle.kts                   # Top-level Gradle build configuration
├── settings.gradle.kts                # Subproject dependencies & repository settings
├── gradle.properties                  # JVM parameters & AndroidX configs
├── gradlew.bat                        # Windows Gradle wrapper execution script
├── gradle/wrapper/
│   └── gradle-wrapper.properties      # Gradle distribution configuration (v8.4)
├── app/
│   ├── build.gradle.kts               # Android App module dependencies & SDK build settings
│   ├── proguard-rules.pro             # Proguard keep rules for JavascriptInterface
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml    # App permissions & activity manifest
│           ├── java/com/harbinger/office_desk/user/
│           │   ├── MainActivity.kt           # Main WebView container & toolbar controller
│           │   ├── WebAppInterface.kt        # JS-to-Native bridge for toast & haptics
│           │   ├── UserWebViewClient.kt      # Page loading, JS injection, & error handler
│           │   ├── UserWebChromeClient.kt    # Progress bar & console logger
│           │   └── NetworkUtils.kt           # Connectivity detector
│           └── res/
│               ├── drawable/                 # Icon assets (refresh, home, back, forward, settings)
│               ├── layout/                   # Native layouts (activity_main, dialog_url_config)
│               ├── values/                   # Color palette, string translations, & Material3 themes
│               └── xml/                      # Network security configuration
└── README.md                          # Documentation
```

---

## 🚀 How to Run & Connect

### 1. Start the SmartDesk Web & Backend Server
In the root project directory (`d:\FacilitiesSeatingArrangement`), install and start the web application dev server:

```bash
npm install
npm run dev
```
- Web Client default address: `http://localhost:5173`
- Backend API default address: `http://localhost:5180`

### 2. Open & Build the Android Project
1. Launch **Android Studio**.
2. Select **Open** and select the `android_user_app` folder (`d:\FacilitiesSeatingArrangement\android_user_app`).
3. Allow Gradle to sync dependencies.
4. Select an Android Emulator (e.g. Pixel 6 / API 34) or connect a physical Android device via USB Debugging.
5. Click **Run 'app'** (`Shift + F10`).

### 3. Server URL Configuration
- **Android Emulator**: The app defaults to `http://10.0.2.2:5173` (which points to `localhost:5173` on your host machine).
- **Physical Device**: Tap the **Settings icon (⚙️)** in the top app bar and enter your host machine's Wi-Fi IP address (e.g., `http://192.168.1.50:5173`).
- **Production Server**: Tap the **Settings icon (⚙️)** and enter your hosted production domain (e.g. `https://smartdesk.yourdomain.com`).

---

## 🛡️ Scope Isolation Guarantee

This Android application project is created completely within its own dedicated directory (`android_user_app`). **Zero changes were made to any pre-existing project files or subfolders** in the parent repository.
