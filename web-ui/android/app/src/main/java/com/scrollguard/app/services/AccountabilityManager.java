package com.scrollguard.app.services;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.telephony.SmsManager;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class AccountabilityManager {

    private static final String TAG = "AccountabilityManager";
    private static final String PREFS_NAME = "neuroguard_prefs";
    private static final String KEY_PARTNERS_JSON = "partners_json";
    private static final String KEY_LAST_SENT = "last_alert_time";

    public static class PartnerContact {
        public String id;
        public String name;
        public String phone;
        public String role;
        public boolean selected;
        public String customTemplate;

        public PartnerContact(String id, String name, String phone, String role, boolean selected, String customTemplate) {
            this.id = id;
            this.name = name;
            this.phone = phone;
            this.role = role;
            this.selected = selected;
            this.customTemplate = customTemplate;
        }
    }

    private final Context context;
    private final SharedPreferences prefs;

    public AccountabilityManager(Context context) {
        this.context = context.getApplicationContext();
        this.prefs = this.context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public synchronized void savePartners(String jsonString) {
        prefs.edit().putString(KEY_PARTNERS_JSON, jsonString).apply();
    }

    public synchronized String getPartnersJson() {
        String saved = prefs.getString(KEY_PARTNERS_JSON, null);
        if (saved != null && !saved.trim().isEmpty()) {
            return saved;
        }
        // Default list with Parents and Best Friend
        return "[{\"id\":\"partner_1\",\"name\":\"Sarah (Mom)\",\"phone\":\"+15553829014\",\"role\":\"Parent\",\"relationshipTag\":\"Mom\",\"selected\":true,\"customTemplate\":\"\"},"
             + "{\"id\":\"partner_2\",\"name\":\"Alex (Best Friend)\",\"phone\":\"+15559876543\",\"role\":\"Best Friend\",\"relationshipTag\":\"Friend\",\"selected\":true,\"customTemplate\":\"\"},"
             + "{\"id\":\"partner_3\",\"name\":\"Dad\",\"phone\":\"\",\"role\":\"Parent\",\"relationshipTag\":\"Dad\",\"selected\":false,\"customTemplate\":\"\"}]";
    }

    public List<PartnerContact> getSelectedPartners() {
        List<PartnerContact> list = new ArrayList<>();
        try {
            JSONArray arr = new JSONArray(getPartnersJson());
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                boolean selected = obj.optBoolean("selected", true);
                if (selected) {
                    list.add(new PartnerContact(
                        obj.optString("id", String.valueOf(i)),
                        obj.optString("name", "Friend"),
                        obj.optString("phone", ""),
                        obj.optString("role", "Friend"),
                        true,
                        obj.optString("customTemplate", "")
                    ));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing partners JSON: " + e.getMessage());
        }
        return list;
    }

    public void checkAndTriggerAlertIfLimitReached() {
        if (!AttentionSpanEngine.isQuotaExceeded()) return;

        int watched = AttentionSpanEngine.getTotalReelsWatchedToday();
        int limit = AttentionSpanEngine.getDailyLimit();
        long now = System.currentTimeMillis();
        long lastSent = prefs.getLong(KEY_LAST_SENT, 0L);

        // 3-hour cool-down debounce
        if (now - lastSent < (3 * 3600 * 1000L)) {
            Log.d(TAG, "Alert was dispatched recently. Skipping debounce.");
            return;
        }

        prefs.edit().putLong(KEY_LAST_SENT, now).apply();
        dispatchAlert(watched, limit);
    }

    public void dispatchAlert(int watched, int limit) {
        List<PartnerContact> selected = getSelectedPartners();
        if (selected.isEmpty()) {
            Log.w(TAG, "No accountability partners selected to receive alert.");
            return;
        }

        float avgSpan = AttentionSpanEngine.getAverageAttentionSpanSeconds();
        float boredom = AttentionSpanEngine.getBoredomRatePercentage();
        int igCount = AttentionSpanEngine.getInstagramCount();
        int ytCount = AttentionSpanEngine.getYouTubeCount();

        for (PartnerContact partner : selected) {
            if (partner.phone == null || partner.phone.trim().isEmpty()) {
                Log.w(TAG, "Skipping partner " + partner.name + " (empty phone number)");
                continue;
            }

            String message;
            if (partner.customTemplate != null && !partner.customTemplate.trim().isEmpty()) {
                message = partner.customTemplate
                    .replace("{user}", "Your partner")
                    .replace("{limit}", String.valueOf(limit))
                    .replace("{watched}", String.valueOf(watched))
                    .replace("{avg_span}", String.format("%.1f", avgSpan))
                    .replace("{boredom_pct}", String.format("%.0f", boredom));
            } else {
                message = String.format(
                    "🚨 NeuroGuard Alert: Your partner reached their limit of %d reels (%d watched today: %d IG, %d YT). Avg attention span: %.1fs (%.0f%% boredom skips). Please call to check in!",
                    limit, watched, igCount, ytCount, avgSpan, boredom
                );
            }

            Log.i(TAG, "Dispatching alert to " + partner.name + " (" + partner.role + ") at " + partner.phone);

            // 1. Direct Cellular SMS via SmsManager
            try {
                SmsManager smsManager;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    smsManager = context.getSystemService(SmsManager.class);
                } else {
                    smsManager = SmsManager.getDefault();
                }

                if (smsManager != null) {
                    ArrayList<String> parts = smsManager.divideMessage(message);
                    smsManager.sendMultipartTextMessage(partner.phone, null, parts, null, null);
                    Log.i(TAG, "SMS successfully dispatched to " + partner.name);
                }
            } catch (Exception e) {
                Log.e(TAG, "SMS failed for " + partner.name + ": " + e.getMessage());
            }

            // 2. Cloud Webhook dispatch (Background Thread)
            final String finalMsg = message;
            new Thread(() -> {
                try {
                    URL url = new URL("http://127.0.0.1:3001/api/accountability/alert");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(5000);
                    conn.setReadTimeout(5000);

                    String json = String.format(
                        "{\"partnerName\":\"%s\",\"partnerPhone\":\"%s\",\"partnerRole\":\"%s\",\"totalWatched\":%d,\"dailyLimit\":%d,\"averageAttentionSpanSec\":%.1f,\"boredomRate\":%.0f,\"message\":\"%s\"}",
                        partner.name, partner.phone, partner.role, watched, limit, avgSpan, boredom, finalMsg.replace("\"", "\\\"")
                    );

                    try (OutputStream os = conn.getOutputStream()) {
                        os.write(json.getBytes(StandardCharsets.UTF_8));
                    }

                    int code = conn.getResponseCode();
                    Log.i(TAG, "Webhook code for " + partner.name + ": " + code);
                    conn.disconnect();
                } catch (Exception e) {
                    // Local server optional
                }
            }).start();
        }
    }
}
