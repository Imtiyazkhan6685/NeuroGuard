# NeuroGuard (ScrollZero) 🛡️📱

> **Break the Short-Form Video Dopamine Loop**  
> An Apple Fitness-grade Android application featuring a **Persistent Corner Floating HUD Widget**, **Dual-Limit State Machine (Reels vs. Active Minutes)**, and **Multi-Recipient Parent & Friend Accountability Sharing**.

---

<p align="center">
  <a href="https://github.com/Imtiyazkhan6685/NeuroGuard/releases/download/v1.0.0/NeuroGuard.apk">
    <img src="https://img.shields.io/badge/📥_Download-NeuroGuard.apk_(v1.0.0)-30D158?style=for-the-badge&logo=android&logoColor=white" alt="Download NeuroGuard APK" height="52" />
  </a>
</p>

<p align="center">
  <b>Direct APK Download Link:</b><br/>
  <code>https://github.com/Imtiyazkhan6685/NeuroGuard/releases/download/v1.0.0/NeuroGuard.apk</code>
</p>

---

## 💡 Important: Does it need a server or internet?

> ### 🟢 **NO SERVER & NO INTERNET REQUIRED!**
> 
> **NeuroGuard operates 100% offline and standalone on your Android device.**
> 
> - **Persistent Draggable Floating HUD**: Rendered directly by Android's native `WindowManager`. Stays parked on the side of your screen even when NeuroGuard or target apps are closed.
> - **Real Instagram & YouTube Shorts Detection**: Monitored locally on your device via Android's native `AccessibilityService`. Tracks real swipe transitions without touching any screen content or personal data.
> - **Dual-Limit Evaluation**: Dynamically monitors **Reel Count vs. Active Foreground Minutes** in local memory, triggering when whichever threshold is hit first.
> - **100% Play Protect Safe**: No invasive background SMS daemon permissions. Accountability sharing uses standard 1-tap SMS intents (`ACTION_SENDTO`), WhatsApp dispatching, or optional local webhooks. No financial fraud warnings or installation blocks.

---

## 📲 Installation Guide & Android Setup

Installing takes less than **60 seconds**:

### Step 1: Download the APK
On your Android phone, download the APK from the link above:  
👉 **[Download NeuroGuard.apk](https://github.com/Imtiyazkhan6685/NeuroGuard/releases/download/v1.0.0/NeuroGuard.apk)** *(~4.2 MB)*

### Step 2: Install the APK
1. Tap the downloaded file in your browser or find `NeuroGuard.apk` in your **Downloads** folder.
2. If Android warns *"Install unknown apps"*:
   - Tap **Settings** ➔ Toggle **Allow from this source** to **ON**.
   - Return and tap **Install**.
3. **Google Play Protect**: NeuroGuard passes all Play Protect checks cleanly because sensitive background SMS daemon permissions have been eliminated.

### Step 3: Enable the 2 System Services

| Service | Why It's Needed | How to Enable |
|---|---|---|
| **1. Display Over Other Apps** | Allows the floating pill counter to dock on your screen over Instagram and YouTube. | Tap **Enable Overlay** ➔ Select **NeuroGuard** ➔ Toggle **Allow display over other apps**. |
| **2. Accessibility Service** | Intercepts swipe gestures on Instagram (`com.instagram.android`) and YouTube (`com.google.android.youtube`). | Tap **Enable Accessibility** ➔ Tap **Downloaded apps** ➔ Select **NeuroGuard** ➔ Toggle **ON**. |

> [!NOTE]
> **Android 13 / 14 / 15 "Restricted Setting" Fix**:  
> If Android greys out the Accessibility toggle saying *"Restricted setting for your security"*:  
> 1. Go to your phone **Settings ➔ Apps ➔ NeuroGuard** (or long-press the NeuroGuard app icon and tap **App Info** `ⓘ`).  
> 2. Tap the **three vertical dots (⋮)** in the top-right corner.  
> 3. Tap **"Allow restricted settings"** and confirm with your fingerprint/PIN.  
> 4. Go back to Accessibility and turn **NeuroGuard ON**.

---

## 🌟 Core Features

### 1. Dual-Limit State Machine & Dynamic HUD
NeuroGuard evaluates two thresholds simultaneously, whichever is reached first:
- **Daily Reels Quota** (e.g. 20 Reels)
- **Daily Active Minutes** (e.g. 30 Minutes)

The floating pill stays visible in the corner and shifts color in real time:
- 🟢 **Safe (0% – 74%)**: Green pill displaying live count & stopwatch (e.g. `8/20 Reels • 6m`).
- 🟡 **Warning (75% – 99%)**: Amber pill alerting you that you are approaching your limit.
- 🔴 **Quota Exceeded (100%+)**: Pulsing red alert triggering accountability notifications.

### 2. Multi-Recipient Accountability Sharing
- Add multiple contacts (e.g. **Mom**, **Dad**, **Best Friend**, **Partner**).
- Enable or disable recipients individually with simple checkboxes.
- Quick 1-tap presets: **All Selected**, **Friends Only**, or **Parents Only**.
- Direct SMS and WhatsApp integration dispatches your attention score and dwell stats instantly.

### 3. Apple Fitness-Grade OLED Design
- Pitch-black OLED background (`#000000`) with zero visual clutter.
- Concentric triple activity rings:
  - 🔴 **Coral-Red Ring (`#FA114F`)**: Reels Quota Consumption
  - 🟢 **Volt-Lime Ring (`#A8FF00`)**: Focus & Skim Ratio
  - 🔵 **Electric-Cyan Ring (`#00F0FF`)**: Daily Active Minutes
- Individual live status cards for **Instagram** and **YouTube Shorts**.

---

## 🔒 Privacy & Safety Guarantee

- **No screen recording or DOM inspection**: Only swipe transition events are filtered by app package name.
- **100% on-device processing**: No personal data or browsing history is ever collected, uploaded, or transmitted.
- **No invasive permissions**: No financial, banking, contacts, or background SMS access.

---

## 🏗️ Architecture & Local Codebase

```
NeuroGuard/
├── NeuroGuard.apk                      <-- Standalone compiled APK (Ready to install)
├── android/                            <-- Pure Kotlin Native Android Project
│   ├── src/main/java/com/scrollguard/app/
│   │   ├── services/
│   │   │   ├── ReelAccessibilityService.kt
│   │   │   ├── FloatingHudService.kt
│   │   │   ├── AccountabilityManager.kt
│   │   │   └── AttentionSpanEngine.kt
├── web-ui/                             <-- Capacitor + React iOS Interface
│   ├── src/components/
│   │   ├── FloatingHudOverlay.tsx
│   │   ├── AttentionAnalyticsView.tsx
│   │   ├── AccountabilityView.tsx
│   │   └── FeedSimulatorView.tsx
│   └── android/                        <-- Production Capacitor Android Project
│       └── app/src/main/java/com/scrollguard/app/
│           └── ScrollGuardPlugin.java  <-- Capacitor Native Bridge
└── server/                             <-- (Optional) Webhook Backend
    └── server.js
```

---

## 🛠️ Developer & Build Instructions

If you want to run the web simulator locally:

```bash
# 1. Install & launch interactive Web UI
cd web-ui
npm install
npm run dev
# Open http://localhost:3000 to test the interactive feed & HUD
```

To compile your own APK using Gradle:
```bash
cd web-ui/android
./gradlew assembleDebug
```

---

## 🔒 Privacy & Safety Guarantee

NeuroGuard is built with privacy by design:
- **No video or screen content is ever recorded or inspected.**
- **No data leaves your device over the internet.**
- Accessibility events are filtered strictly by package name (`com.instagram.android`, `com.google.android.youtube`) to detect swipe gestures only.
