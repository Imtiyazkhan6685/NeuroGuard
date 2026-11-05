# NeuroGuard (ScrollZero) 🛡️📱

> **Break the Short-Form Video Dopamine Loop**  
> A production-grade mobile solution with **Floating Hover HUD**, **Reel-by-Reel Attention Span & Boredom Analytics**, and **Automated Parent/Best Friend Accountability Messaging** when daily limits are breached.

---

## 🌟 Key Capabilities

1. **Floating Hover HUD (`SYSTEM_ALERT_WINDOW`)**
   - Automatically mounts over Instagram Reels and YouTube Shorts the instant either app opens.
   - Shows live reel count / daily limit (e.g. `14 / 20 Reels`).
   - Live stopwatch counting elapsed seconds on the current reel.
   - Real-time cognitive status: `⚡ Impulsive`, `🥱 Boredom Drop`, `👀 Mid Attention`, `🧠 Deep Focus`.
   - Draggable to any corner; collapses to a sleek pill.

2. **Automated Accountability Trigger (Parents / Best Friend)**
   - When the user reaches their daily limit (e.g., 20 reels), NeuroGuard automatically dispatches an SMS or WhatsApp alert to their accountability partner:
     > *"🚨 NeuroGuard Alert: Your partner Alex just exceeded their daily limit of 20 Reels (20 watched today). Their average attention span dropped to 6.2s with 74% skipped out of boredom. Please call them to keep them on track!"*

3. **Attention Span Decay & Boredom Curve**
   - **Why 60s Reels get skipped**: Tracks the second-by-second drop-off curve showing how user boredom spikes between seconds 4–8.
   - **Boredom Rate**: Percentage of videos abandoned within the first 10 seconds.
   - **Compulsive Micro-Skips**: Rapid swipes (< 3 seconds) revealing dopamine slot-machine behavior.
   - **Hourly Heatmap**: Pinpoints peak late-night doomscrolling windows.

4. **Apple-Grade iOS UI Design System**
   - Frosted glassmorphism (`backdrop-filter: blur(24px)`).
   - Dynamic Island status indicator.
   - Cupertino segmented controls and tactile spring physics.

---

## 🏗️ Architecture & Platform Breakdown

### Android Native Core (`/android`)
- **`ReelAccessibilityService.kt`**: Hooks into `com.instagram.android` and `com.google.android.youtube`. Intercepts `AccessibilityEvent.TYPE_VIEW_SCROLLED` and calculates millisecond dwell time.
- **`FloatingHudService.kt`**: Android Foreground Service rendering the interactive floating pill via `WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY`.
- **`AccountabilityManager.kt`**: Dispatches direct SMS via `android.telephony.SmsManager` and triggers webhook/WhatsApp alerts with debounce cooldowns.
- **`AttentionSpanEngine.kt`**: Computes rolling average attention span, boredom index, and dwell duration buckets.

### Interactive iOS Dashboard & Simulator (`/web-ui`)
- Built with React, TypeScript, and Tailwind CSS.
- Features a simulated Instagram & YouTube feed with the live floating hover HUD for immediate interactive testing on any computer or mobile browser.

### Cloud Notification Webhook (`/server`)
- Express backend supporting Twilio SMS, WhatsApp Cloud API, and webhook delivery.

---

## 🚀 Quick Start: Running the Interactive App

### 1. Launch the Web UI & Simulator
```bash
cd web-ui
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to test the live simulator, swipe through reels, watch the floating HUD tick in real time, and trigger the accountability message!

### 2. (Optional) Run the Accountability Server
```bash
cd server
npm install
npm run start
```
Runs on `http://localhost:3001` to receive live webhook alerts.
