import React, { useState, useEffect } from 'react';
import { Eye, Zap, Flame, Move, ChevronRight, ChevronLeft } from 'lucide-react';

interface FloatingHudOverlayProps {
  reelsWatched: number;
  dailyLimit: number;
  dwellSeconds: number;
  platform: 'Instagram' | 'YouTube';
  isLimitReached: boolean;
  onTapExpand?: () => void;
}

export const FloatingHudOverlay: React.FC<FloatingHudOverlayProps> = ({
  reelsWatched,
  dailyLimit,
  dwellSeconds,
  platform,
  isLimitReached,
  onTapExpand
}) => {
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Attention status calculation based on current dwell time
  const getAttentionStatus = (seconds: number) => {
    if (seconds < 3) return { text: 'Impulsive', color: 'text-red-400', bg: 'bg-red-500/20', icon: Zap };
    if (seconds <= 10) return { text: 'Boredom Skip', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Flame };
    if (seconds <= 25) return { text: 'Mid Attention', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Eye };
    return { text: 'Deep Focus', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Eye };
  };

  const status = getAttentionStatus(dwellSeconds);
  const StatusIcon = status.icon;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 180, e.clientX - dragOffset.x));
    const newY = Math.max(70, Math.min(window.innerHeight - 150, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`touch-none select-none transition-shadow ${
        isDragging ? 'cursor-grabbing scale-105 shadow-2xl' : 'cursor-grab'
      }`}
    >
      {isCollapsed ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-full ios-glass-pill shadow-xl border ${
            isLimitReached ? 'border-red-500 bg-red-950/80 animate-pulse' : 'border-purple-500/40'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-purple-500'} animate-ping`} />
          <span className="text-xs font-bold text-white">{reelsWatched}/{dailyLimit}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      ) : (
        <div
          className={`ios-glass-pill rounded-2xl p-2.5 shadow-2xl border transition-all duration-300 min-w-[210px] ${
            isLimitReached
              ? 'border-red-500/80 bg-red-950/90 shadow-red-900/40 ring-2 ring-red-500/30'
              : reelsWatched / dailyLimit >= 0.8
              ? 'border-amber-500/60 bg-zinc-900/90'
              : 'border-white/20 bg-zinc-900/85'
          }`}
        >
          {/* Header row: Platform & Drag handle */}
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${
                isLimitReached ? 'bg-red-500 animate-ping' : reelsWatched / dailyLimit >= 0.8 ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className="font-semibold text-zinc-300">{platform} HUD</span>
            </div>
            <div className="flex items-center space-x-1 text-zinc-400">
              <Move className="w-3 h-3 text-zinc-500" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(true);
                }}
                className="hover:text-white p-0.5"
                title="Collapse to mini pill"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main counter row */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">Reels Watched</span>
            <div className="text-right">
              <span className={`text-base font-extrabold ${isLimitReached ? 'text-red-400' : 'text-white'}`}>
                {reelsWatched}
              </span>
              <span className="text-xs font-semibold text-zinc-500"> / {dailyLimit}</span>
            </div>
          </div>

          {/* Dwell timer & live attention badge */}
          <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1 text-zinc-300 font-mono">
              <span className="text-zinc-500 font-sans">Dwell:</span>
              <span className="font-semibold text-amber-300">{formatTimer(dwellSeconds)}</span>
            </div>

            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${status.bg}`}>
              <StatusIcon className={`w-3 h-3 ${status.color}`} />
              <span className={`text-[10px] font-medium ${status.color}`}>{status.text}</span>
            </div>
          </div>

          {isLimitReached && (
            <div className="mt-2 text-[10px] text-red-300 font-medium bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/30 text-center animate-bounce">
              🚨 Limit Hit! Partner notified.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
