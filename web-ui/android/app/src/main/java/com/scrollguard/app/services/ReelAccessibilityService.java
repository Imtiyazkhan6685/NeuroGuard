package com.scrollguard.app.services;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

public class ReelAccessibilityService extends AccessibilityService {

    private static final String TAG = "ReelAccessibilitySvc";
    private static final String PKG_INSTAGRAM = "com.instagram.android";
    private static final String PKG_YOUTUBE = "com.google.android.youtube";
    private static final long SCROLL_DEBOUNCE_MS = 1000L;

    private AccountabilityManager accountabilityManager;
    private long lastScrollTimestamp = 0L;
    private boolean isTargetAppInForeground = false;

    @Override
    public void onCreate() {
        super.onCreate();
        accountabilityManager = new AccountabilityManager(this);
        Log.i(TAG, "ReelAccessibilityService created");
    }

    private void launchHud(String action) {
        try {
            Intent hudIntent = new Intent(this, FloatingHudService.class);
            hudIntent.setAction(action);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(hudIntent);
            } else {
                startService(hudIntent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to launch HUD with action " + action + ": " + e.getMessage());
        }
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;

        String packageName = event.getPackageName().toString();

        switch (event.getEventType()) {
            case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
                handleWindowStateChanged(packageName);
                break;
            case AccessibilityEvent.TYPE_VIEW_SCROLLED:
            case AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED:
                handlePotentialScroll(packageName, event);
                break;
        }
    }

    private void handleWindowStateChanged(String packageName) {
        boolean isTarget = PKG_INSTAGRAM.equals(packageName) || PKG_YOUTUBE.equals(packageName);

        if (isTarget && !isTargetAppInForeground) {
            isTargetAppInForeground = true;
            Log.d(TAG, "Target app opened: " + packageName + ". Mounting Floating HUD.");

            AttentionSpanEngine.startReelView();
            launchHud(FloatingHudService.ACTION_SHOW);

        } else if (!isTarget && isTargetAppInForeground) {
            isTargetAppInForeground = false;
            Log.d(TAG, "Exited target app. Dismissing Floating HUD.");

            launchHud(FloatingHudService.ACTION_HIDE);
        }
    }

    private void handlePotentialScroll(String packageName, AccessibilityEvent event) {
        if (!PKG_INSTAGRAM.equals(packageName) && !PKG_YOUTUBE.equals(packageName)) return;

        long now = SystemClock.uptimeMillis();
        if (now - lastScrollTimestamp < SCROLL_DEBOUNCE_MS) return;
        lastScrollTimestamp = now;

        String platform = PKG_INSTAGRAM.equals(packageName) ? "Instagram Reels" : "YouTube Shorts";
        Log.i(TAG, "Reel swipe/scroll event detected on " + platform);

        AttentionSpanEngine.recordReelSwipe(platform);

        // Update HUD
        launchHud(FloatingHudService.ACTION_UPDATE_COUNT);

        // Check if daily limit reached and trigger automated alerts to selected parents/friends
        if (accountabilityManager != null) {
            accountabilityManager.checkAndTriggerAlertIfLimitReached();
        }
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Accessibility Service interrupted");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        launchHud(FloatingHudService.ACTION_HIDE);
    }
}
