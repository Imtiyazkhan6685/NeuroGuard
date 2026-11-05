import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FloatingHudOverlay } from './FloatingHudOverlay';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronDown,
  Volume2,
  Sparkles,
  RefreshCw,
  BellRing,
  AlertTriangle,
  Send,
  X
} from 'lucide-react';

interface SimulatedReel {
  id: string;
  creator: string;
  handle: string;
  caption: string;
  audio: string;
  likes: string;
  comments: string;
  bgGradient: string;
  category: string;
}

const SAMPLE_REELS: SimulatedReel[] = [
  {
    id: 'r1',
    creator: 'Tech Unboxed',
    handle: '@techunboxed',
    caption: 'Why smartphones will look completely different in 2027 📱✨ #technology #future',
    audio: 'Original Audio - Future Beats',
    likes: '142.8K',
    comments: '1,204',
    bgGradient: 'from-blue-900 via-indigo-950 to-black',
    category: 'Technology'
  },
  {
    id: 'r2',
    creator: 'Culinary Quickies',
    handle: '@fastbites',
    caption: '3-Ingredient Lava Cake in 90 seconds flat! 🍫 Watch till the gooey end! #foodie #dessert',
    audio: 'Lo-Fi Chill Hop - Bakery Vibes',
    likes: '89.4K',
    comments: '412',
    bgGradient: 'from-amber-900 via-stone-900 to-black',
    category: 'Food'
  },
  {
    id: 'r3',
    creator: 'Brain Hack Daily',
    handle: '@neurohacks',
    caption: 'The 20-second dopamine reset that neuroscientists swear by 🧠⚡ #psychology #focus',
    audio: 'Deep Resonance - Mindscape',
    likes: '310.2K',
    comments: '2,890',
    bgGradient: 'from-purple-950 via-slate-900 to-black',
    category: 'Productivity'
  },
  {
    id: 'r4',
    creator: 'Standup Laughs',
    handle: '@comedycentral',
    caption: 'When you tell yourself you will only watch one reel before bed... 😂💀 #relatable #doomscroll',
    audio: 'Standup Audio - Live at Comedy Store',
    likes: '512.6K',
    comments: '3,842',
    bgGradient: 'from-rose-950 via-zinc-950 to-black',
    category: 'Humor'
  },
  {
    id: 'r5',
    creator: 'Wanderlust Atlas',
    handle: '@secretplaces',
    caption: 'The hidden glowing cave in Norway that nobody talks about 🏔️🌌 #travel #explore',
    audio: 'Ambient Waves - Nordic Echoes',
    likes: '94.1K',
    comments: '670',
    bgGradient: 'from-emerald-950 via-teal-950 to-black',
    category: 'Travel'
  }
];

export const FeedSimulatorView: React.FC = () => {
  const { events, partner, settings, addReelEvent } = useApp();
  const [platform, setPlatform] = useState<'Instagram' | 'YouTube'>('Instagram');
  const [reelIndex, setReelIndex] = useState(0);
  const [dwellSeconds, setDwellSeconds] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [justDispatchedMsg, setJustDispatchedMsg] = useState('');

  const currentReel = SAMPLE_REELS[reelIndex % SAMPLE_REELS.length];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dwell timer ticks upwards second-by-second
  useEffect(() => {
    setDwellSeconds(0);
    timerRef.current = setInterval(() => {
      setDwellSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reelIndex, platform]);

  const handleNextReel = (wasDeliberateSkip = false) => {
    const dwellMs = dwellSeconds * 1000;
    const isEarly = dwellMs < 10000;
    const isMicro = dwellMs < 3000;

    // Record swipe event into attention analytics engine
    addReelEvent({
      id: `reel_${Date.now()}`,
      platform: platform === 'Instagram' ? 'Instagram Reels' : 'YouTube Shorts',
      timestamp: Date.now(),
      dwellDurationMs: Math.max(1000, dwellMs),
      estimatedLengthMs: 60000,
      wasSkippedEarly: isEarly,
      isMicroSkip: isMicro,
      topic: currentReel.category
    });

    const nextCount = events.length + 1;
    if (nextCount === settings.dailyReelLimit) {
      // Trigger accountability banner
      setJustDispatchedMsg(
        `🚨 Accountability Alert triggered to ${partner.name} (${partner.phone}): Daily limit of ${settings.dailyReelLimit} reels reached!`
      );
      setShowNotificationPopup(true);
    }

    setReelIndex((prev) => prev + 1);
    setIsLiked(false);
  };

  const isLimitReached = events.length >= settings.dailyReelLimit;

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between select-none">
      {/* Background Gradient simulating vertical video */}
      <div className={`absolute inset-0 bg-gradient-to-b ${currentReel.bgGradient} transition-colors duration-700`} />

      {/* Subtle animated pattern overlay */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Floating HUD Overlay (This is the requested Small Hover over Screen) */}
      <FloatingHudOverlay
        reelsWatched={events.length}
        dailyLimit={settings.dailyReelLimit}
        dwellSeconds={dwellSeconds}
        platform={platform}
        isLimitReached={isLimitReached}
      />

      {/* Top Platform Switcher & Sim Bar */}
      <div className="relative z-30 pt-3 px-4 flex items-center justify-between text-xs">
        <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button
            onClick={() => setPlatform('Instagram')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              platform === 'Instagram' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow' : 'text-zinc-400'
            }`}
          >
            Instagram Reels
          </button>
          <button
            onClick={() => setPlatform('YouTube')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              platform === 'YouTube' ? 'bg-red-600 text-white shadow' : 'text-zinc-400'
            }`}
          >
            YouTube Shorts
          </button>
        </div>

        <div className="flex items-center space-x-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-zinc-300 border border-white/10 text-[11px]">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Sound On</span>
        </div>
      </div>

      {/* Simulated Content in the Middle */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20 shadow-inner">
          <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold px-2.5 py-0.5 rounded-full bg-purple-900/50 border border-purple-500/30">
          {currentReel.category} Reel #{reelIndex + 1}
        </span>
        <h3 className="text-lg font-bold text-white mt-2 max-w-xs">{currentReel.caption}</h3>
        <p className="text-xs text-zinc-400 mt-1 font-mono">Dwell time: {dwellSeconds}s / 60s</p>
      </div>

      {/* Bottom Overlay: Creator info & Floating Action Controls */}
      <div className="relative z-30 p-4 pb-6 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/50 to-transparent">
        {/* Left: Metadata */}
        <div className="space-y-1.5 max-w-[70%] text-left">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 border border-white/30 flex items-center justify-center font-bold text-xs text-white">
              {currentReel.creator.charAt(0)}
            </div>
            <div>
              <span className="text-xs font-bold text-white">{currentReel.handle}</span>
              <p className="text-[10px] text-zinc-400">{currentReel.audio}</p>
            </div>
          </div>

          {/* Swipe Trigger Button */}
          <button
            onClick={() => handleNextReel(false)}
            className="mt-3 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold border border-white/30 shadow-lg active:scale-95 transition-all"
          >
            <span>Swipe to Next Reel (Up)</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>

        {/* Right: Vertical Interaction Bar (Like, Comment, Share) */}
        <div className="flex flex-col items-center space-y-3.5 pb-2 text-white">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex flex-col items-center space-y-0.5 active:scale-125 transition-transform"
          >
            <div className={`p-2.5 rounded-full ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white'} backdrop-blur-md`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
            </div>
            <span className="text-[10px] font-semibold">{currentReel.likes}</span>
          </button>

          <div className="flex flex-col items-center space-y-0.5">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">{currentReel.comments}</span>
          </div>

          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
            <Share2 className="w-5 h-5" />
          </div>

          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Simulated Live Accountability SMS Alert Notification Banner */}
      {showNotificationPopup && (
        <div className="absolute top-4 left-3 right-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="ios-glass rounded-2xl p-3.5 shadow-2xl border border-red-500/40 bg-zinc-950/90 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                <div className="p-2 rounded-xl bg-red-500 text-white shadow">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-red-400">ACCOUNTABILITY ALERT SENT</span>
                    <span className="text-[10px] text-zinc-400">Now</span>
                  </div>
                  <p className="text-xs text-zinc-200 mt-1 font-medium leading-tight">
                    SMS delivered to <span className="font-bold text-white">{partner.name}</span>:
                  </p>
                  <p className="text-[11px] text-zinc-400 italic mt-0.5 border-l-2 border-red-500/50 pl-2">
                    "{partner.customTemplate.replace('{user}', 'Alex').replace('{limit}', settings.dailyReelLimit.toString()).replace('{watched}', events.length.toString()).replace('{avg_span}', '6.2').replace('{boredom_pct}', '74')}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationPopup(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
