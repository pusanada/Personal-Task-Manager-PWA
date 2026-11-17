'use client';

import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export function OfflineBanner() {
  const { isOffline, hasReconnected } = useOfflineStatus();

  if (isOffline) {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>You are currently offline. Changes are saved locally and will sync when reconnected.</span>
      </div>
    );
  }

  if (hasReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top">
        <Wifi className="w-4 h-4" />
        <span>Connected back online!</span>
      </div>
    );
  }

  return null;
}
