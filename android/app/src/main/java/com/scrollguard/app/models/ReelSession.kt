package com.scrollguard.app.models

data class ReelViewEvent(
    val id: String = java.util.UUID.randomUUID().toString(),
    val platform: String, // "Instagram" or "YouTube"
    val timestamp: Long = System.currentTimeMillis(),
    val dwellDurationMs: Long,
    val estimatedLengthMs: Long = 60000L, // Baseline 60s short-form video
    val wasSkippedEarly: Boolean = dwellDurationMs < 10000L,
    val isMicroSkip: Boolean = dwellDurationMs < 3000L
) {
    /**
     * Boredom score from 0.0 (fully engaged) to 1.0 (swiped immediately).
     * If watched 5s of a 60s reel: 1 - (5000 / 60000) = 0.916 boredom index.
     */
    val boredomIndex: Float
        get() = (1f - (dwellDurationMs.toFloat() / estimatedLengthMs.toFloat()).coerceIn(0f, 1f))
}

data class DailyDoomscrollStats(
    val date: String,
    val totalReelsWatched: Int,
    val dailyLimit: Int,
    val totalTimeSpentMs: Long,
    val averageAttentionSpanSec: Float,
    val microSkipsCount: Int,
    val boredomRatePercentage: Float,
    val accountabilityMessageSent: Boolean
)
