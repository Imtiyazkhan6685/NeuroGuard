package com.scrollguard.app.services

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent

/**
 * ReelAccessibilityService is the primary background sensor of NeuroGuard.
 * 
 * Functions:
 * 1. Senses when Instagram (com.instagram.android) or YouTube (com.google.android.youtube) opens.
 * 2. Immediately triggers the Floating HUD overlay over their screen.
 * 3. Senses when the user is in the Reels viewer / YouTube Shorts viewer.
 * 4. Detects scroll events (swiping to the next reel).
 * 5. Measures dwell time (how many seconds they lasted before getting bored).
 * 6. Checks daily limit and invokes AccountabilityManager when breached.
 */
class ReelAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "ReelAccessibilitySvc"
        private const val PKG_INSTAGRAM = "com.instagram.android"
        private const val PKG_YOUTUBE = "com.google.android.youtube"

        // Minimum threshold in ms to avoid double-counting scroll bouncing
        private const val SCROLL_DEBOUNCE_MS = 1200L
    }

    private var accountabilityManager: AccountabilityManager? = null
    private var lastScrollTimestamp = 0L
    private var isTargetAppInForeground = false

    override fun onCreate() {
        super.onCreate()
        accountabilityManager = AccountabilityManager(this)
        Log.i(TAG, "ReelAccessibilityService initialized")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val packageName = event.packageName?.toString() ?: return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                handleWindowStateChanged(packageName)
            }
            AccessibilityEvent.TYPE_VIEW_SCROLLED -> {
                handleViewScrolled(packageName, event)
            }
        }
    }

    private fun handleWindowStateChanged(packageName: String) {
        val isTarget = (packageName == PKG_INSTAGRAM || packageName == PKG_YOUTUBE)

        if (isTarget && !isTargetAppInForeground) {
            isTargetAppInForeground = true
            Log.d(TAG, "Target app opened ($packageName). Displaying Floating HUD.")
            
            // Start the dwell timer for the first reel
            AttentionSpanEngine.startReelView()

            // Mount Floating HUD
            val hudIntent = Intent(this, FloatingHudService::class.java).apply {
                action = FloatingHudService.ACTION_SHOW
            }
            startService(hudIntent)
        } else if (!isTarget && isTargetAppInForeground) {
            isTargetAppInForeground = false
            Log.d(TAG, "User exited short-form video app. Dismissing Floating HUD.")

            // Dismiss Floating HUD
            val hudIntent = Intent(this, FloatingHudService::class.java).apply {
                action = FloatingHudService.ACTION_HIDE
            }
            startService(hudIntent)
        }
    }

    private fun handleViewScrolled(packageName: String, event: AccessibilityEvent) {
        if (packageName != PKG_INSTAGRAM && packageName != PKG_YOUTUBE) return

        val now = SystemClock.uptimeMillis()
        if (now - lastScrollTimestamp < SCROLL_DEBOUNCE_MS) {
            // Ignore micro touch adjustments / inertia bounces
            return
        }
        lastScrollTimestamp = now

        val platform = if (packageName == PKG_INSTAGRAM) "Instagram Reels" else "YouTube Shorts"
        Log.i(TAG, "Reel swipe detected on $platform!")

        // 1. Record dwell time and update attention decay calculations
        val reelEvent = AttentionSpanEngine.recordReelSwipe(platform)
        Log.i(
            TAG,
            "Reel #${AttentionSpanEngine.getTotalReelsWatchedToday()}: Dwell = ${reelEvent.dwellDurationMs}ms, Boredom Index = ${reelEvent.boredomIndex}"
        )

        // 2. Update the floating HUD overlay
        val updateIntent = Intent(this, FloatingHudService::class.java).apply {
            action = FloatingHudService.ACTION_UPDATE_COUNT
        }
        startService(updateIntent)

        // 3. Check if daily quota breached -> triggers parent/friend accountability message!
        accountabilityManager?.checkAndTriggerAlertIfLimitReached()
    }

    override fun onInterrupt() {
        Log.w(TAG, "ReelAccessibilityService interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        val hudIntent = Intent(this, FloatingHudService::class.java).apply {
            action = FloatingHudService.ACTION_HIDE
        }
        startService(hudIntent)
    }
}
