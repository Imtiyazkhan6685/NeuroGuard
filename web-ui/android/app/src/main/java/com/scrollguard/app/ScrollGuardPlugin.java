package com.scrollguard.app;

import android.Manifest;
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

@CapacitorPlugin(
    name = "ScrollGuard",
    permissions = {
        @Permission(strings = { Manifest.permission.SEND_SMS }, alias = "sms")
    }
)
public class ScrollGuardPlugin extends Plugin {

    private AccountabilityManager accountabilityManager;

    @Override
    public void load() {
        super.load();
        accountabilityManager = new AccountabilityManager(getContext());
    }

    @PluginMethod
    public void getNativeStats(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("reelsWatched", AttentionSpanEngine.getTotalReelsWatchedToday());
        ret.put("dailyLimit", AttentionSpanEngine.getDailyLimit());
        ret.put("avgAttentionSpan", AttentionSpanEngine.getAverageAttentionSpanSeconds());
        ret.put("boredomRate", AttentionSpanEngine.getBoredomRatePercentage());
        ret.put("microSkips", AttentionSpanEngine.getMicroSkipsCount());

        boolean canOverlay = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            canOverlay = Settings.canDrawOverlays(getContext());
        }
        ret.put("hasOverlayPermission", canOverlay);

        boolean hasSms = ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.SEND_SMS
        ) == PackageManager.PERMISSION_GRANTED;
        ret.put("hasSmsPermission", hasSms);

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
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void saveAccountabilityPartner(PluginCall call) {
        String name = call.getString("name");
        String phone = call.getString("phone");
        String role = call.getString("role");
        String customMsg = call.getString("customTemplate");

        accountabilityManager.savePartner(
            name != null ? name : "Mom",
            phone != null ? phone : "",
            role != null ? role : "Parent",
            customMsg != null ? customMsg : ""
        );
        call.resolve();
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
}
