import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { toggleAndroidFloatingHud } from '../lib/nativeBridge';
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
  Eye,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAnalytics: () => void;
  onOpenPartner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAnalytics,
  onOpenPartner
}) => {
  const {
    events,
    selectedPartners,
    settings,
    instagramCount,
    youtubeCount
  } = useApp();

  const [isWidgetActive, setIsWidgetActive] = useState(true);

  const reelsCount = events.length;
  const limit = settings.dailyReelLimit;
  const quotaPct = Math.min(100, Math.round((reelsCount / (limit || 1)) * 100));
  const isExceeded = reelsCount >= limit;

  // Dwell calculations
  const totalDwellMs = events.reduce((acc, curr) => acc + curr.dwellDurationMs, 0);
  const avgAttentionSec = events.length > 0 ? (totalDwellMs / events.length / 1000).toFixed(1) : '12.4';
  const totalMinutes = Math.round(totalDwellMs / 60000);
  const maxMinutes = settings.maxDailyMinutes || 30;
  const minutesPct = Math.min(100, Math.round((totalMinutes / maxMinutes) * 100));

  // Focus score (percentage of reels watched longer than 10 seconds)
  const mindfulReels = events.filter((e) => !e.wasSkippedEarly).length;
  const focusPct = events.length > 0 ? Math.round((mindfulReels / events.length) * 100) : 65;

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

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).toUpperCase();

  return (
    <div className="space-y-6 pb-28 text-white select-none">
      {/* Apple Fitness Top Date Header */}
      <div className="flex items-end justify-between pt-1 px-1">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
            {todayStr}
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-0.5">
            Activity
          </h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-zinc-300">
          NG
        </div>
      </div>

      {/* Main Apple Fitness Tri-Ring Card */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
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
              ? '🚨 Daily quota exceeded'
              : `${Math.max(0, limit - reelsCount)} reels remaining until alert`}
          </span>
          <span className={`font-bold ${isExceeded ? 'text-[#FA114F]' : 'text-[#A8FF00]'}`}>
            {quotaPct}% of limit
          </span>
        </div>
      </div>

      {/* Real Apps Detection Cards: Instagram & YouTube */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase px-1">
          Real Apps Live Tracking
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Real Instagram Reels */}
          <div className="rounded-[24px] bg-[#121214] border border-white/[0.08] p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Instagram</span>
              <span className="w-2 h-2 rounded-full bg-[#FA114F] animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {instagramCount}
            </div>
            <p className="text-[11px] text-zinc-500">Reels swiped in Instagram</p>
          </div>

          {/* Card 2: Real YouTube Shorts */}
          <div className="rounded-[24px] bg-[#121214] border border-white/[0.08] p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">YouTube</span>
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {youtubeCount}
            </div>
            <p className="text-[11px] text-zinc-500">Shorts swiped in YouTube</p>
          </div>
        </div>
      </div>

      {/* Floating Corner Widget Switch (Requested: small pop up in corner when app is closed) */}
      <div className="rounded-[28px] bg-[#121214] border border-white/[0.08] p-5 flex items-center justify-between shadow-xl">
        <div className="space-y-1 max-w-[75%]">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white">Corner Floating Counter</span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Draggable
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Stays visible in the corner of your screen even when NeuroGuard is closed to count reels live.
          </p>
        </div>

        {/* Apple iOS Switch */}
        <button
          onClick={handleToggleWidget}
          className={`w-13 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${
            isWidgetActive ? 'bg-[#30D158] justify-end' : 'bg-zinc-800 justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
        </button>
      </div>

      {/* Accountability Contacts Row (Apple Fitness Sharing Style) */}
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
                ? `Will receive automated alert at ${limit} reels`
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
              Second-by-second drop-off curve & boredom analytics
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500" />
      </div>
    </div>
  );
};
