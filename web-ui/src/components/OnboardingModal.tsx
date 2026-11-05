import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { requestAndroidOverlayPermission, requestAndroidAccessibility } from '../lib/nativeBridge';
import {
  Shield,
  Brain,
  Eye,
  Users,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Sliders,
  AlertTriangle
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings, updateSettings, nativeStats } = useApp();

  const slides = [
    {
      badge: 'Cognitive Science',
      badgeColor: 'text-[#A8FF00] bg-[#A8FF00]/10 border-[#A8FF00]/20',
      title: 'Escape the Dopamine Loop',
      subtitle: 'The average adult loses 2.5 hours daily to 30-second algorithmic loops.',
      description:
        'Instagram Reels and YouTube Shorts are engineered with variable ratio rewards—the exact same psychological mechanism behind casino slot machines. NeuroGuard restores mindful executive function.',
      icon: <Brain className="w-14 h-14 text-[#A8FF00]" />,
      glowColor: '#A8FF00'
    },
    {
      badge: 'System Architecture',
      badgeColor: 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20',
      title: 'Conscious Corner HUD',
      subtitle: 'A live floating pill that tracks real-world dwell time and reel counts.',
      description:
        'Rendered natively over Instagram and YouTube. As you watch, the HUD displays your live watch count, dwell stopwatch, and shifts color from Safe (Green) to Warning (Amber) to Limit (Red).',
      icon: <Eye className="w-14 h-14 text-[#00F0FF]" />,
      glowColor: '#00F0FF'
    },
    {
      badge: 'Behavioral Psychology',
      badgeColor: 'text-[#FA114F] bg-[#FA114F]/10 border-[#FA114F]/20',
      title: 'Social Stakes Accountability',
      subtitle: 'Automated SMS alerts to parents or trusted friends when limits hit.',
      description:
        'Willpower alone fails 92% of the time. When you exceed your daily quota, NeuroGuard dispatches your attention metrics and reel counts directly to your chosen contacts over cellular SMS.',
      icon: <Users className="w-14 h-14 text-[#FA114F]" />,
      glowColor: '#FA114F'
    },
    {
      badge: 'Final Step',
      badgeColor: 'text-white bg-white/10 border-white/20',
      title: 'Permissions & Goal',
      subtitle: 'Grant the 2 system permissions to arm active protection.',
      description: '',
      icon: <Shield className="w-14 h-14 text-white" />,
      glowColor: '#30D158'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem('neuroguard_onboarding_completed', 'true');
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 select-none animate-fade-in overflow-y-auto">
      {/* Top Indicators */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex space-x-1.5">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-white'
                  : idx < currentSlide
                  ? 'w-3 bg-white/40'
                  : 'w-3 bg-zinc-800'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            localStorage.setItem('neuroguard_onboarding_completed', 'true');
            onComplete();
          }}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="my-auto py-6 space-y-6 flex flex-col items-center text-center">
        {/* Glowing Icon Frame */}
        <div
          className="w-24 h-24 rounded-3xl bg-[#121214] border border-white/10 flex items-center justify-center shadow-2xl relative"
          style={{ boxShadow: `0 0 40px -10px ${slide.glowColor}40` }}
        >
          {slide.icon}
        </div>

        {/* Slide Header */}
        <div className="space-y-2 max-w-sm">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${slide.badgeColor}`}>
            {slide.badge}
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight pt-2">
            {slide.title}
          </h2>
          <p className="text-sm font-semibold text-zinc-300">
            {slide.subtitle}
          </p>
          {slide.description && (
            <p className="text-xs text-zinc-400 leading-relaxed pt-1">
              {slide.description}
            </p>
          )}
        </div>

        {/* Interactive Step 4 Controls */}
        {currentSlide === 3 && (
          <div className="w-full max-w-sm space-y-3 text-left pt-2">
            {/* Permission 1: Overlay */}
            <button
              onClick={() => requestAndroidOverlayPermission()}
              className="w-full p-4 rounded-2xl bg-[#121214] border border-white/10 flex items-center justify-between hover:border-white/20 active:scale-[0.99] transition-all"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>1. Display Over Other Apps</span>
                  {nativeStats?.hasOverlayPermission && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158]" />
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Allows corner HUD to hover over videos</div>
              </div>
              <span className="text-xs font-bold text-[#30D158] px-2.5 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20">
                {nativeStats?.hasOverlayPermission ? 'Enabled' : 'Grant'}
              </span>
            </button>

            {/* Permission 2: Accessibility */}
            <button
              onClick={() => requestAndroidAccessibility()}
              className="w-full p-4 rounded-2xl bg-[#121214] border border-white/10 flex items-center justify-between hover:border-white/20 active:scale-[0.99] transition-all"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>2. Reel Accessibility Service</span>
                  {nativeStats?.hasAccessibilityPermission && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158]" />
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Detects real Instagram & YouTube swipes</div>
              </div>
              <span className="text-xs font-bold text-[#A8FF00] px-2.5 py-1 rounded-full bg-[#A8FF00]/10 border border-[#A8FF00]/20">
                {nativeStats?.hasAccessibilityPermission ? 'Enabled' : 'Grant'}
              </span>
            </button>

            {/* Android 13/14/15 Restricted Setting Helper */}
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-amber-500/20 text-[11px] text-zinc-400 leading-snug flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <b className="text-white">Android 13/14/15 tip:</b> If accessibility says <i>"Restricted setting"</i>, go to App Info ➔ ⋮ (3 dots) ➔ <b>Allow restricted settings</b>.
              </span>
            </div>

            {/* Quota Target Quick Picker */}
            <div className="p-4 rounded-2xl bg-[#121214] border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-300">Set Daily Reels Target</span>
                <span className="font-mono font-bold text-[#FA114F]">{settings.dailyReelLimit} Reels</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateSettings({ dailyReelLimit: num })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      settings.dailyReelLimit === num
                        ? 'bg-[#FA114F] text-white shadow-lg'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {num} Reels
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="pt-4 pb-2">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-all shadow-xl"
        >
          <span>{currentSlide === slides.length - 1 ? 'Activate NeuroGuard 🛡️' : 'Continue'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
