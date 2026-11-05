import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateAverageAttentionSpan, calculateBoredomRate, calculateMicroSkipCount } from '../lib/attentionMath';
import { requestAndroidOverlayPermission, requestAndroidAccessibility, toggleAndroidFloatingHud } from '../lib/nativeBridge';
import {
  Brain,
  Flame,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Play,
  Users,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Send
} from 'lucide-react';

interface DashboardViewProps {
  onOpenSimulator: () => void;
  onOpenAnalytics: () => void;
  onOpenPartner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenSimulator,
  onOpenAnalytics,
  onOpenPartner
}) => {
  const {
    events,
    selectedPartners,
    settings,
    nativeStats,
    instagramCount,
    youtubeCount,
    triggerManualAlert
  } = useApp();

  const reelsCount = events.length;
  const limit = settings.dailyReelLimit;
  const percentage = Math.min(100, Math.round((reelsCount / limit) * 100));
  const isExceeded = reelsCount >= limit;

  const avgAttentionSec = calculateAverageAttentionSpan(events);
  const boredomRate = calculateBoredomRate(events);
  const microSkips = calculateMicroSkipCount(events);

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner: Status & Streak */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live Protection</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">NeuroGuard Active</h1>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs font-medium text-purple-300">
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>Active Guard</span>
        </div>
      </div>

      {/* Main Glass Hero Card: The Daily Reel Limit Ring */}
      <div className={`relative overflow-hidden rounded-3xl p-6 ios-glass border transition-all duration-300 ${
        isExceeded ? 'border-red-500/50 shadow-lg shadow-red-950/30' : 'border-white/15'
      }`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 max-w-[55%]">
            <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isExceeded ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              {isExceeded ? <ShieldAlert className="w-3 h-3 text-red-400" /> : <ShieldCheck className="w-3 h-3 text-purple-400" />}
              <span>{isExceeded ? 'Limit Reached' : 'Within Safety Quota'}</span>
            </span>

            <div className="pt-1">
              <div className="text-4xl font-extrabold text-white tracking-tight">
                {reelsCount} <span className="text-lg font-normal text-zinc-400">/ {limit}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Shorts & Reels watched today</p>
            </div>

            {/* Platform Breakdown: Instagram Reels vs YouTube Shorts */}
            <div className="flex items-center space-x-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/20 font-medium">
                📷 {instagramCount} Reels
              </span>
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/20 font-medium">
                ▶️ {youtubeCount} Shorts
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-tight pt-1">
              {isExceeded
                ? `Alert dispatched to ${selectedPartners.map((p) => p.name).join(', ') || 'parents/friends'}.`
                : `${Math.max(0, limit - reelsCount)} reels before automatic alert is sent.`}
            </p>
          </div>

          {/* Circular SVG Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#2C2C2E"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={isExceeded ? '#FF453A' : reelsCount / limit > 0.75 ? '#FF9F0A' : '#BF5AF2'}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{percentage}%</span>
              <span className="text-[10px] text-zinc-400 font-medium">QUOTA</span>
            </div>
          </div>
        </div>

        {/* Action Button inside hero */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onOpenSimulator}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch In-App Feed & HUD Simulator</span>
          </button>
        </div>
      </div>

      {/* Selected Accountability Contacts Pill */}
      <div
        onClick={onOpenPartner}
        className="p-4 rounded-2xl ios-glass border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Automated Alert Recipients</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {selectedPartners.length > 0
                ? selectedPartners.map((p) => p.name).join(', ')
                : 'No contacts selected (Tap to configure)'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-zinc-400 text-xs">
          <span>Edit</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Grid: Attention Span & Boredom Diagnostics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Attention Span */}
        <div
          onClick={onOpenAnalytics}
          className="ios-glass rounded-2xl p-4 cursor-pointer hover:border-purple-500/40 transition-all active:scale-[0.98] border border-white/10"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Avg Dwell</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgAttentionSec}s</div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {Number(avgAttentionSec) < 8 ? '⚡ Impulsive dopamine loop' : '👀 Normal attention span'}
          </p>
        </div>

        {/* Card 2: Boredom Rate */}
        <div
          onClick={onOpenAnalytics}
          className="ios-glass rounded-2xl p-4 cursor-pointer hover:border-amber-500/40 transition-all active:scale-[0.98] border border-white/10"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Boredom Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{boredomRate}%</div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {microSkips} compulsive skips (&lt;3s)
          </p>
        </div>
      </div>

      {/* System Permissions Status Card */}
      <div className="p-5 rounded-3xl ios-glass border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-zinc-300">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Android System Permissions</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Hardware Guard
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => requestAndroidOverlayPermission()}
            className="p-3 rounded-2xl bg-zinc-900 border border-white/10 text-left hover:border-purple-500/40 transition-all"
          >
            <div className="font-semibold text-white">1. Floating HUD</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Display over Instagram & YT</div>
            <div className="text-[10px] text-purple-400 font-bold mt-1">Tap to grant / test →</div>
          </button>

          <button
            onClick={() => requestAndroidAccessibility()}
            className="p-3 rounded-2xl bg-zinc-900 border border-white/10 text-left hover:border-purple-500/40 transition-all"
          >
            <div className="font-semibold text-white">2. Reel Tracker</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Accessibility Service</div>
            <div className="text-[10px] text-purple-400 font-bold mt-1">Tap to grant / test →</div>
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
          <span className="text-amber-400 font-semibold">💡 Tip for Android 13/14/15:</span> If Accessibility says <span className="italic">"Restricted setting"</span>, long-press the NeuroGuard app icon ➔ App Info ➔ tap 3 dots (⋮) in top right ➔ tap <span className="text-white font-semibold">"Allow restricted settings"</span>.
        </div>
      </div>
    </div>
  );
};
