import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  toggleAndroidFloatingHud,
  requestAndroidOverlayPermission,
  requestAndroidAccessibility,
  openAndroidAppDetails,
  recordNativeSwipe
} from '../lib/nativeBridge';
import {
  Flame,
  Zap,
  Clock,
  Brain,
  Users,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Crown,
  Eye,
  Check,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Play
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAnalytics: () => void;
  onOpenPartner: () => void;
  onOpenPro?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAnalytics,
  onOpenPartner,
  onOpenPro
}) => {
  const {
    events,
    totalReels,
    instagramCount,
    youtubeCount,
    totalMinutes,
    streakDays,
    selectedPartners,
    settings,
    nativeStats,
    syncNativeStats,
    isPro
  } = useApp();

  const [isWidgetActive, setIsWidgetActive] = useState(true);

  const reelsCount = totalReels;
  const limit = settings.dailyReelLimit || 20;
  const quotaPct = Math.min(100, Math.round((reelsCount / (limit || 1)) * 100));
  const isExceeded = reelsCount >= limit;

  // Minutes calculations
  const maxMinutes = settings.maxDailyMinutes || 30;
  const minutesPct = Math.min(100, Math.round((totalMinutes / maxMinutes) * 100));

  // Focus score & Attention span
  const avgAttentionSec = nativeStats?.avgAttentionSpan !== undefined
    ? nativeStats.avgAttentionSpan.toFixed(1)
    : events.length > 0
    ? (events.reduce((a, c) => a + c.dwellDurationMs, 0) / events.length / 1000).toFixed(1)
    : '8.4';

  const mindfulReels = events.filter((e) => !e.wasSkippedEarly).length;
  const focusPct = events.length > 0 ? Math.round((mindfulReels / events.length) * 100) : 68;

  // System permissions state from native Android
  const hasOverlay = nativeStats?.hasOverlayPermission ?? false;
  const hasAccessibility = nativeStats?.hasAccessibilityPermission ?? false;
  const isFullyArmed = hasOverlay && hasAccessibility;

  // Apple Fitness Tri-Ring geometry
  const rOuter = 74;   // Coral Red (Reels Quota)
  const rMiddle = 58;  // Volt Lime (Focus Attention)
  const rInner = 42;   // Electric Cyan (Screen Minutes)

  const cOuter = 2 * Math.PI * rOuter;
  const cMiddle = 2 * Math.PI * rMiddle;
  const cInner = 2 * Math.PI * rInner;

  const offOuter = cOuter - (quotaPct / 100) * cOuter;
  const offMiddle = cMiddle - (focusPct / 100) * cMiddle;
  const offInner = cInner - (minutesPct / 100) * cInner;

  const handleToggleWidget = async () => {
    const next = !isWidgetActive;
    setIsWidgetActive(next);
    await toggleAndroidFloatingHud(next);
  };

  const handleManualTestSwipe = async (platform: 'Instagram Reels' | 'YouTube Shorts') => {
    await recordNativeSwipe(platform);
    await syncNativeStats();
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).toUpperCase();

  // 7-day consistency strip data
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <div className="space-y-6 pb-28 text-white select-none">
      {/* Top Date Header */}
      <div className="flex items-end justify-between pt-1 px-1">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
            {todayStr}
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-0.5">
            Activity
          </h1>
        </div>
        <div
          onClick={onOpenPro}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-amber-400' : 'text-zinc-500'}`} />
          <span className="text-xs font-bold text-zinc-300">
            {isPro ? 'Ultra Active' : 'Upgrade'}
          </span>
        </div>
      </div>

      {/* Arm Real Reel Tracking & System Permissions Banner */}
      {!isFullyArmed ? (
        <div className="rounded-[28px] bg-gradient-to-b from-[#251307] to-[#120902] border border-amber-500/40 p-5 space-y-4 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center space-x-1.5">
                  <span>Arm Active Tracking (2 Steps)</span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Enable these 2 permissions to detect Instagram Reels & Shorts
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {/* Step 1: Overlay Permission */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5 max-w-[68%]">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>1. Display Over Other Apps</span>
                  {hasOverlay ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158]" />
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold">• Required</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Renders the corner live counter pill over videos</p>
              </div>
              <button
                onClick={async () => {
                  await requestAndroidOverlayPermission();
                  await syncNativeStats();
                }}
                disabled={hasOverlay}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  hasOverlay
                    ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30 cursor-default'
                    : 'bg-white hover:bg-zinc-200 text-black shadow-lg active:scale-95'
                }`}
              >
                {hasOverlay ? 'Active ✓' : 'Enable'}
              </button>
            </div>

            {/* Step 2: Accessibility Service */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5 max-w-[68%]">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>2. Reel Accessibility Service</span>
                  {hasAccessibility ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158]" />
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold">• Required</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Detects real-life Instagram Reels & YouTube Shorts swipes</p>
              </div>
              <button
                onClick={async () => {
                  await requestAndroidAccessibility();
                  await syncNativeStats();
                }}
                disabled={hasAccessibility}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  hasAccessibility
                    ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30 cursor-default'
                    : 'bg-[#A8FF00] hover:bg-[#8ee600] text-black shadow-lg active:scale-95'
                }`}
              >
                {hasAccessibility ? 'Active ✓' : 'Enable'}
              </button>
            </div>

            {/* Android 13/14/15 Restricted Setting Notice */}
            {!hasAccessibility && (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2 text-[11px] text-zinc-300">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <b className="text-white">Android 13/14/15 Tip:</b> If Accessibility says <i>"Restricted setting"</i>:
                  </div>
                </div>
                <div className="pl-6 space-y-1 text-zinc-400 text-[11px]">
                  <div>1. Tap the button below to open <b>NeuroGuard App Info</b>.</div>
                  <div>2. Tap the <b>three dots (⋮)</b> in the top-right corner.</div>
                  <div>3. Tap <b>"Allow restricted settings"</b> (verify PIN/fingerprint).</div>
                  <div>4. Return here & tap <b>"Enable"</b> on Step 2!</div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => openAndroidAppDetails()}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Open App Info (Allow Restricted Settings)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0d1d12] border border-[#30D158]/30 px-4 py-2.5 flex items-center justify-between text-xs text-[#30D158]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#30D158]" />
            <span className="font-bold text-white">Protection Active:</span>
            <span className="text-zinc-300">Real Instagram & YouTube tracking armed</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-ping" />
        </div>
      )}

      {/* 7-Day Apple Fitness Weekly Consistency Strip */}
      <div className="rounded-[28px] bg-[#121214] border border-white/[0.08] p-4 flex items-center justify-between">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === currentDayIdx;
          const isPast = idx < currentDayIdx;
          const closed = isPast || (isToday && !isExceeded);

          return (
            <div key={idx} className="flex flex-col items-center space-y-1.5">
              <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-zinc-500'}`}>
                {day}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isToday
                    ? 'border-[#FA114F] shadow-[0_0_8px_#FA114F]'
                    : closed
                    ? 'border-[#30D158] bg-[#30D158]/10'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                {closed ? (
                  <Check className="w-3.5 h-3.5 text-[#30D158] stroke-[3]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Apple Fitness Tri-Ring Card */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 shadow-2xl relative overflow-hidden">
        {isExceeded && (
          <div className="absolute top-0 left-0 right-0 bg-[#FA114F] text-white text-[11px] font-black uppercase tracking-wider py-1 px-4 text-center">
            🚨 Daily Quota Exceeded • Accountability Alert Dispatched
          </div>
        )}

        <div className={`flex items-center justify-between ${isExceeded ? 'pt-4' : ''}`}>
          {/* Ring Metrics Legend */}
          <div className="space-y-4 max-w-[55%]">
            {/* Ring 1: Coral Red (Reels Quota) */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FA114F] shadow-[0_0_8px_#FA114F]" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reels Quota</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight mt-0.5">
                {reelsCount} <span className="text-sm font-normal text-zinc-500">/ {limit}</span>
              </div>
            </div>

            {/* Ring 2: Volt Lime (Attention / Focus) */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A8FF00] shadow-[0_0_8px_#A8FF00]" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Focus Dwell</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight mt-0.5">
                {avgAttentionSec}s <span className="text-sm font-normal text-zinc-500">avg</span>
              </div>
            </div>

            {/* Ring 3: Electric Cyan (Screen Minutes) */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Shorts Time</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight mt-0.5">
                {totalMinutes} <span className="text-sm font-normal text-zinc-500">/ {maxMinutes} MIN</span>
              </div>
            </div>
          </div>

          {/* Apple Fitness Tri-Ring SVG */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
              {/* Outer Track & Progress: Coral Red (#FA114F) */}
              <circle cx="90" cy="90" r={rOuter} stroke="#280A15" strokeWidth="12" fill="none" />
              <circle
                cx="90"
                cy="90"
                r={rOuter}
                stroke="#FA114F"
                strokeWidth="12"
                strokeDasharray={cOuter}
                strokeDashoffset={offOuter}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />

              {/* Middle Track & Progress: Volt Lime (#A8FF00) */}
              <circle cx="90" cy="90" r={rMiddle} stroke="#1A2800" strokeWidth="12" fill="none" />
              <circle
                cx="90"
                cy="90"
                r={rMiddle}
                stroke="#A8FF00"
                strokeWidth="12"
                strokeDasharray={cMiddle}
                strokeDashoffset={offMiddle}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Track & Progress: Electric Cyan (#00F0FF) */}
              <circle cx="90" cy="90" r={rInner} stroke="#00242B" strokeWidth="12" fill="none" />
              <circle
                cx="90"
                cy="90"
                r={rInner}
                stroke="#00F0FF"
                strokeWidth="12"
                strokeDasharray={cInner}
                strokeDashoffset={offInner}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* Ring Footer Status */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">
            {isExceeded
              ? '🚨 Quota exceeded! Dispatched alert to contacts.'
              : `${Math.max(0, limit - reelsCount)} reels remaining until alert`}
          </span>
          <span className={`font-bold ${isExceeded ? 'text-[#FA114F]' : 'text-[#30D158]'}`}>
            {quotaPct}% of limit
          </span>
        </div>
      </div>

      {/* Real Apps Detection Cards: Instagram & YouTube */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
            Hardware Background Detection
          </span>
          <span className="text-[10px] text-zinc-500 font-medium">Live from Accessibility Engine</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Real Instagram Reels */}
          <div className="rounded-[24px] bg-[#121214] border border-white/[0.08] p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Instagram</span>
              <span className="w-2 h-2 rounded-full bg-[#FA114F] animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {instagramCount}
            </div>
            <p className="text-[11px] text-zinc-500">Reels swiped in Instagram</p>
            <button
              onClick={() => handleManualTestSwipe('Instagram Reels')}
              className="w-full py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white transition-colors border border-white/5 flex items-center justify-center space-x-1"
            >
              <Play className="w-2.5 h-2.5 text-[#FA114F]" />
              <span>Test +1 IG Reel</span>
            </button>
          </div>

          {/* Card 2: Real YouTube Shorts */}
          <div className="rounded-[24px] bg-[#121214] border border-white/[0.08] p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">YouTube</span>
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {youtubeCount}
            </div>
            <p className="text-[11px] text-zinc-500">Shorts swiped in YouTube</p>
            <button
              onClick={() => handleManualTestSwipe('YouTube Shorts')}
              className="w-full py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white transition-colors border border-white/5 flex items-center justify-center space-x-1"
            >
              <Play className="w-2.5 h-2.5 text-[#00F0FF]" />
              <span>Test +1 Short</span>
            </button>
          </div>
        </div>
      </div>

      {/* Persistent Floating Corner Widget Switch */}
      <div className="rounded-[28px] bg-[#121214] border border-white/[0.08] p-5 flex items-center justify-between shadow-xl">
        <div className="space-y-1 max-w-[75%]">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white">Corner Floating Counter</span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Draggable
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Stays parked on the screen even when NeuroGuard is closed. Counts reels live.
          </p>
        </div>

        <button
          onClick={handleToggleWidget}
          className={`w-13 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${
            isWidgetActive ? 'bg-[#30D158] justify-end' : 'bg-zinc-800 justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
        </button>
      </div>

      {/* Accountability Contacts Summary Row */}
      <div
        onClick={onOpenPartner}
        className="rounded-[28px] bg-[#121214] border border-white/[0.08] p-5 cursor-pointer hover:border-white/20 transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
            <Users className="w-5 h-5 text-[#FA114F]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
              Accountability Sharing
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {selectedPartners.length > 0
                ? `${selectedPartners.map((p) => p.name).join(', ')}`
                : 'No contacts armed'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {selectedPartners.length > 0
                ? `Will receive automated SMS alert at ${limit} reels`
                : 'Tap to select parents or friends'}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500" />
      </div>

      {/* Cognitive Trends Summary Tile */}
      <div
        onClick={onOpenAnalytics}
        className="rounded-[28px] bg-[#121214] border border-white/[0.08] p-5 cursor-pointer hover:border-white/20 transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
            <Brain className="w-5 h-5 text-[#A8FF00]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
              Dopamine & Attention Span
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {avgAttentionSec}s Attention Velocity
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              60s drop-off curve & compulsive micro-skip analytics
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500" />
      </div>
    </div>
  );
};
