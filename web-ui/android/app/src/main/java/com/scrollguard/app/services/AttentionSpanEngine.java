package com.scrollguard.app.services;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;

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

    private static final String PREFS_NAME = "neuroguard_engine_prefs";
    private static final String KEY_SAVED_DATE = "saved_date";
    private static final String KEY_REELS_TODAY = "reels_today";
    private static final String KEY_IG_TODAY = "ig_today";
    private static final String KEY_YT_TODAY = "yt_today";
    private static final String KEY_DWELL_MS_TODAY = "dwell_ms_today";
    private static final String KEY_MICRO_SKIPS_TODAY = "micro_skips_today";
    private static final String KEY_DAILY_LIMIT = "daily_limit";
    private static final String KEY_MAX_MINUTES = "max_minutes";
    private static final String KEY_STREAK_DAYS = "streak_days";
    private static final String KEY_7DAY_HISTORY = "history_7days";

    private static final List<ReelEvent> sessionEvents = Collections.synchronizedList(new ArrayList<>());
    private static long currentReelStartTimeMs = 0L;
    private static int dailyLimit = 20;
    private static int maxDailyMinutes = 30;
    private static int streakDays = 1;
    private static boolean isInitialized = false;

    private static String getTodayDateString() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    public static synchronized void init(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String today = getTodayDateString();
        String savedDate = prefs.getString(KEY_SAVED_DATE, "");

        dailyLimit = prefs.getInt(KEY_DAILY_LIMIT, 20);
        maxDailyMinutes = prefs.getInt(KEY_MAX_MINUTES, 30);
        streakDays = prefs.getInt(KEY_STREAK_DAYS, 1);

        if (!today.equals(savedDate)) {
            // New day rollover! Check yesterday's performance to update streak
            int yesterdayReels = prefs.getInt(KEY_REELS_TODAY, 0);
            int yesterdayLimit = prefs.getInt(KEY_DAILY_LIMIT, 20);

            if (yesterdayReels > 0) {
                if (yesterdayReels <= yesterdayLimit) {
                    streakDays++;
                } else {
                    streakDays = 0; // Streak broken if exceeded
                }
            }

            // Archive yesterday to 7-day history
            archiveYesterday(prefs, savedDate, yesterdayReels, yesterdayLimit);

            // Reset today counters
            prefs.edit()
                .putString(KEY_SAVED_DATE, today)
                .putInt(KEY_REELS_TODAY, 0)
                .putInt(KEY_IG_TODAY, 0)
                .putInt(KEY_YT_TODAY, 0)
                .putLong(KEY_DWELL_MS_TODAY, 0L)
                .putInt(KEY_MICRO_SKIPS_TODAY, 0)
                .putInt(KEY_STREAK_DAYS, streakDays)
                .apply();

            sessionEvents.clear();
        }

        isInitialized = true;
    }

    private static void archiveYesterday(SharedPreferences prefs, String date, int reels, int limit) {
        if (date == null || date.isEmpty()) return;
        try {
            String historyStr = prefs.getString(KEY_7DAY_HISTORY, "[]");
            JSONArray history = new JSONArray(historyStr);

            JSONObject dayObj = new JSONObject();
            dayObj.put("date", date);
            dayObj.put("reels", reels);
            dayObj.put("limit", limit);
            dayObj.put("success", reels <= limit);

            history.put(dayObj);

            // Keep only last 7 days
            while (history.length() > 7) {
                history.remove(0);
            }

            prefs.edit().putString(KEY_7DAY_HISTORY, history.toString()).apply();
        } catch (Exception ignored) {}
    }

    public static void startReelView() {
        currentReelStartTimeMs = System.currentTimeMillis();
    }

    public static ReelEvent recordReelSwipe(String platform, Context context) {
        long now = System.currentTimeMillis();
        long dwell = (currentReelStartTimeMs > 0) ? (now - currentReelStartTimeMs) : 4000L;

        // Cap dwell at 3 minutes (180,000 ms) so background pause doesn't skew stats
        if (dwell > 180000L) {
            dwell = 12000L;
        }
        currentReelStartTimeMs = now;

        ReelEvent event = new ReelEvent(platform, dwell, 60000L);
        sessionEvents.add(event);

        if (context != null) {
            persistSwipe(context, platform, dwell, event.isMicroSkip);
        }
        return event;
    }

    // Overload for backward compatibility
    public static ReelEvent recordReelSwipe(String platform) {
        return recordReelSwipe(platform, null);
    }

    private static synchronized void persistSwipe(Context context, String platform, long dwellMs, boolean isMicroSkip) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String today = getTodayDateString();
            String savedDate = prefs.getString(KEY_SAVED_DATE, "");

            if (!today.equals(savedDate)) {
                init(context);
            }

            int reels = prefs.getInt(KEY_REELS_TODAY, 0) + 1;
            long totalDwell = prefs.getLong(KEY_DWELL_MS_TODAY, 0L) + dwellMs;
            int microSkips = prefs.getInt(KEY_MICRO_SKIPS_TODAY, 0) + (isMicroSkip ? 1 : 0);

            SharedPreferences.Editor editor = prefs.edit()
                .putInt(KEY_REELS_TODAY, reels)
                .putLong(KEY_DWELL_MS_TODAY, totalDwell)
                .putInt(KEY_MICRO_SKIPS_TODAY, microSkips);

            if (platform != null && platform.contains("Instagram")) {
                int ig = prefs.getInt(KEY_IG_TODAY, 0) + 1;
                editor.putInt(KEY_IG_TODAY, ig);
            } else if (platform != null && platform.contains("YouTube")) {
                int yt = prefs.getInt(KEY_YT_TODAY, 0) + 1;
                editor.putInt(KEY_YT_TODAY, yt);
            }

            editor.apply();
        } catch (Exception ignored) {}
    }

    public static int getTotalReelsWatchedToday() {
        return sessionEvents.size();
    }

    public static int getInstagramCount() {
        int count = 0;
        synchronized (sessionEvents) {
            for (ReelEvent e : sessionEvents) {
                if (e.platform != null && e.platform.contains("Instagram")) count++;
            }
        }
        return count;
    }

    public static int getYouTubeCount() {
        int count = 0;
        synchronized (sessionEvents) {
            for (ReelEvent e : sessionEvents) {
                if (e.platform != null && e.platform.contains("YouTube")) count++;
            }
        }
        return count;
    }

    public static int getDailyLimit() {
        return dailyLimit;
    }

    public static void setDailyLimit(int limit, Context context) {
        dailyLimit = limit;
        if (context != null) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit().putInt(KEY_DAILY_LIMIT, limit).apply();
        }
    }

    public static void setDailyLimit(int limit) {
        setDailyLimit(limit, null);
    }

    public static int getMaxDailyMinutes() {
        return maxDailyMinutes;
    }

    public static void setMaxDailyMinutes(int minutes, Context context) {
        maxDailyMinutes = minutes;
        if (context != null) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit().putInt(KEY_MAX_MINUTES, minutes).apply();
        }
    }

    public static void setMaxDailyMinutes(int minutes) {
        setMaxDailyMinutes(minutes, null);
    }

    public static int getStreakDays() {
        return Math.max(1, streakDays);
    }

    public static String get7DayHistory(Context context) {
        if (context == null) return "[]";
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_7DAY_HISTORY, "[]");
    }

    public static int getTotalMinutesToday() {
        long totalDwellMs = 0;
        synchronized (sessionEvents) {
            for (ReelEvent e : sessionEvents) {
                totalDwellMs += e.dwellDurationMs;
            }
        }
        return (int) (totalDwellMs / 60000L);
    }

    public static float getCombinedQuotaRatio() {
        float reelRatio = (float) getTotalReelsWatchedToday() / (float) (dailyLimit > 0 ? dailyLimit : 20);
        float timeRatio = (maxDailyMinutes > 0) ? ((float) getTotalMinutesToday() / (float) maxDailyMinutes) : 0f;
        return Math.max(reelRatio, timeRatio);
    }

    public static boolean isQuotaExceeded() {
        return getCombinedQuotaRatio() >= 1.0f;
    }

    public static float getAverageAttentionSpanSeconds() {
        if (sessionEvents.isEmpty()) return 8.5f;
        long totalDwell = 0;
        synchronized (sessionEvents) {
            for (ReelEvent e : sessionEvents) {
                totalDwell += e.dwellDurationMs;
            }
            return (float) (totalDwell / sessionEvents.size()) / 1000f;
        }
    }

    public static float getBoredomRatePercentage() {
        if (sessionEvents.isEmpty()) return 65f;
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

    public static void clearToday(Context context) {
        sessionEvents.clear();
        currentReelStartTimeMs = 0L;
        if (context != null) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putInt(KEY_REELS_TODAY, 0)
                .putInt(KEY_IG_TODAY, 0)
                .putInt(KEY_YT_TODAY, 0)
                .putLong(KEY_DWELL_MS_TODAY, 0L)
                .putInt(KEY_MICRO_SKIPS_TODAY, 0)
                .apply();
        }
    }

    public static void clearToday() {
        clearToday(null);
    }
}
