import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface IosHeaderProps {
  dynamicIslandContent?: React.ReactNode;
}

export const IosHeader: React.FC<IosHeaderProps> = ({ dynamicIslandContent }) => {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full pt-2 pb-2 px-6 flex items-center justify-between z-50 select-none text-white font-semibold text-xs tracking-tight">
      {/* Time */}
      <span className="w-14 pl-1 font-medium">{time}</span>

      {/* Dynamic Island */}
      <div className="flex-1 flex justify-center">
        <div className="h-7 min-w-[124px] max-w-[200px] px-3 bg-black rounded-full border border-white/10 flex items-center justify-center space-x-2 shadow-inner transition-all duration-300">
          {dynamicIslandContent || (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-normal">NeuroGuard Active</span>
            </>
          )}
        </div>
      </div>

      {/* Status Icons */}
      <div className="w-14 flex items-center justify-end space-x-1.5 pr-1">
        <div className="flex space-x-0.5 items-end h-2.5">
          <div className="w-0.5 h-1 bg-white rounded-full" />
          <div className="w-0.5 h-1.5 bg-white rounded-full" />
          <div className="w-0.5 h-2 bg-white rounded-full" />
          <div className="w-0.5 h-2.5 bg-white rounded-full" />
        </div>
        <Wifi className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        <div className="flex items-center">
          <Battery className="w-4 h-4 text-white stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
