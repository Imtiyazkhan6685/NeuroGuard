package com.scrollguard.app.services;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.core.app.NotificationCompat;
import com.scrollguard.app.R;

public class FloatingHudService extends Service {

    public static final String ACTION_SHOW = "com.scrollguard.app.ACTION_SHOW";
    public static final String ACTION_HIDE = "com.scrollguard.app.ACTION_HIDE";
    public static final String ACTION_UPDATE_COUNT = "com.scrollguard.app.ACTION_UPDATE_COUNT";
    private static final String CHANNEL_ID = "neuroguard_hud_channel";
    private static final int NOTIFICATION_ID = 1001;

    private WindowManager windowManager;
    private View hudView;
    private boolean isHudAttached = false;

    private TextView tvReelCount;
    private TextView tvDwellTimer;
    private TextView tvAttentionBadge;
    private View statusIndicator;

    private final Handler tickerHandler = new Handler(Looper.getMainLooper());
    private int currentReelElapsedSec = 0;

    private final Runnable tickerRunnable = new Runnable() {
        @Override
        public void run() {
            currentReelElapsedSec++;
            int min = currentReelElapsedSec / 60;
            int sec = currentReelElapsedSec % 60;
            if (tvDwellTimer != null) {
                tvDwellTimer.setText(String.format("%02d:%02ds", min, sec));
            }
            updateAttentionBadge(currentReelElapsedSec);
            tickerHandler.postDelayed(this, 1000);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        startForegroundServiceNotification();
        windowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
    }

    private void startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "NeuroGuard Active HUD",
                NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NeuroGuard Active")
            .setContentText("Monitoring doomscrolling & attention span")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_SHOW.equals(action)) {
                showOverlay();
            } else if (ACTION_HIDE.equals(action)) {
                hideOverlay();
            } else if (ACTION_UPDATE_COUNT.equals(action)) {
                currentReelElapsedSec = 0;
                updateOverlayUi();
            }
        }
        return START_STICKY;
    }

    @SuppressLint("ClickableViewAccessibility")
    private void showOverlay() {
        if (isHudAttached || hudView != null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !android.provider.Settings.canDrawOverlays(this)) {
            Log.w("FloatingHudService", "Overlay permission not granted. Cannot show HUD.");
            return;
        }

        int layoutType = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            : WindowManager.LayoutParams.TYPE_PHONE;

        final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 40;
        params.y = 200;

        LayoutInflater inflater = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        hudView = inflater.inflate(R.layout.layout_floating_hud, null);

        tvReelCount = hudView.findViewById(R.id.tvReelCount);
        tvDwellTimer = hudView.findViewById(R.id.tvDwellTimer);
        tvAttentionBadge = hudView.findViewById(R.id.tvAttentionBadge);
        statusIndicator = hudView.findViewById(R.id.hudStatusIndicator);
        ImageView btnCollapse = hudView.findViewById(R.id.btnCollapse);

        if (btnCollapse != null) {
            btnCollapse.setOnClickListener(v -> hideOverlay());
        }

        // Draggable touch listener
        hudView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        if (windowManager != null && hudView != null) {
                            windowManager.updateViewLayout(hudView, params);
                        }
                        return true;
                }
                return false;
            }
        });

        try {
            windowManager.addView(hudView, params);
            isHudAttached = true;
            currentReelElapsedSec = 0;
            tickerHandler.post(tickerRunnable);
            updateOverlayUi();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void hideOverlay() {
        if (!isHudAttached || hudView == null) return;
        try {
            tickerHandler.removeCallbacks(tickerRunnable);
            windowManager.removeView(hudView);
            hudView = null;
            isHudAttached = false;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void updateOverlayUi() {
        int watched = AttentionSpanEngine.getTotalReelsWatchedToday();
        int limit = AttentionSpanEngine.getDailyLimit();

        if (tvReelCount != null) {
            tvReelCount.setText(watched + " / " + limit + " Reels");
        }

        if (statusIndicator != null) {
            if (watched >= limit) {
                statusIndicator.setBackgroundColor(Color.parseColor("#FF453A")); // Red
            } else if ((float) watched / limit >= 0.75f) {
                statusIndicator.setBackgroundColor(Color.parseColor("#FF9F0A")); // Amber
            } else {
                statusIndicator.setBackgroundColor(Color.parseColor("#30D158")); // Green
            }
        }
    }

    private void updateAttentionBadge(int seconds) {
        if (tvAttentionBadge == null) return;
        if (seconds < 3) {
            tvAttentionBadge.setText("⚡ Impulsive");
            tvAttentionBadge.setTextColor(Color.parseColor("#FF453A"));
        } else if (seconds <= 10) {
            tvAttentionBadge.setText("🥱 Boredom Skip");
            tvAttentionBadge.setTextColor(Color.parseColor("#FF9F0A"));
        } else if (seconds <= 25) {
            tvAttentionBadge.setText("👀 Mid Attention");
            tvAttentionBadge.setTextColor(Color.parseColor("#0A84FF"));
        } else {
            tvAttentionBadge.setText("🧠 Deep Focus");
            tvAttentionBadge.setTextColor(Color.parseColor("#30D158"));
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        hideOverlay();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
