package com.scrollguard.app.services;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

public class ReelAccessibilityService extends AccessibilityService {

    private static final String TAG = "ReelAccessibilitySvc";
    private static final String PKG_INSTAGRAM = "com.instagram.android";
    private static final String PKG_YOUTUBE = "com.google.android.youtube";

    // Debounce to prevent multiple counts on a single user swipe
    private static final long SCROLL_DEBOUNCE_MS = 800L;
    private static final long CONTENT_THROTTLE_MS = 350L;

    private AccountabilityManager accountabilityManager;
    private long lastScrollTimestamp = 0L;
    private long lastContentCheckTimestamp = 0L;
    private boolean isTargetAppInForeground = false;
    private String lastReelSignature = "";

    @Override
    public void onCreate() {
        super.onCreate();
        AttentionSpanEngine.init(this);
        accountabilityManager = new AccountabilityManager(this);
        Log.i(TAG, "ReelAccessibilityService initialized with multi-signal reel detection");
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
            Log.e(TAG, "Failed to launch HUD: " + e.getMessage());
        }
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;

        String packageName = event.getPackageName().toString();
        if (!PKG_INSTAGRAM.equals(packageName) && !PKG_YOUTUBE.equals(packageName)) return;

        int eventType = event.getEventType();

        switch (eventType) {
            case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
                handleWindowStateChanged(packageName, event);
                break;

            case AccessibilityEvent.TYPE_VIEW_SCROLLED:
            case AccessibilityEvent.TYPE_VIEW_SELECTED:
                handleScrollOrPageSelect(packageName, event);
                break;

            case AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED:
                handleWindowContentChanged(packageName);
                break;
        }
    }

    private void handleWindowStateChanged(String packageName, AccessibilityEvent event) {
        boolean isTarget = PKG_INSTAGRAM.equals(packageName) || PKG_YOUTUBE.equals(packageName);

        if (isTarget && !isTargetAppInForeground) {
            isTargetAppInForeground = true;
            Log.d(TAG, "Target app opened: " + packageName + ". Mounting Floating HUD.");
            AttentionSpanEngine.startReelView();
            launchHud(FloatingHudService.ACTION_SHOW);
        } else if (!isTarget && isTargetAppInForeground) {
            isTargetAppInForeground = false;
            Log.d(TAG, "Exited target app.");
        }

        // Also check if entering reels surface
        checkContentChange(packageName);
    }

    private void handleScrollOrPageSelect(String packageName, AccessibilityEvent event) {
        long now = SystemClock.uptimeMillis();
        if (now - lastScrollTimestamp < SCROLL_DEBOUNCE_MS) return;

        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        try {
            if (isReelsOrShortsSurface(rootNode, packageName)) {
                String signature = extractContentSignature(rootNode, packageName);
                recordSwipe(packageName, "Scroll/PageSelect (" + (signature.isEmpty() ? "gesture" : signature) + ")");
                if (!signature.isEmpty()) {
                    lastReelSignature = signature;
                }
            }
        } finally {
            tryRecycle(rootNode);
        }
    }

    private void handleWindowContentChanged(String packageName) {
        long now = SystemClock.uptimeMillis();
        if (now - lastContentCheckTimestamp < CONTENT_THROTTLE_MS) return;
        lastContentCheckTimestamp = now;

        checkContentChange(packageName);
    }

    private void checkContentChange(String packageName) {
        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        try {
            if (isReelsOrShortsSurface(rootNode, packageName)) {
                String signature = extractContentSignature(rootNode, packageName);
                if (!signature.isEmpty()) {
                    long now = SystemClock.uptimeMillis();
                    if (!signature.equals(lastReelSignature) && !lastReelSignature.isEmpty()) {
                        if (now - lastScrollTimestamp >= SCROLL_DEBOUNCE_MS) {
                            recordSwipe(packageName, "Signature Change (" + signature + ")");
                        }
                    }
                    lastReelSignature = signature;
                }
            }
        } finally {
            tryRecycle(rootNode);
        }
    }

    private boolean isReelsOrShortsSurface(AccessibilityNodeInfo rootNode, String packageName) {
        if (rootNode == null) return false;

        if (PKG_INSTAGRAM.equals(packageName)) {
            // Instagram Reels: check for clips identifiers, audio label, reel tags
            if (hasMatchingNode(rootNode, new String[]{"clips", "reel", "reel_viewer", "layout_clips", "like_button", "comment_button"},
                                          new String[]{"Reels", "Reel by", "Audio", "original audio", "Like", "Comment"}, 0, 35)) {
                return true;
            }
        } else if (PKG_YOUTUBE.equals(packageName)) {
            // YouTube Shorts: check for shorts player, reel player, subscribe, sound
            if (hasMatchingNode(rootNode, new String[]{"shorts", "reel", "reel_player", "reel_recycler", "sound_button"},
                                          new String[]{"Shorts", "Sound", "Remix", "Subscribe", "Dislike"}, 0, 35)) {
                return true;
            }
        }

        return false;
    }

    private boolean hasMatchingNode(AccessibilityNodeInfo node, String[] idKeywords, String[] textKeywords, int currentDepth, int maxNodes) {
        if (node == null || currentDepth > 6) return false;

        CharSequence viewId = node.getViewIdResourceName();
        if (viewId != null) {
            String idStr = viewId.toString().toLowerCase();
            for (String kw : idKeywords) {
                if (idStr.contains(kw)) return true;
            }
        }

        CharSequence desc = node.getContentDescription();
        if (desc != null) {
            String descStr = desc.toString().toLowerCase();
            for (String kw : textKeywords) {
                if (descStr.contains(kw.toLowerCase())) return true;
            }
        }

        CharSequence text = node.getText();
        if (text != null) {
            String textStr = text.toString().toLowerCase();
            for (String kw : textKeywords) {
                if (textStr.contains(kw.toLowerCase())) return true;
            }
        }

        int childCount = node.getChildCount();
        for (int i = 0; i < childCount && i < 8; i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                boolean match = hasMatchingNode(child, idKeywords, textKeywords, currentDepth + 1, maxNodes);
                tryRecycle(child);
                if (match) return true;
            }
        }

        return false;
    }

    private String extractContentSignature(AccessibilityNodeInfo rootNode, String packageName) {
        if (rootNode == null) return "";
        StringBuilder sb = new StringBuilder();
        collectSignatureText(rootNode, sb, 0, 20);
        return sb.toString().trim();
    }

    private void collectSignatureText(AccessibilityNodeInfo node, StringBuilder sb, int depth, int maxNodes) {
        if (node == null || depth > 5 || sb.length() > 100) return;

        CharSequence text = node.getText();
        if (text != null && text.length() > 2 && text.length() < 60) {
            String s = text.toString().trim();
            // Avoid generic counters like 00:00 or system status
            if (!s.matches("^[0-9:]+$")) {
                if (sb.length() > 0) sb.append("|");
                sb.append(s);
            }
        }

        CharSequence desc = node.getContentDescription();
        if (desc != null && desc.length() > 3 && desc.length() < 60) {
            String s = desc.toString().trim();
            if (s.startsWith("Reel by") || s.contains("Sound") || s.contains("Audio")) {
                if (sb.length() > 0) sb.append("|");
                sb.append(s);
            }
        }

        int childCount = node.getChildCount();
        for (int i = 0; i < childCount && i < 6; i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                collectSignatureText(child, sb, depth + 1, maxNodes);
                tryRecycle(child);
            }
        }
    }

    private void recordSwipe(String packageName, String triggerReason) {
        long now = SystemClock.uptimeMillis();
        lastScrollTimestamp = now;

        String platform = PKG_INSTAGRAM.equals(packageName) ? "Instagram Reels" : "YouTube Shorts";
        Log.i(TAG, "🎯 Real Reel Swipe detected on " + platform + " via " + triggerReason);

        AttentionSpanEngine.recordReelSwipe(platform, this);

        // Update Floating HUD immediately
        launchHud(FloatingHudService.ACTION_UPDATE_COUNT);

        // Check if daily limit reached and trigger automated alerts
        if (accountabilityManager != null) {
            accountabilityManager.checkAndTriggerAlertIfLimitReached();
        }
    }

    private void tryRecycle(AccessibilityNodeInfo node) {
        if (node != null && Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            try {
                node.recycle();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Accessibility Service interrupted");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "Accessibility Service destroyed");
    }
}
