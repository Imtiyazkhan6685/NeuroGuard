package com.scrollguard.app.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AttentionSpanEngine {

    public static class ReelEvent {
        public final String id;
        public final String platform;
        public final long timestamp;
        public final long dwellDurationMs;
        public final long estimatedLengthMs;
        public final boolean wasSkippedEarly;
        public final boolean isMicroSkip;

        public ReelEvent(String platform, long dwellDurationMs, long estimatedLengthMs) {
            this.id = java.util.UUID.randomUUID().toString();
            this.platform = platform;
            this.timestamp = System.currentTimeMillis();
            this.dwellDurationMs = dwellDurationMs;
            this.estimatedLengthMs = estimatedLengthMs;
            this.wasSkippedEarly = dwellDurationMs < 10000L;
            this.isMicroSkip = dwellDurationMs < 3000L;
        }

        public float getBoredomIndex() {
            float ratio = (float) dwellDurationMs / (float) estimatedLengthMs;
            return Math.max(0f, Math.min(1f, 1f - ratio));
        }
    }

    private static final List<ReelEvent> sessionEvents = Collections.synchronizedList(new ArrayList<>());
    private static long currentReelStartTimeMs = 0L;
    private static int dailyLimit = 20;

    public static void startReelView() {
        currentReelStartTimeMs = System.currentTimeMillis();
    }

    public static ReelEvent recordReelSwipe(String platform) {
        long now = System.currentTimeMillis();
        long dwell = (currentReelStartTimeMs > 0) ? (now - currentReelStartTimeMs) : 4000L;
        currentReelStartTimeMs = now;

        ReelEvent event = new ReelEvent(platform, dwell, 60000L);
        sessionEvents.add(event);
        return event;
    }

    public static int getTotalReelsWatchedToday() {
        return sessionEvents.size();
    }

    public static int getDailyLimit() {
        return dailyLimit;
    }

    public static void setDailyLimit(int limit) {
        dailyLimit = limit;
    }

    public static float getAverageAttentionSpanSeconds() {
        if (sessionEvents.isEmpty()) return 6.4f;
        long totalDwell = 0;
        synchronized (sessionEvents) {
            for (ReelEvent e : sessionEvents) {
                totalDwell += e.dwellDurationMs;
            }
            return (float) (totalDwell / sessionEvents.size()) / 1000f;
        }
    }

    public static float getBoredomRatePercentage() {
        if (sessionEvents.isEmpty()) return 72f;
        int earlySkips = 0;
        synchronized (sessionEvents) {
            for (ReelEvent e : sessionEvents) {
                if (e.wasSkippedEarly) earlySkips++;
            }
            return ((float) earlySkips / (float) sessionEvents.size()) * 100f;
        }
    }

    public static int getMicroSkipsCount() {
        int count = 0;
        synchronized (sessionEvents) {
            for (ReelEvent e : sessionEvents) {
                if (e.isMicroSkip) count++;
            }
        }
        return count;
    }

    public static void clearToday() {
        sessionEvents.clear();
        currentReelStartTimeMs = 0L;
    }
}
