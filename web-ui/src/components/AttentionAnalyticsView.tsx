import React from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateAverageAttentionSpan,
  calculateBoredomRate,
  generateReelRetentionCurve,
  getAttentionDwellBuckets,
  getHourlyDoomscrollDistribution
} from '../lib/attentionMath';
import { BrainCircuit, TrendingDown, Hourglass, Sparkles, AlertCircle, Zap } from 'lucide-react';

export const AttentionAnalyticsView: React.FC = () => {
  const { events, totalReels, nativeStats } = useApp();

  const avgAttentionSec = nativeStats?.avgAttentionSpan !== undefined
    ? nativeStats.avgAttentionSpan.toFixed(1)
    : calculateAverageAttentionSpan(events);

  const boredomRate = nativeStats?.boredomRate !== undefined
    ? Math.round(nativeStats.boredomRate)
    : calculateBoredomRate(events);

  const retentionCurve = generateReelRetentionCurve(events);
  const dwellBuckets = getAttentionDwellBuckets(events);
  const hourlyData = getHourlyDoomscrollDistribution(events);

  const numAvg = Number(avgAttentionSec);

  return (
    <div className="space-y-6 pb-28 text-white select-none">
      {/* Title */}
      <div>
        <span className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">Cognitive Diagnostics</span>
        <h1 className="text-3xl font-black text-white tracking-tight mt-0.5">Dopamine & Focus</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Second-by-second analytics on how short-form video degrades attention spans.
        </p>
      </div>

      {/* Hero: Attention Span Half-Life */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#A8FF00]">
            <BrainCircuit className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Attention Half-Life</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#A8FF00]/15 text-[#A8FF00] font-bold border border-[#A8FF00]/30">
            {numAvg < 6 ? '⚡ Severe Dopamine Fatigue' : numAvg < 15 ? '⚠️ Shortened Span' : '✅ Focused'}
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-black text-white tracking-tight">{avgAttentionSec}s</span>
          <span className="text-xs font-semibold text-zinc-400">median before flicking away</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          On an average 60-second video, your cognitive focus remains locked for <span className="font-bold text-[#A8FF00]">{avgAttentionSec} seconds</span> before dopamine decay triggers the impulse to swipe to the next reel.
        </p>
      </div>

      {/* 1-Minute Reel Retention & Drop-Off Curve */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">60-Second Video Drop-Off Curve</h2>
            <p className="text-[11px] text-zinc-400">Where you get bored and swipe across a 60-second clip</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-red-500/10 text-[#FA114F]">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Visual Retention Decay Chart */}
        <div className="space-y-3 pt-2">
          {retentionCurve.map((point) => (
            <div key={point.second} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-mono w-16">{point.second}s mark</span>
                <span className="text-[11px] text-zinc-500">{point.label}</span>
                <span className={`font-bold ${point.retentionPct < 20 ? 'text-[#FA114F]' : point.retentionPct < 50 ? 'text-amber-400' : 'text-[#30D158]'}`}>
                  {point.retentionPct}% stay
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    point.retentionPct < 20
                      ? 'bg-[#FA114F]'
                      : point.retentionPct < 50
                      ? 'bg-amber-400'
                      : 'bg-[#30D158]'
                  }`}
                  style={{ width: `${point.retentionPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/[0.04] flex items-start space-x-3 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <span className="font-bold text-white">Boredom Cliff (0-8 seconds):</span> Over 70% of skips occur in the first 8 seconds. This indicates compulsive dopamine-hunting rather than intentional content consumption.
          </p>
        </div>
      </div>

      {/* Dwell Time Distribution Buckets */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white">Attention Buckets Breakdown</h2>
        <p className="text-[11px] text-zinc-400">Psychological categorization of your swipe behavior</p>

        <div className="space-y-3">
          {Object.entries(dwellBuckets).map(([key, bucket]) => {
            const total = totalReels || 1;
            const pct = Math.round((bucket.count / total) * 100);

            return (
              <div key={key} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.04]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{bucket.label}</span>
                  <span className="text-zinc-400 font-mono">{bucket.count} reels ({pct}%)</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2">{bucket.desc}</p>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
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

      {/* Hourly Doomscroll Heatmap */}
      <div className="rounded-[32px] bg-[#121214] border border-white/[0.08] p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Peak Doomscrolling Hours</h2>
            <p className="text-[11px] text-zinc-400">When you watch the most reels throughout the 24-hour day</p>
          </div>
          <Hourglass className="w-5 h-5 text-[#00F0FF]" />
        </div>

        {/* 24-Hour Bar Graph */}
        <div className="flex items-end justify-between h-28 pt-4 pb-1 px-1 bg-black/40 rounded-2xl border border-white/[0.04]">
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
                        ? 'bg-[#FA114F] shadow-[0_0_8px_#FA114F]'
                        : 'bg-[#A8FF00]'
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
            <div className="w-2.5 h-2.5 rounded-sm bg-[#A8FF00]" />
            <span>Daytime focus</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#FA114F]" />
            <span>Late night (high cognitive tax)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
