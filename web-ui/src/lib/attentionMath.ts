import { ReelEvent } from '../types';

export function calculateAverageAttentionSpan(events: ReelEvent[]): number {
  if (events.length === 0) return 7.4; // Default baseline in seconds
  const total = events.reduce((acc, curr) => acc + curr.dwellDurationMs, 0);
  return Number((total / events.length / 1000).toFixed(1));
}

export function calculateBoredomRate(events: ReelEvent[]): number {
  if (events.length === 0) return 68; // Default percentage
  const earlySkips = events.filter((e) => e.wasSkippedEarly).length;
  return Math.round((earlySkips / events.length) * 100);
}

export function calculateMicroSkipCount(events: ReelEvent[]): number {
  return events.filter((e) => e.isMicroSkip).length;
}

/**
 * Computes the 1-minute reel decay curve.
 * Traces retention percentage at each second mark from 0s to 60s.
 * Explains how user attention degrades exponentially as boredom hits.
 */
export function generateReelRetentionCurve(events: ReelEvent[]) {
  const points: { second: number; retentionPct: number; label: string }[] = [];
  
  // Benchmark cognitive drop-off calibrated by actual session dwell times
  const avgDwell = calculateAverageAttentionSpan(events);
  const decayRate = Math.max(0.04, 1.8 / Math.max(2, avgDwell));

  for (let s = 0; s <= 60; s += 5) {
    // Exponential attention decay model: R(t) = 100 * e^(-k * t)
    const basePct = 100 * Math.exp(-decayRate * s);
    const retention = Math.max(3, Math.round(basePct));

    let label = '';
    if (s === 0) label = 'Hook (100%)';
    else if (s === 5) label = 'Initial Filter';
    else if (s === 10) label = 'Boredom Cliff';
    else if (s === 30) label = 'Halfway Check';
    else if (s === 60) label = 'Full Watch';

    points.push({
      second: s,
      retentionPct: retention,
      label
    });
  }

  return points;
}

/**
 * Categorizes swipes into psychological behavioral bins:
 * 1. Dopamine Slot-Machine (<3s)
 * 2. Boredom Skip (3-10s)
 * 3. Moderate Engagement (11-25s)
 * 4. High Focus (>25s)
 */
export function getAttentionDwellBuckets(events: ReelEvent[]) {
  const buckets = {
    micro: { label: '0 - 3s (Impulsive Flick)', count: 0, color: '#FF453A', desc: 'Dopamine hunting without watching' },
    boredom: { label: '4 - 10s (Boredom Drop)', count: 0, color: '#FF9F0A', desc: 'Hook failed; abandoned early' },
    mid: { label: '11 - 25s (Partial Attention)', count: 0, color: '#0A84FF', desc: 'Watched intro, lost interest midway' },
    full: { label: '26 - 60s+ (Deep Focus)', count: 0, color: '#30D158', desc: 'Finished full 1-minute narrative' }
  };

  events.forEach((e) => {
    const sec = e.dwellDurationMs / 1000;
    if (sec <= 3) buckets.micro.count++;
    else if (sec <= 10) buckets.boredom.count++;
    else if (sec <= 25) buckets.mid.count++;
    else buckets.full.count++;
  });

  return buckets;
}

/**
 * Hourly distribution of doomscrolling
 */
export function getHourlyDoomscrollDistribution(events: ReelEvent[]) {
  const hours = Array(24).fill(0);
  
  events.forEach((e) => {
    const h = new Date(e.timestamp).getHours();
    hours[h]++;
  });

  return hours;
}
