# NeuroGuard (ScrollZero) 🛡️📱

> **Break the Short-Form Video Dopamine Loop**  
> A production-ready Android application with a **Floating Hover HUD**, **Cognitive Attention Span & Boredom Analytics**, and **Automated Parent/Friend Accountability SMS Alerts** when daily reel quotas are reached.

---

<p align="center">
  <a href="https://github.com/Imtiyazkhan6685/NeuroGuard/releases/download/v1.0.0/NeuroGuard.apk">
    <img src="https://img.shields.io/badge/📥_Download-NeuroGuard.apk_(v1.0.0)-5E5CE6?style=for-the-badge&logo=android&logoColor=white" alt="Download NeuroGuard APK" height="48" />
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
> - **Floating Hover Pill**: Rendered directly by Android's native `WindowManager`. Works completely offline.
> - **Reels & Shorts Detection**: Monitored locally on your device via Android's native `AccessibilityService`. No data ever leaves your phone.
> - **Attention Span Analytics**: All millisecond dwell times, boredom rates, and drop-off curves are calculated in local device memory.
> - **Accountability Alert**: Uses Android's built-in `SmsManager` to send a direct text message from your phone's SIM card over your cellular network. **No internet, Wi-Fi, or cloud server is needed!**
> - *(Optional Developer Webhook)*: An optional cloud webhook is available for developers who want to connect Discord/Slack/Twilio, but it is 100% optional. The app works fully without it.

---

## 📲 Newcomer Installation Guide (Step-by-Step)

Installing an APK takes less than **60 seconds**. Follow these steps:

### Step 1: Download the APK
On your Android phone, tap the button below or copy the link into Google Chrome:
👉 **[Download NeuroGuard.apk](https://github.com/Imtiyazkhan6685/NeuroGuard/releases/download/v1.0.0/NeuroGuard.apk)** *(~4.2 MB)*

### Step 2: Allow Installation
1. Once the file finishes downloading, tap **Open** or find `NeuroGuard.apk` in your phone's **Files / Downloads** app.
2. If Android displays: *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings** on the prompt.
   - Toggle **Allow from this source** to **ON**.
   - Tap the back button and tap **Install**.

### Step 3: Grant the 3 Core Permissions
When you open NeuroGuard for the first time, enable the three permissions:

| Permission | Why It's Needed | How to Enable |
|---|---|---|
| **1. Display Over Other Apps** | Allows the floating pill counter to hover over Instagram and YouTube. | Tap **Enable Overlay** ➔ Find **NeuroGuard** in the list ➔ Toggle **Allow display over other apps**. |
| **2. Accessibility Service** | Detects when you open Reels/Shorts and counts each swipe. | Tap **Enable Accessibility** ➔ Tap **Installed Apps / Downloaded Services** ➔ Select **NeuroGuard** ➔ Toggle **ON**. |
| **3. SMS Permission** | Automatically sends the text message to your partner when limit is exceeded. | Tap **Allow** when the system prompt asks for SMS access. |

### Step 4: Set Your Accountability Partner
1. Go to the **Accountability** tab in the app.
2. Enter the **Name** and **Phone Number** of the person you want to keep you accountable (e.g., Mom, Dad, Best Friend, Coach).
3. Set your **Daily Reel Quota** (e.g., 20 Reels).
4. Tap **Send Test Alert** to verify that the SMS sends properly!

### Step 5: Test the Magic! ✨
- Open the **Instagram** app and scroll to **Reels**, or open **YouTube Shorts**.
- A small glassmorphic pill will immediately appear floating on your screen:
  - **Reel Count**: Shows your current count vs daily limit (`1 / 20 Reels`).
  - **Live Stopwatch**: Ticks up while you watch (`00:07s`).
  - **Attention State**: Detects if you are `⚡ Impulsive`, `🥱 Boredom Skimming`, or `🧠 Deep Focus`.
- When you reach your limit, NeuroGuard automatically dispatches an alert SMS to your partner!

---

## 🌟 Key Capabilities

### 1. Floating Hover HUD (`SYSTEM_ALERT_WINDOW`)
- Automatically appears over Instagram Reels and YouTube Shorts.
- Draggable to any position on your screen with fluid spring physics.
- Collapsible into a compact status dot.

### 2. Automated Accountability SMS
- When you exceed your daily quota, an automated SMS is dispatched to your partner:
  > *"🚨 NeuroGuard Alert: Your partner Alex just exceeded their daily limit of 20 Reels (20 watched today). Their average attention span dropped to 6.2s with 74% skipped out of boredom. Please call them to keep them on track!"*

### 3. Attention Span Decay & Boredom Curve
- **Why 60s Reels get skipped**: Tracks the second-by-second drop-off curve showing how user boredom spikes between seconds 4–8.
- **Boredom Rate**: Percentage of videos abandoned within the first 10 seconds.
- **Compulsive Micro-Skips**: Swipes under 3 seconds revealing slot-machine habit loops.
- **Hourly Doomscroll Heatmap**: Highlights peak late-night binge hours.

### 4. Apple iOS-Grade Design
- Frosted glassmorphism with dark titanium aesthetic.
- Cupertino segmented controls and tactile haptic feedback.

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
