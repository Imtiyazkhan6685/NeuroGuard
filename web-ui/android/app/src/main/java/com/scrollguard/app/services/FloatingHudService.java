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
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.core.app.NotificationCompat;
import com.scrollguard.app.MainActivity;
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
        AttentionSpanEngine.init(this);
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
            .setContentTitle("NeuroGuard Protection Active")
            .setContentText("Monitoring dopamine loops & screen focus")
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
        if (isHudAttached || hudView != null) {
            updateOverlayUi();
            return;
        }
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
        params.x = 30;
        params.y = 220;

        LayoutInflater inflater = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        hudView = inflater.inflate(R.layout.layout_floating_hud, null);

        tvReelCount = hudView.findViewById(R.id.tvReelCount);
        tvDwellTimer = hudView.findViewById(R.id.tvDwellTimer);
        tvAttentionBadge = hudView.findViewById(R.id.tvAttentionBadge);
        statusIndicator = hudView.findViewById(R.id.hudStatusIndicator);
        ImageView btnCollapse = hudView.findViewById(R.id.btnCollapse);

        // Draggable touch listener with tap-to-open and edge-snapping
        hudView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;
            private boolean isDragging = false;
            private static final int CLICK_THRESHOLD_PX = 15;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        isDragging = false;
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        float dx = event.getRawX() - initialTouchX;
                        float dy = event.getRawY() - initialTouchY;
                        if (Math.hypot(dx, dy) > CLICK_THRESHOLD_PX) {
                            isDragging = true;
                            params.x = initialX + (int) dx;
                            params.y = initialY + (int) dy;
                            if (windowManager != null && hudView != null) {
                                windowManager.updateViewLayout(hudView, params);
                            }
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                        if (!isDragging) {
                            // Check if collapse button was tapped
                            if (btnCollapse != null) {
                                int[] btnLoc = new int[2];
                                btnCollapse.getLocationOnScreen(btnLoc);
                                float touchX = event.getRawX();
                                float touchY = event.getRawY();
                                if (touchX >= btnLoc[0] && touchX <= btnLoc[0] + btnCollapse.getWidth() &&
                                    touchY >= btnLoc[1] && touchY <= btnLoc[1] + btnCollapse.getHeight()) {
                                    hideOverlay();
                                    return true;
                                }
                            }
                            // Tap on pill body opens NeuroGuard App Dashboard
                            launchMainActivity();
                        } else {
                            // Snap to nearest screen edge (left or right)
                            snapToNearestEdge(params);
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

    private void snapToNearestEdge(WindowManager.LayoutParams params) {
        if (windowManager == null || hudView == null) return;
        try {
            DisplayMetrics metrics = getResources().getDisplayMetrics();
            int screenWidth = metrics.widthPixels;
            int hudWidth = hudView.getWidth();
            if (hudWidth <= 0) hudWidth = 320;

            int centerX = params.x + (hudWidth / 2);
            if (centerX < screenWidth / 2) {
                params.x = 24; // Snap to left margin
            } else {
                params.x = screenWidth - hudWidth - 24; // Snap to right margin
            }

            // Keep Y within screen bounds
            params.y = Math.max(100, Math.min(params.y, metrics.heightPixels - 250));
            windowManager.updateViewLayout(hudView, params);
        } catch (Exception ignored) {}
    }

    private void launchMainActivity() {
        try {
            Intent appIntent = new Intent(this, MainActivity.class);
            appIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(appIntent);
        } catch (Exception e) {
            Log.e("FloatingHudService", "Failed to launch main activity: " + e.getMessage());
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
        int minutes = AttentionSpanEngine.getTotalMinutesToday();
        float ratio = AttentionSpanEngine.getCombinedQuotaRatio();

        if (tvReelCount != null) {
            tvReelCount.setText(String.format("%d/%d Reels • %dm", watched, limit, minutes));
        }

        if (statusIndicator != null) {
            if (ratio >= 1.0f) {
                statusIndicator.setBackgroundColor(Color.parseColor("#FF453A")); // Red (Exceeded)
            } else if (ratio >= 0.75f) {
                statusIndicator.setBackgroundColor(Color.parseColor("#FF9F0A")); // Amber (Warning)
            } else {
                statusIndicator.setBackgroundColor(Color.parseColor("#30D158")); // Green (Safe)
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
