import React from 'react';
import { useApp } from '../context/AppContext';
import { Sliders, Bell, Eye, Lock, RotateCcw, Smartphone, Shield, Info } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToday, events } = useApp();

  return (
    <div className="space-y-6 pb-28">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Preferences</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Limits & Enforcement</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Customize your daily thresholds, floating overlay behavior, and accountability triggers.
        </p>
      </div>

      {/* Daily Limits Section */}
      <div className="ios-glass rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-purple-400">
          <Sliders className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Daily Quotas</span>
        </div>

        {/* Reel Count Limit Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Daily Reel & Short Limit</span>
            <span className="text-base font-extrabold text-purple-400 font-mono">
              {settings.dailyReelLimit} Reels
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={settings.dailyReelLimit}
            onChange={(e) => updateSettings({ dailyReelLimit: parseInt(e.target.value) })}
            className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>5 Strict</span>
            <span>20 Balanced</span>
            <span>60 Relaxed</span>
          </div>
        </div>

        {/* Max Minutes */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Max Active Doomscroll Time</span>
            <span className="text-base font-extrabold text-blue-400 font-mono">
              {settings.maxDailyMinutes} mins
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={settings.maxDailyMinutes}
            onChange={(e) => updateSettings({ maxDailyMinutes: parseInt(e.target.value) })}
            className="w-full accent-blue-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Floating HUD & Hardware Toggles */}
      <div className="ios-glass-card rounded-3xl p-5 border border-white/10 space-y-3.5">
        <h2 className="text-sm font-bold text-white">Floating HUD & Behavior</h2>

        {/* Overlay toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 mt-0.5">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white">Floating Hover HUD</span>
              <p className="text-[10px] text-zinc-400">Pill overlay automatically mounts over Instagram & YouTube</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.enableFloatingHud}
            onChange={(e) => updateSettings({ enableFloatingHud: e.target.checked })}
            className="w-5 h-5 rounded accent-purple-500"
          />
        </div>

        {/* Lockout Mode */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white">Hard App Lockout</span>
              <p className="text-[10px] text-zinc-400">Forces Instagram/YouTube to close when quota is exceeded</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.hardLockoutAfterLimit}
            onChange={(e) => updateSettings({ hardLockoutAfterLimit: e.target.checked })}
            className="w-5 h-5 rounded accent-rose-500"
          />
        </div>
      </div>

      {/* Platform Architecture Note */}
      <div className="ios-glass-card rounded-3xl p-5 border border-white/10 space-y-2">
        <div className="flex items-center space-x-2 text-zinc-300">
          <Smartphone className="w-4 h-4 text-purple-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider">Platform Capabilities</h2>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          • <span className="font-semibold text-zinc-200">Android:</span> Fully runs the floating hover HUD via <code className="text-purple-300">SYSTEM_ALERT_WINDOW</code> and tracks reel swipes via <code className="text-purple-300">AccessibilityService</code>.<br/>
          • <span className="font-semibold text-zinc-200">iOS:</span> Apple's sandbox restricts floating overlays on top of other apps; Screen Time API shields aggregate usage.
        </p>
      </div>

      {/* Reset Session Data */}
      <div className="pt-2">
        <button
          onClick={resetToday}
          className="w-full py-3 px-4 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white font-medium text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Today's Reel Counter ({events.length} reels recorded)</span>
        </button>
      </div>
    </div>
  );
};
