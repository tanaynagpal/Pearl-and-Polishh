import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-[#3D0513] text-red-200 border border-red-500/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
        <WifiOff className="w-5 h-5 text-red-400 shrink-0" />
        <div>
          <p className="text-xs font-bold">Offline Connection Mode</p>
          <p className="text-[10px] text-white/70">You are currently browsing cached studio content offline.</p>
        </div>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-emerald-950 text-emerald-200 border border-emerald-500/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
        <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs font-bold">Connection Restored</p>
          <p className="text-[10px] text-emerald-300/80">You are back online with live studio connectivity.</p>
        </div>
      </div>
    );
  }

  return null;
};
