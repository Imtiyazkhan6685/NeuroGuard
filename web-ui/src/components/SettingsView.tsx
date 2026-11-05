import React from 'react';
import { useApp } from '../context/AppContext';
import { requestAndroidOverlayPermission, requestAndroidAccessibility, toggleAndroidFloatingHud } from '../lib/nativeBridge';
import { Sliders, Eye, Lock, RotateCcw, Smartphone, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToday, events, nativeStats } = useApp();

  return (
    <div className="space-y-6 pb-28 text-white select-none">
      {/* Title */}
      <div>
        <span className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">Configuration</span>
        <h1 className="text-3xl font-black text-white tracking-tight mt-0.5">Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Adjust daily reel thresholds, floating corner widget, and hardware detection.
        </p>
      </div>

      {/* Daily Limits Section */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center space-x-2 text-[#FA114F]">
          <Sliders className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Daily Quota Targets</span>
        </div>

        {/* Reel Count Limit Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300">Daily Reels & Shorts Target</span>
            <span className="text-lg font-black text-[#FA114F] font-mono">
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
            className="w-full accent-[#FA114F] h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
            <span>5 Strict</span>
            <span>20 Standard</span>
            <span>60 Relaxed</span>
          </div>
        </div>

        {/* Max Minutes Slider */}
        <div className="pt-3 border-t border-white/[0.06] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300">Max Active Doomscroll Time</span>
            <span className="text-lg font-black text-[#00F0FF] font-mono">
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
            className="w-full accent-[#00F0FF] h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Floating HUD Widget Settings */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 space-y-4 shadow-2xl">
        <div className="flex items-center space-x-2 text-[#30D158]">
          <Eye className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Floating Corner Pill</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[75%]">
            <span className="text-sm font-bold text-white">Enable Corner Floating Pill</span>
            <p className="text-xs text-zinc-400">
              Draggable widget that counts Instagram and YouTube swipes even when this app is closed.
            </p>
          </div>
          <button
            onClick={() => {
              const next = !settings.enableFloatingHud;
              updateSettings({ enableFloatingHud: next });
              toggleAndroidFloatingHud(next);
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${
              settings.enableFloatingHud ? 'bg-[#30D158] justify-end' : 'bg-zinc-800 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>
      </div>

      {/* System Hardware Permissions */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 space-y-3 shadow-2xl">
        <div className="flex items-center space-x-2 text-[#A8FF00]">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">System Permissions</span>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <button
            onClick={() => requestAndroidOverlayPermission()}
            className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-between text-left hover:border-white/20 transition-all"
          >
            <div>
              <div className="font-semibold text-white">1. Display Over Other Apps</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Allows corner pill to float over Instagram & YouTube</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          <button
            onClick={() => requestAndroidAccessibility()}
            className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-between text-left hover:border-white/20 transition-all"
          >
            <div>
              <div className="font-semibold text-white">2. Reel Accessibility Tracking</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Counts real Instagram & YouTube swipes automatically</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.04] text-[11px] text-zinc-400 leading-relaxed">
          <span className="text-amber-400 font-bold">Android 13/14/15 Notice:</span> If the accessibility toggle shows <span className="italic text-zinc-300">"Restricted setting"</span>, long-press NeuroGuard on your home screen ➔ tap <span className="text-white font-semibold">App info</span> ➔ tap <span className="text-white font-semibold">⋮ (3 dots)</span> at top right ➔ tap <span className="text-emerald-400 font-bold">Allow restricted settings</span>.
        </div>
      </div>

      {/* Reset Session Data */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 flex items-center justify-between shadow-2xl">
        <div className="space-y-0.5">
          <span className="text-sm font-bold text-white">Reset Today's Reel Counters</span>
          <p className="text-xs text-zinc-400">Clear today's {events.length} recorded reel views.</p>
        </div>
        <button
          onClick={resetToday}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 border border-white/10 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
