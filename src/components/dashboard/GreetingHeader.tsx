'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Bell } from 'lucide-react';

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
    <div className="flex items-center justify-between gap-4 pb-1">
      {/* ฝั่งซ้าย: ข้อมูลผู้ใช้ & วันที่ */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 font-semibold text-sm shrink-0">
          TF
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-normal">ยินดีต้อนรับ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight leading-tight">
            {greeting}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {dateFormatted}
            {totalCount > 0 && (
              <span className="ml-1 text-neutral-400">
                · เสร็จแล้ว {completedCount}/{totalCount} งาน
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ฝั่งขวา: กระดิ่งแจ้งเตือน & ปุ่มเพิ่มงาน */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/settings"
          className="relative p-2 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
          title="การแจ้งเตือนและตั้งค่า"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="w-4 h-4" />
          {overdueCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-overdue" />
          )}
        </Link>

        <button
          onClick={onOpenAddTask}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เพิ่มงาน</span>
        </button>
      </div>
    </div>
  );
}
