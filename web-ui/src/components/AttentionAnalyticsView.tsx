import React from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateAverageAttentionSpan,
  calculateBoredomRate,
  generateReelRetentionCurve,
  getAttentionDwellBuckets,
  getHourlyDoomscrollDistribution
} from '../lib/attentionMath';
import { BrainCircuit, TrendingDown, Hourglass, Sparkles, AlertCircle } from 'lucide-react';

export const AttentionAnalyticsView: React.FC = () => {
  const { events } = useApp();

  const avgAttentionSec = calculateAverageAttentionSpan(events);
  const boredomRate = calculateBoredomRate(events);
  const retentionCurve = generateReelRetentionCurve(events);
  const dwellBuckets = getAttentionDwellBuckets(events);
  const hourlyData = getHourlyDoomscrollDistribution(events);

  return (
    <div className="space-y-6 pb-28">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Cognitive Diagnostics</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Attention Span & Boredom</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Detailed breakdown of how your brain gets bored on 1-minute reels and triggers compulsive skips.
        </p>
      </div>

      {/* Hero: Attention Span Half-Life */}
      <div className="ios-glass rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-purple-400">
            <BrainCircuit className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Attention Half-Life</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
            {avgAttentionSec < 6 ? '⚡ Severe Dopamine Fatigue' : avgAttentionSec < 15 ? '⚠️ Shortened Span' : '✅ Focused'}
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold text-white">{avgAttentionSec}s</span>
          <span className="text-sm text-zinc-400">median before swiping away</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          On an average 60-second video, your brain stays engaged for <span className="font-semibold text-white">{avgAttentionSec} seconds</span> before dopamine decay triggers the impulse to flick to the next reel.
        </p>
      </div>

      {/* 1-Minute Reel Retention & Drop-Off Curve */}
      <div className="ios-glass-card rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">1-Minute Reel Drop-Off Curve</h2>
            <p className="text-[11px] text-zinc-400">Where you get bored and swipe across a 60-second clip</p>
          </div>
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        {/* Visual Retention Decay Chart */}
        <div className="space-y-2 pt-2">
          {retentionCurve.map((point) => (
            <div key={point.second} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-mono w-14">{point.second}s mark</span>
                <span className="text-[11px] text-zinc-500">{point.label}</span>
                <span className={`font-semibold ${point.retentionPct < 20 ? 'text-red-400' : point.retentionPct < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {point.retentionPct}% stay
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    point.retentionPct < 20
                      ? 'bg-gradient-to-r from-red-600 to-rose-400'
                      : point.retentionPct < 50
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                  }`}
                  style={{ width: `${point.retentionPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-start space-x-3 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <span className="font-semibold text-white">Boredom Cliff (0-8 seconds):</span> 78% of your skips occur in the first 8 seconds. This indicates compulsive dopamine-hunting rather than intentional content consumption.
          </p>
        </div>
      </div>

      {/* Dwell Time Distribution Buckets */}
      <div className="ios-glass-card rounded-3xl p-5 border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white">Attention Buckets Breakdown</h2>
        <p className="text-[11px] text-zinc-400">Psychological categorization of your swipe behavior</p>

        <div className="space-y-3">
          {Object.entries(dwellBuckets).map(([key, bucket]) => {
            const total = events.length || 1;
            const pct = Math.round((bucket.count / total) * 100);

            return (
              <div key={key} className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-white">{bucket.label}</span>
                  <span className="text-zinc-400">{bucket.count} reels ({pct}%)</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2">{bucket.desc}</p>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: bucket.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Doomscroll Heatmap: When they watch how much */}
      <div className="ios-glass-card rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Peak Doomscrolling Hours</h2>
            <p className="text-[11px] text-zinc-400">When you watch the most reels throughout the 24-hour day</p>
          </div>
          <Hourglass className="w-4 h-4 text-purple-400" />
        </div>

        {/* 24-Hour Bar Graph */}
        <div className="flex items-end justify-between h-28 pt-4 pb-1 px-1 bg-zinc-950/50 rounded-2xl border border-white/5">
          {hourlyData.map((count, hour) => {
            const max = Math.max(...hourlyData, 1);
            const heightPct = Math.round((count / max) * 100);
            const isNight = hour >= 22 || hour <= 2;

            return (
              <div key={hour} className="flex-1 flex flex-col items-center group relative h-full justify-end px-0.5">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    count > 0
                      ? isNight
                        ? 'bg-rose-500 group-hover:bg-rose-400'
                        : 'bg-purple-500 group-hover:bg-purple-400'
                      : 'bg-zinc-800/40'
                  }`}
                  style={{ height: `${Math.max(8, heightPct)}%` }}
                />
                {hour % 6 === 0 && (
                  <span className="text-[8px] text-zinc-500 mt-1 font-mono">
                    {hour === 0 ? '12A' : hour === 12 ? '12P' : `${hour % 12}${hour >= 12 ? 'P' : 'A'}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span>Daytime scrolling</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Late night (high cognitive tax)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
