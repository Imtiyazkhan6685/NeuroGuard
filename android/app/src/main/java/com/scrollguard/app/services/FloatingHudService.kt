package com.scrollguard.app.services

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.scrollguard.app.R

/**
 * FloatingHudService draws a sleek, non-intrusive floating pill HUD
 * on top of Instagram Reels and YouTube Shorts.
 * 
 * Displays:
 * 1. Current Reel count vs daily limit (e.g. 14 / 25).
 * 2. Live dwell stopwatch for current reel (00:07s).
 * 3. Real-time cognitive attention indicator.
 * 4. Touch-and-drag snapping to screen edges.
 */
class FloatingHudService : Service() {

    companion object {
        const val ACTION_SHOW = "com.scrollguard.app.ACTION_SHOW"
        const val ACTION_HIDE = "com.scrollguard.app.ACTION_HIDE"
        const val ACTION_UPDATE_COUNT = "com.scrollguard.app.ACTION_UPDATE_COUNT"
        private const val CHANNEL_ID = "neuroguard_hud_channel"
        private const val NOTIFICATION_ID = 1001
    }

    private var windowManager: WindowManager? = null
    private var hudView: View? = null
    private var isHudAttached = false

    private var tvReelCount: TextView? = null
    private var tvDwellTimer: TextView? = null
    private var tvAttentionBadge: TextView? = null
    private var statusIndicator: View? = null

    private val tickerHandler = Handler(Looper.getMainLooper())
    private var currentReelElapsedSec = 0

    private val tickerRunnable = object : Runnable {
        override fun run() {
            currentReelElapsedSec++
            val min = currentReelElapsedSec / 60
            val sec = currentReelElapsedSec % 60
            tvDwellTimer?.text = String.format("%02d:%02ds", min, sec)

            // Update dynamic attention badge based on dwell time
            updateAttentionBadge(currentReelElapsedSec)

            tickerHandler.postDelayed(this, 1000)
        }
    }

    override fun onCreate() {
        super.onCreate()
        startForegroundNotification()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    }

    private fun startForegroundNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "NeuroGuard Active HUD",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live status while monitoring Reels/Shorts"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NeuroGuard Active")
            .setContentText("Monitoring doomscroll reels & attention span")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SHOW -> showOverlay()
            ACTION_HIDE -> hideOverlay()
            ACTION_UPDATE_COUNT -> {
                currentReelElapsedSec = 0 // Reset dwell timer for the new reel
                updateOverlayUi()
            }
        }
        return START_STICKY
    }

    @SuppressLint("ClickableViewAccessibility", "InflateParams")
    private fun showOverlay() {
        if (isHudAttached || hudView != null) return

        val layoutParamsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutParamsType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 40
            y = 180
        }

        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        hudView = inflater.inflate(R.layout.layout_floating_hud, null)

        tvReelCount = hudView?.findViewById(R.id.tvReelCount)
        tvDwellTimer = hudView?.findViewById(R.id.tvDwellTimer)
        tvAttentionBadge = hudView?.findViewById(R.id.tvAttentionBadge)
        statusIndicator = hudView?.findViewById(R.id.hudStatusIndicator)
        val btnCollapse = hudView?.findViewById<ImageView>(R.id.btnCollapse)

        btnCollapse?.setOnClickListener {
            hideOverlay()
        }

        // Draggable touch handling with smooth screen coordinate updates
        hudView?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                if (event == null) return false
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager?.updateViewLayout(hudView, params)
                        return true
                    }
                }
                return false
            }
        })

        try {
            windowManager?.addView(hudView, params)
            isHudAttached = true
            currentReelElapsedSec = 0
            tickerHandler.post(tickerRunnable)
            updateOverlayUi()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun hideOverlay() {
        if (!isHudAttached || hudView == null) return
        try {
            tickerHandler.removeCallbacks(tickerRunnable)
            windowManager?.removeView(hudView)
            hudView = null
            isHudAttached = false
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun updateOverlayUi() {
        val totalWatched = AttentionSpanEngine.getTotalReelsWatchedToday()
        val limit = AttentionSpanEngine.getDailyLimit()

        tvReelCount?.text = "$totalWatched / $limit Reels"

        // Color coding indicator based on quota consumption
        val ratio = totalWatched.toFloat() / limit.coerceAtLeast(1).toFloat()
        when {
            ratio >= 1.0f -> {
                statusIndicator?.setBackgroundColor(Color.parseColor("#FF453A")) // Red limit reached
                tvReelCount?.setTextColor(Color.parseColor("#FF453A"))
            }
            ratio >= 0.75f -> {
                statusIndicator?.setBackgroundColor(Color.parseColor("#FF9F0A")) // Amber warning
                tvReelCount?.setTextColor(Color.parseColor("#FF9F0A"))
            }
            else -> {
                statusIndicator?.setBackgroundColor(Color.parseColor("#30D158")) // Healthy green
                tvReelCount?.setTextColor(Color.parseColor("#F2F2F7"))
            }
        }
    }

    private fun updateAttentionBadge(seconds: Int) {
        when {
            seconds < 3 -> {
                tvAttentionBadge?.text = "⚡ Impulsive"
                tvAttentionBadge?.setTextColor(Color.parseColor("#FF453A"))
            }
            seconds in 3..10 -> {
                tvAttentionBadge?.text = "🥱 Boredom Drop"
                tvAttentionBadge?.setTextColor(Color.parseColor("#FF9F0A"))
            }
            seconds in 11..25 -> {
                tvAttentionBadge?.text = "👀 Mid Attention"
                tvAttentionBadge?.setTextColor(Color.parseColor("#0A84FF"))
            }
            else -> {
                tvAttentionBadge?.text = "🧠 Deep Focus"
                tvAttentionBadge?.setTextColor(Color.parseColor("#30D158"))
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        hideOverlay()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
