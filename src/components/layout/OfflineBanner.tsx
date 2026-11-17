'use client';

import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export function OfflineBanner() {
  const { isOffline, hasReconnected } = useOfflineStatus();

  if (isOffline) {
    return (
      <div className="bg-amber-50 text-amber-800 border-b border-amber-200 px-4 py-2 text-xs font-medium flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>คุณออฟไลน์อยู่ การเปลี่ยนแปลงจะถูกบันทึกไว้ในเครื่องและซิงค์เมื่อกลับมาเชื่อมต่ออีกครั้ง</span>
      </div>
    );
  }

  if (hasReconnected) {
    return (
      <div className="bg-green-50 text-done border-b border-green-200 px-4 py-2 text-xs font-medium flex items-center justify-center gap-2">
        <Wifi className="w-4 h-4" />
        <span>กลับมาเชื่อมต่อแล้ว</span>
      </div>
    );
  }

  return null;
}
