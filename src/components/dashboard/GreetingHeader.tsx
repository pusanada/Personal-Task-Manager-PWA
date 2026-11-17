'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface GreetingHeaderProps {
  onOpenAddTask?: () => void;
  completedCount: number;
  totalCount: number;
  overdueCount: number;
}

export function GreetingHeader({
  onOpenAddTask,
  completedCount,
  totalCount,
  overdueCount,
}: GreetingHeaderProps) {
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const hour = now.getHours();
  let greeting = 'สวัสดีตอนเช้า';
  if (hour >= 12 && hour < 17) {
    greeting = 'สวัสดีตอนบ่าย';
  } else if (hour >= 17) {
    greeting = 'สวัสดีตอนเย็น';
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold text-neutral-900 tracking-tight">
          {greeting}
        </h1>
        <p className="text-sm text-muted mt-1">
          วันนี้ {dateFormatted}
        </p>
        {totalCount > 0 && (
          <p className="text-xs text-muted mt-1">
            ทำเสร็จแล้ว {completedCount} จาก {totalCount} งาน
            {overdueCount > 0 && (
              <span className="text-overdue font-medium">
                {' '}
                · เกินกำหนด {overdueCount} งาน
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenAddTask}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เพิ่มงาน</span>
        </button>
      </div>
    </div>
  );
}
