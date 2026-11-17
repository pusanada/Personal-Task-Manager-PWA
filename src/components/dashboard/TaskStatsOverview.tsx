'use client';

import React from 'react';
import Link from 'next/link';
import { TaskStats } from '@/types/task';
import { cn } from '@/lib/utils/cn';

interface TaskStatsOverviewProps {
  stats: TaskStats;
}

/**
 * แถบสรุปสถิติแบบกระชับ (ไม่ใช้การ์ดใหญ่) — คลิกได้เพื่อกรองงานในหน้า "งานทั้งหมด"
 */
export function TaskStatsOverview({ stats }: TaskStatsOverviewProps) {
  const items = [
    {
      label: 'เกินกำหนด',
      count: stats.overdue,
      dot: 'bg-overdue',
      countClass: stats.overdue > 0 ? 'text-overdue' : 'text-neutral-400',
      href: '/tasks?status=Active&timeRange=Overdue',
    },
    {
      label: 'ครบกำหนดวันนี้',
      count: stats.dueToday,
      dot: 'bg-due-soon',
      countClass: stats.dueToday > 0 ? 'text-due-soon' : 'text-neutral-400',
      href: '/tasks?status=Active&timeRange=Today',
    },
    {
      label: 'ภายใน 48 ชม.',
      count: stats.dueWithin48h,
      dot: 'bg-primary',
      countClass: 'text-neutral-900',
      href: '/tasks?status=Active&timeRange=48h',
    },
    {
      label: 'เสร็จแล้ว',
      count: stats.completed,
      dot: 'bg-done',
      countClass: 'text-neutral-900',
      href: '/tasks?status=Completed',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 rounded-xl bg-surface border border-neutral-200">
      {items.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className="group flex items-center gap-2"
        >
          <span className={cn('w-2 h-2 rounded-full shrink-0', item.dot)} />
          <span
            className={cn(
              'text-lg font-semibold tabular-nums leading-none',
              item.countClass
            )}
          >
            {item.count}
          </span>
          <span className="text-xs text-muted group-hover:text-neutral-700 transition-colors">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
