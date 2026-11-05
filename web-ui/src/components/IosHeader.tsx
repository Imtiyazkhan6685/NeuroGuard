import React from 'react';
import { useApp } from '../context/AppContext';
import { isNativeAndroid } from '../lib/nativeBridge';
import { ShieldCheck, Flame, Crown } from 'lucide-react';

interface IosHeaderProps {
  onOpenPro?: () => void;
}

export const IosHeader: React.FC<IosHeaderProps> = ({ onOpenPro }) => {
  const { streakDays, isPro } = useApp();

  return (
    <header className="w-full pt-3 pb-2 px-5 flex items-center justify-between z-30 select-none border-b border-white/[0.04]">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FA114F] to-[#A8FF00] p-[1.5px] shadow-[0_0_12px_#FA114F40]">
          <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
            <span className="text-xs font-black text-white">N</span>
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-black tracking-tight text-white">NeuroGuard</span>
            {isPro && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-black">
                PRO
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
            <span className="font-medium text-[#30D158]">Armed</span>
          </div>
        </div>
      </div>

      {/* Streak Badge & Pro Trigger */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs">
          <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
          <span>{streakDays}d Streak</span>
        </div>

        {onOpenPro && (
          <button
            onClick={onOpenPro}
            className={`p-1.5 rounded-xl border transition-all ${
              isPro
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white'
            }`}
            title="NeuroGuard Pro"
          >
            <Crown className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
