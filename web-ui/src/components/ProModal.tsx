import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Crown,
  Check,
  ShieldAlert,
  Users,
  Brain,
  Lock,
  Sparkles,
  X
} from 'lucide-react';

interface ProModalProps {
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ onClose }) => {
  const { isPro, setIsPro } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  const handleActivate = () => {
    setIsPro(true);
    setActivatedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm rounded-[36px] bg-[#121214] border border-white/15 p-6 space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Badge */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FA114F] to-[#FF9F0A] flex items-center justify-center shadow-[0_0_30px_#FA114F50]">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FA114F]/15 text-[#FA114F] border border-[#FA114F]/30">
            NeuroGuard Ultra
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Permanent Attention Mastery
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
            Join 100,000+ high performers reclaiming an average of 2.2 hours every single day.
          </p>
        </div>

        {/* Pro Feature Highlights */}
        <div className="space-y-3 pt-1">
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-5 h-5 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158] shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <span className="font-bold text-white">Hard App Lockout & Emergency Shield:</span>
              <p className="text-[11px] text-zinc-400">Strictly blocks Instagram & YouTube when quota is hit.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <div className="w-5 h-5 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158] shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <span className="font-bold text-white">Unlimited Multi-Contact Network:</span>
              <p className="text-[11px] text-zinc-400">Arm up to 10 family members, coaches, and partners.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <div className="w-5 h-5 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158] shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <span className="font-bold text-white">30-Day Cognitive Heatmap & Decay Curves:</span>
              <p className="text-[11px] text-zinc-400">Full historical analytics of attention span velocity.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <div className="w-5 h-5 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158] shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <span className="font-bold text-white">PIN-Protected Quota Override:</span>
              <p className="text-[11px] text-zinc-400">Requires a code from your partner to add more reels.</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {/* Annual Plan */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'annual'
                ? 'bg-zinc-800/80 border-[#FA114F] shadow-[0_0_15px_#FA114F30]'
                : 'bg-zinc-900/40 border-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-[#FA114F] uppercase tracking-wider">Annual</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FA114F]/20 text-[#FA114F]">Save 58%</span>
            </div>
            <div className="text-lg font-black text-white mt-1">$2.49<span className="text-[11px] font-normal text-zinc-400">/mo</span></div>
            <div className="text-[10px] text-zinc-400">$29.99 billed annually</div>
          </div>

          {/* Lifetime Plan */}
          <div
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'lifetime'
                ? 'bg-zinc-800/80 border-[#FA114F] shadow-[0_0_15px_#FA114F30]'
                : 'bg-zinc-900/40 border-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Lifetime</div>
            <div className="text-lg font-black text-white mt-1">$49.99</div>
            <div className="text-[10px] text-zinc-400">Pay once, own forever</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleActivate}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FA114F] to-[#FF9F0A] hover:brightness-110 text-white font-black text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{activatedSuccess ? 'Ultra Activated! 🎉' : 'Start 7-Day Free Trial'}</span>
          </button>
          <div className="text-center text-[10px] text-zinc-500">
            Cancel anytime in Google Play • 100% offline privacy guarantee
          </div>
        </div>
      </div>
    </div>
  );
};
