package com.scrollguard.app.services;

import android.content.Context;
import android.content.SharedPreferences;
import android.telephony.SmsManager;
import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public class AccountabilityManager {

    private static final String TAG = "AccountabilityManager";
    private static final String PREFS_NAME = "neuroguard_prefs";
    private static final String KEY_PARTNER_NAME = "partner_name";
    private static final String KEY_PARTNER_PHONE = "partner_phone";
    private static final String KEY_PARTNER_ROLE = "partner_role";
    private static final String KEY_CUSTOM_MSG = "custom_msg";
    private static final String KEY_LAST_SENT = "last_alert_time";

    private final Context context;
    private final SharedPreferences prefs;

    public AccountabilityManager(Context context) {
        this.context = context.getApplicationContext();
        this.prefs = this.context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public void savePartner(String name, String phone, String role, String customMsg) {
        prefs.edit()
            .putString(KEY_PARTNER_NAME, name)
            .putString(KEY_PARTNER_PHONE, phone)
            .putString(KEY_PARTNER_ROLE, role)
            .putString(KEY_CUSTOM_MSG, customMsg)
            .apply();
    }

    public String getPartnerName() {
        return prefs.getString(KEY_PARTNER_NAME, "Sarah (Mom)");
    }

    public String getPartnerPhone() {
        return prefs.getString(KEY_PARTNER_PHONE, "+15553829014");
    }

    public String getPartnerRole() {
        return prefs.getString(KEY_PARTNER_ROLE, "Parent");
    }

    public void checkAndTriggerAlertIfLimitReached() {
        int watched = AttentionSpanEngine.getTotalReelsWatchedToday();
        int limit = AttentionSpanEngine.getDailyLimit();

        if (watched < limit) return;

        long now = System.currentTimeMillis();
        long lastSent = prefs.getLong(KEY_LAST_SENT, 0L);

        // 6-hour cool-down debounce
        if (now - lastSent < (6 * 3600 * 1000L)) {
            Log.d(TAG, "Alert was dispatched recently. Skipping debounce.");
            return;
        }

        prefs.edit().putLong(KEY_LAST_SENT, now).apply();
        dispatchAlert(watched, limit);
    }

    public void dispatchAlert(int watched, int limit) {
        String phone = getPartnerPhone();
        String name = getPartnerName();
        float avgSpan = AttentionSpanEngine.getAverageAttentionSpanSeconds();
        float boredom = AttentionSpanEngine.getBoredomRatePercentage();

        String message = String.format(
            "🚨 NeuroGuard Alert: Your partner just hit their daily limit of %d short-form reels (%d watched today). Average attention span was %.1fs (%.0f%% skipped out of boredom). Please call them!",
            limit, watched, avgSpan, boredom
        );

        Log.i(TAG, "Dispatching accountability alert to " + name + " (" + phone + ")");

        // 1. Direct Android SMS
        if (phone != null && !phone.trim().isEmpty()) {
            try {
                SmsManager smsManager = SmsManager.getDefault();
                ArrayList<String> parts = smsManager.divideMessage(message);
                smsManager.sendMultipartTextMessage(phone, null, parts, null, null);
                Log.i(TAG, "SMS successfully sent via SmsManager!");
            } catch (Exception e) {
                Log.e(TAG, "Direct SMS failed: " + e.getMessage());
            }
        }

        // 2. Cloud Webhook dispatch (Background Thread)
        new Thread(() -> {
            try {
                URL url = new URL("http://127.0.0.1:3001/api/accountability/alert");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(6000);
                conn.setReadTimeout(6000);

                String json = String.format(
                    "{\"partnerName\":\"%s\",\"partnerPhone\":\"%s\",\"partnerRole\":\"%s\",\"totalWatched\":%d,\"dailyLimit\":%d,\"averageAttentionSpanSec\":%.1f,\"boredomRate\":%.0f,\"message\":\"%s\"}",
                    name, phone, getPartnerRole(), watched, limit, avgSpan, boredom, message.replace("\"", "\\\"")
                );

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(json.getBytes(StandardCharsets.UTF_8));
                }

                int code = conn.getResponseCode();
                Log.i(TAG, "Webhook dispatched with HTTP code: " + code);
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Webhook exception: " + e.getMessage());
            }
        }).start();
    }
}
