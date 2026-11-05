package com.scrollguard.app.services

import android.content.Context
import android.telephony.SmsManager
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * AccountabilityManager monitors when the user crosses their daily quota of Reels/Shorts.
 * 
 * As requested: "as soon as they reach their daily limit an Message will be triggered 
 * to their selected person for example their parents or bestfriend so it will be like 
 * an accountability thing to stop doom scrolling."
 */
class AccountabilityManager(private val context: Context) {

    companion object {
        private const val TAG = "AccountabilityManager"
        private const val PREFS_NAME = "neuroguard_accountability"
        private const val KEY_PARTNER_NAME = "partner_name"
        private const val KEY_PARTNER_PHONE = "partner_phone"
        private const val KEY_PARTNER_ROLE = "partner_role"
        private const val KEY_MESSAGE_TEMPLATE = "message_template"
        private const val KEY_LAST_ALERT_TIMESTAMP = "last_alert_timestamp"
        private const val KEY_WEBHOOK_URL = "webhook_url"
    }

    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    fun savePartnerConfig(
        name: String,
        phone: String,
        role: String,
        customTemplate: String? = null,
        webhookUrl: String? = null
    ) {
        prefs.edit()
            .putString(KEY_PARTNER_NAME, name)
            .putString(KEY_PARTNER_PHONE, phone)
            .putString(KEY_PARTNER_ROLE, role)
            .putString(KEY_MESSAGE_TEMPLATE, customTemplate)
            .putString(KEY_WEBHOOK_URL, webhookUrl)
            .apply()
    }

    fun getPartnerName(): String = prefs.getString(KEY_PARTNER_NAME, "Mom / Best Friend") ?: "Partner"
    fun getPartnerPhone(): String = prefs.getString(KEY_PARTNER_PHONE, "") ?: ""
    fun getPartnerRole(): String = prefs.getString(KEY_PARTNER_ROLE, "Parent") ?: "Parent"
    fun getWebhookUrl(): String = prefs.getString(KEY_WEBHOOK_URL, "") ?: ""

    /**
     * Checks if limit was crossed, and dispatches message if not already alerted today.
     */
    fun checkAndTriggerAlertIfLimitReached() {
        val totalWatched = AttentionSpanEngine.getTotalReelsWatchedToday()
        val limit = AttentionSpanEngine.getDailyLimit()

        if (totalWatched < limit) return

        val lastAlertTime = prefs.getLong(KEY_LAST_ALERT_TIMESTAMP, 0L)
        val now = System.currentTimeMillis()

        // 6-hour debounce cooldown to prevent message flooding
        if (now - lastAlertTime < TimeUnit.HOURS.toMillis(6)) {
            Log.d(TAG, "Accountability alert already sent recently. Skipping debounce.")
            return
        }

        // Trigger the accountability alert!
        prefs.edit().putLong(KEY_LAST_ALERT_TIMESTAMP, now).apply()
        dispatchAccountabilityMessage(totalWatched, limit)
    }

    private fun dispatchAccountabilityMessage(totalWatched: Int, limit: Int) {
        val partnerPhone = getPartnerPhone()
        val partnerName = getPartnerName()
        val avgAttention = String.format("%.1f", AttentionSpanEngine.getAverageAttentionSpanSeconds())
        val boredomRate = String.format("%.0f", AttentionSpanEngine.getBoredomRatePercentage())

        val messageBody = prefs.getString(KEY_MESSAGE_TEMPLATE, null)?.takeIf { it.isNotBlank() }
            ?: "🚨 NeuroGuard Alert: Your accountability partner exceeded their daily limit of $limit Reels/Shorts ($totalWatched watched today). Their average attention span dropped to $avgAttention seconds ($boredomRate% skipped out of boredom). Please check in with them!"

        Log.i(TAG, "Triggering Accountability Alert to $partnerName ($partnerPhone): $messageBody")

        // 1. Direct Android SMS Dispatch via SmsManager
        if (partnerPhone.isNotBlank()) {
            try {
                val smsManager = SmsManager.getDefault()
                val parts = smsManager.divideMessage(messageBody)
                smsManager.sendMultipartTextMessage(partnerPhone, null, parts, null, null)
                Log.i(TAG, "SMS successfully dispatched to $partnerPhone")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send SMS directly: ${e.message}", e)
            }
        }

        // 2. Cloud Webhook / WhatsApp API notification
        val webhookUrl = getWebhookUrl()
        if (webhookUrl.isNotBlank()) {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val payload = JSONObject().apply {
                        put("partnerName", partnerName)
                        put("partnerPhone", partnerPhone)
                        put("totalWatched", totalWatched)
                        put("dailyLimit", limit)
                        put("averageAttentionSpanSec", avgAttention)
                        put("boredomRate", boredomRate)
                        put("message", messageBody)
                        put("timestamp", System.currentTimeMillis())
                    }

                    val requestBody = payload.toString().toRequestBody("application/json".toMediaType())
                    val request = Request.Builder()
                        .url(webhookUrl)
                        .post(requestBody)
                        .build()

                    httpClient.newCall(request).execute().use { response ->
                        Log.i(TAG, "Webhook response: ${response.code}")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Webhook delivery failed: ${e.message}")
                }
            }
        }
    }
}
