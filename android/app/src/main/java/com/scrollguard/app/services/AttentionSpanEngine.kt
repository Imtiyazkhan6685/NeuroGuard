package com.scrollguard.app.services

import com.scrollguard.app.models.ReelViewEvent
import java.util.concurrent.CopyOnWriteArrayList

/**
 * AttentionSpanEngine models user cognitive decay and short-form video consumption habits.
 * 
 * Specifically traces:
 * 1. Dwell Time per reel (how long user watches before getting bored and swiping).
 * 2. Attention Drop-off curve: For a 60-second reel, at what second mark does boredom spike?
 * 3. Compulsive Micro-skips: Quick swipes (< 3 seconds) indicating slot-machine dopamine behavior.
 */
object AttentionSpanEngine {

    private val sessionEvents = CopyOnWriteArrayList<ReelViewEvent>()
    var currentReelStartTimeMs: Long = 0L
    private var dailyLimit: Int = 25

    fun startReelView() {
        currentReelStartTimeMs = System.currentTimeMillis()
    }

    /**
     * Called whenever a user swipes away from a Reel or Short.
     */
    fun recordReelSwipe(platform: String, estimatedTotalDurationMs: Long = 60000L): ReelViewEvent {
        val now = System.currentTimeMillis()
        val dwellTime = if (currentReelStartTimeMs > 0) now - currentReelStartTimeMs else 4000L
        currentReelStartTimeMs = now // Reset for next reel

        val event = ReelViewEvent(
            platform = platform,
            timestamp = now,
            dwellDurationMs = dwellTime,
            estimatedLengthMs = estimatedTotalDurationMs,
            wasSkippedEarly = dwellTime < 12000L,
            isMicroSkip = dwellTime < 3000L
        )

        sessionEvents.add(event)
        return event
    }

    fun getTotalReelsWatchedToday(): Int {
        return sessionEvents.size
    }

    fun getDailyLimit(): Int = dailyLimit

    fun setDailyLimit(limit: Int) {
        dailyLimit = limit
    }

    /**
     * Calculates the true average attention span in seconds.
     */
    fun getAverageAttentionSpanSeconds(): Float {
        if (sessionEvents.isEmpty()) return 0f
        val totalDwell = sessionEvents.sumOf { it.dwellDurationMs }
        return (totalDwell / sessionEvents.size) / 1000f
    }

    /**
     * Boredom Rate: Percentage of reels skipped before 12 seconds.
     * Demonstrates how the user gets bored within seconds on 1-minute content.
     */
    fun getBoredomRatePercentage(): Float {
        if (sessionEvents.isEmpty()) return 0f
        val earlySkips = sessionEvents.count { it.wasSkippedEarly }
        return (earlySkips.toFloat() / sessionEvents.size.toFloat()) * 100f
    }

    /**
     * Micro-skips (< 3 seconds): compulsive slot-machine swipes.
     */
    fun getMicroSkipsCount(): Int {
        return sessionEvents.count { it.isMicroSkip }
    }

    /**
     * Generates a breakdown for charting:
     * - [0..3s]: Micro-skips (High impatience)
     * - [4..10s]: Boredom abandonment
     * - [11..30s]: Moderate attention
     * - [31..60s]: Full watch (High engagement)
     */
    fun getAttentionSpanBuckets(): Map<String, Int> {
        val buckets = mutableMapOf(
            "0-3s (Impulsive Skip)" to 0,
            "4-10s (Boredom Drop)" to 0,
            "11-30s (Mid Attention)" to 0,
            "30-60s+ (Full Watch)" to 0
        )

        for (event in sessionEvents) {
            val sec = event.dwellDurationMs / 1000
            when {
                sec <= 3 -> buckets["0-3s (Impulsive Skip)"] = buckets["0-3s (Impulsive Skip)"]!! + 1
                sec in 4..10 -> buckets["4-10s (Boredom Drop)"] = buckets["4-10s (Boredom Drop)"]!! + 1
                sec in 11..30 -> buckets["11-30s (Mid Attention)"] = buckets["11-30s (Mid Attention)"]!! + 1
                else -> buckets["30-60s+ (Full Watch)"] = buckets["30-60s+ (Full Watch)"]!! + 1
            }
        }
        return buckets
    }

    fun getAllEvents(): List<ReelViewEvent> = sessionEvents.toList()
    
    fun clearToday() {
        sessionEvents.clear()
        currentReelStartTimeMs = 0L
    }
}
