import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateAverageAttentionSpan, calculateBoredomRate, calculateMicroSkipCount } from '../lib/attentionMath';
import { Brain, Flame, Clock, ShieldCheck, ShieldAlert, ArrowUpRight, Zap, Play } from 'lucide-react';

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
  const { events, partner, settings, alerts } = useApp();

  const reelsCount = events.length;
  const limit = settings.dailyReelLimit;
  const percentage = Math.min(100, Math.round((reelsCount / limit) * 100));
  const isExceeded = reelsCount >= limit;

  const avgAttentionSec = calculateAverageAttentionSpan(events);
  const boredomRate = calculateBoredomRate(events);
  const microSkips = calculateMicroSkipCount(events);

  // Total screen time in minutes
  const totalMinutes = Math.round(events.reduce((acc, curr) => acc + curr.dwellDurationMs, 0) / 60000);

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner: Status & Streak */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Today's Focus</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">NeuroGuard Health</h1>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs font-medium text-purple-300">
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>Day 4 Streak</span>
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
              <span>{isExceeded ? 'Daily Limit Reached' : 'Within Safety Limit'}</span>
            </span>

            <div className="pt-1">
              <div className="text-4xl font-extrabold text-white tracking-tight">
                {reelsCount} <span className="text-lg font-normal text-zinc-400">/ {limit}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Shorts & Reels watched today</p>
            </div>

            <p className="text-[11px] text-zinc-400 leading-tight">
              {isExceeded
                ? `Accountability alert delivered to ${partner.name}.`
                : `${limit - reelsCount} reels remaining before emergency accountability alert.`}
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
              <span className="text-[10px] text-zinc-400 font-medium">OF QUOTA</span>
            </div>
          </div>
        </div>

        {/* Action Button inside hero */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onOpenSimulator}
            className="flex-1 mr-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Test Floating HUD & Reel Swiper</span>
          </button>
        </div>
      </div>

      {/* Grid: Attention Span & Boredom Diagnostics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Attention Span */}
        <div
          onClick={onOpenAnalytics}
          className="ios-glass-card rounded-2xl p-4 cursor-pointer hover:border-purple-500/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold text-white">{avgAttentionSec}s</div>
          <div className="text-xs font-medium text-zinc-300">Avg Attention Span</div>
          <div className="text-[10px] text-zinc-500 mt-1">vs 60s benchmark reel</div>
        </div>

        {/* Card 2: Boredom Rate */}
        <div
          onClick={onOpenAnalytics}
          className="ios-glass-card rounded-2xl p-4 cursor-pointer hover:border-amber-500/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold text-white">{boredomRate}%</div>
          <div className="text-xs font-medium text-zinc-300">Boredom Skip Rate</div>
          <div className="text-[10px] text-zinc-500 mt-1">Skipped in under 10s</div>
        </div>

        {/* Card 3: Micro Skips */}
        <div className="ios-glass-card rounded-2xl p-4">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 w-fit mb-2">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{microSkips}</div>
          <div className="text-xs font-medium text-zinc-300">Micro-Skips (&lt;3s)</div>
          <div className="text-[10px] text-zinc-500 mt-1">Impulsive dopamine flicks</div>
        </div>

        {/* Card 4: Total Time Spent */}
        <div className="ios-glass-card rounded-2xl p-4">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 w-fit mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{totalMinutes}m</div>
          <div className="text-xs font-medium text-zinc-300">Doomscroll Time</div>
          <div className="text-[10px] text-zinc-500 mt-1">Across IG & YouTube</div>
        </div>
      </div>

      {/* Accountability Partner Status Card */}
      <div
        onClick={onOpenPartner}
        className="ios-glass-card rounded-2xl p-4 cursor-pointer hover:border-white/30 transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
            {partner.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">{partner.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/5">
                {partner.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {alerts.length > 0
                ? `Last alert sent today (${alerts[0].reelsWatched} reels)`
                : `Ready to notify via SMS & WhatsApp on reel #${limit}`}
            </p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
      </div>
    </div>
  );
};
