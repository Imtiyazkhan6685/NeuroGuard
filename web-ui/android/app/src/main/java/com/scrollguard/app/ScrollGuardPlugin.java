package com.scrollguard.app;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.scrollguard.app.services.AccountabilityManager;
import com.scrollguard.app.services.AttentionSpanEngine;
import com.scrollguard.app.services.FloatingHudService;
import com.scrollguard.app.services.ReelAccessibilityService;

@CapacitorPlugin(
    name = "ScrollGuard"
)
public class ScrollGuardPlugin extends Plugin {

    private AccountabilityManager accountabilityManager;

    @Override
    public void load() {
        super.load();
        accountabilityManager = new AccountabilityManager(getContext());
    }

    private boolean isAccessibilityServiceEnabled() {
        try {
            Context context = getContext();
            String enabledServices = Settings.Secure.getString(
                context.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            );
            if (enabledServices == null) return false;
            return enabledServices.contains(context.getPackageName());
        } catch (Exception e) {
            return false;
        }
    }

    @PluginMethod
    public void getNativeStats(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("reelsWatched", AttentionSpanEngine.getTotalReelsWatchedToday());
        ret.put("instagramCount", AttentionSpanEngine.getInstagramCount());
        ret.put("youtubeCount", AttentionSpanEngine.getYouTubeCount());
        ret.put("dailyLimit", AttentionSpanEngine.getDailyLimit());
        ret.put("avgAttentionSpan", AttentionSpanEngine.getAverageAttentionSpanSeconds());
        ret.put("boredomRate", AttentionSpanEngine.getBoredomRatePercentage());
        ret.put("microSkips", AttentionSpanEngine.getMicroSkipsCount());

        boolean canOverlay = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            canOverlay = Settings.canDrawOverlays(getContext());
        }
        ret.put("hasOverlayPermission", canOverlay);
        ret.put("hasAccessibilityPermission", isAccessibilityServiceEnabled());
        ret.put("hasSmsPermission", true);

        ret.put("partnersJson", accountabilityManager.getPartnersJson());

        call.resolve(ret);
    }

    @PluginMethod
    public void requestOverlayPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(getContext())) {
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getContext().getPackageName())
                );
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void requestAccessibilityPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void toggleFloatingHud(PluginCall call) {
        Boolean show = call.getBoolean("show");
        boolean shouldShow = (show != null) ? show : true;
        Intent intent = new Intent(getContext(), FloatingHudService.class);
        intent.setAction(shouldShow ? FloatingHudService.ACTION_SHOW : FloatingHudService.ACTION_HIDE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void savePartners(PluginCall call) {
        String json = call.getString("partnersJson");
        if (json != null) {
            accountabilityManager.savePartners(json);
        }
        call.resolve();
    }

    @PluginMethod
    public void getPartners(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("partnersJson", accountabilityManager.getPartnersJson());
        call.resolve(ret);
    }

    @PluginMethod
    public void triggerTestAlert(PluginCall call) {
        accountabilityManager.dispatchAlert(
            AttentionSpanEngine.getTotalReelsWatchedToday(),
            AttentionSpanEngine.getDailyLimit()
        );
        call.resolve();
    }

    @PluginMethod
    public void setDailyLimit(PluginCall call) {
        Integer limit = call.getInt("limit");
        AttentionSpanEngine.setDailyLimit(limit != null ? limit : 20);
        call.resolve();
    }

    @PluginMethod
    public void recordSimulatedSwipe(PluginCall call) {
        String platform = call.getString("platform");
        if (platform == null) platform = "Instagram Reels";

        AttentionSpanEngine.recordReelSwipe(platform);

        // Update floating HUD if attached
        Intent updateIntent = new Intent(getContext(), FloatingHudService.class);
        updateIntent.setAction(FloatingHudService.ACTION_UPDATE_COUNT);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(updateIntent);
            } else {
                getContext().startService(updateIntent);
            }
        } catch (Exception ignored) {}

        accountabilityManager.checkAndTriggerAlertIfLimitReached();
        call.resolve();
    }

    @PluginMethod
    public void openSmsIntent(PluginCall call) {
        String phone = call.getString("phone");
        String message = call.getString("message");
        try {
            Intent intent = new Intent(Intent.ACTION_SENDTO);
            intent.setData(Uri.parse("smsto:" + (phone != null ? phone : "")));
            if (message != null) {
                intent.putExtra("sms_body", message);
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open SMS app: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openWhatsAppIntent(PluginCall call) {
        String phone = call.getString("phone");
        String message = call.getString("message");
        try {
            String cleanPhone = (phone != null) ? phone.replaceAll("[^0-9]", "") : "";
            String encodedMsg = (message != null) ? java.net.URLEncoder.encode(message, "UTF-8") : "";
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://api.whatsapp.com/send?phone=" + cleanPhone + "&text=" + encodedMsg));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open WhatsApp: " + e.getMessage());
        }
    }
}
