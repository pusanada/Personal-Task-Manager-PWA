'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  FileSpreadsheet,
  Settings,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MobileBottomNavProps {
  onOpenAddTask?: () => void;
}

export function MobileBottomNav({ onOpenAddTask }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40 bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.08)] px-3 py-2 flex items-center justify-between select-none safe-area-bottom">
      {/* 1. ภาพรวม */}
      <Link
        href="/"
        className={cn(
          'flex flex-col items-center justify-center w-14 py-1 rounded-full text-[11px] font-medium transition-colors',
          pathname === '/'
            ? 'text-primary font-semibold'
            : 'text-neutral-500 hover:text-neutral-900'
        )}
      >
        <LayoutDashboard className={cn('w-5 h-5', pathname === '/' && 'stroke-[2.5] text-primary')} />
        <span className="mt-0.5 text-[10px]">ภาพรวม</span>
      </Link>

      {/* 2. งานทั้งหมด */}
      <Link
        href="/tasks"
        className={cn(
          'flex flex-col items-center justify-center w-14 py-1 rounded-full text-[11px] font-medium transition-colors',
          pathname === '/tasks'
            ? 'text-primary font-semibold'
            : 'text-neutral-500 hover:text-neutral-900'
        )}
      >
        <CheckSquare className={cn('w-5 h-5', pathname === '/tasks' && 'stroke-[2.5] text-primary')} />
        <span className="mt-0.5 text-[10px]">งาน</span>
      </Link>

      {/* 3. ปุ่มเพิ่มงานกลาง (Floating Action Button) */}
      <button
        onClick={onOpenAddTask}
        className="w-11 h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform shrink-0"
        aria-label="เพิ่มงานใหม่"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 4. นำเข้า Excel */}
      <Link
        href="/import"
        className={cn(
          'flex flex-col items-center justify-center w-14 py-1 rounded-full text-[11px] font-medium transition-colors',
          pathname === '/import'
            ? 'text-primary font-semibold'
            : 'text-neutral-500 hover:text-neutral-900'
        )}
      >
        <FileSpreadsheet className={cn('w-5 h-5', pathname === '/import' && 'stroke-[2.5] text-primary')} />
        <span className="mt-0.5 text-[10px]">นำเข้า</span>
      </Link>

      {/* 5. ตั้งค่า */}
      <Link
        href="/settings"
        className={cn(
          'flex flex-col items-center justify-center w-14 py-1 rounded-full text-[11px] font-medium transition-colors',
          pathname === '/settings'
            ? 'text-primary font-semibold'
            : 'text-neutral-500 hover:text-neutral-900'
        )}
      >
        <Settings className={cn('w-5 h-5', pathname === '/settings' && 'stroke-[2.5] text-primary')} />
        <span className="mt-0.5 text-[10px]">ตั้งค่า</span>
      </Link>
    </nav>
  );
}
