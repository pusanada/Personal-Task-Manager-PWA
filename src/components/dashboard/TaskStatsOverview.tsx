'use client';

import React from 'react';
import Link from 'next/link';
import { TaskStats } from '@/types/task';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface TaskStatsOverviewProps {
  stats: TaskStats;
}

export function TaskStatsOverview({ stats }: TaskStatsOverviewProps) {
  const cards = [
    {
      label: 'เกินกำหนด',
      count: stats.overdue,
      sub: stats.overdue > 0 ? 'ต้องรีบส่งด่วน' : 'ไม่มีงานค้าง',
      color: 'text-overdue',
      bg: stats.overdue > 0 ? 'bg-red-50/60' : 'bg-surface',
      borderColor: stats.overdue > 0 ? 'border-red-200' : 'border-neutral-200',
      icon: AlertCircle,
      href: '/tasks?status=Active',
    },
    {
      label: 'ครบกำหนดวันนี้',
      count: stats.dueToday,
      sub: 'กำหนดส่งภายในวันนี้',
      color: 'text-primary',
      bg: stats.dueToday > 0 ? 'bg-blue-50/60' : 'bg-surface',
      borderColor: stats.dueToday > 0 ? 'border-blue-200' : 'border-neutral-200',
      icon: Calendar,
      href: '/tasks?status=Active',
    },
    {
      label: 'ภายใน 48 ชม.',
      count: stats.dueWithin48h,
      sub: 'ใกล้ถึงกำหนด',
      color: 'text-due-soon',
      bg: stats.dueWithin48h > 0 ? 'bg-amber-50/60' : 'bg-surface',
      borderColor: stats.dueWithin48h > 0 ? 'border-amber-200' : 'border-neutral-200',
      icon: Clock,
      href: '/tasks?status=Active',
    },
    {
      label: 'เสร็จสิ้นแล้ว',
      count: stats.completed,
      sub: `จากทั้งหมด ${stats.total} งาน`,
      color: 'text-done',
      bg: 'bg-surface',
      borderColor: 'border-neutral-200',
      icon: CheckCircle2,
      href: '/tasks?status=Completed',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Link
            key={idx}
            href={card.href}
            className={cn(
              'group p-3.5 sm:p-4 rounded-xl border bg-white hover:bg-neutral-50/80 transition-all flex flex-col justify-between',
              card.borderColor
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted group-hover:text-neutral-900 transition-colors">
                {card.label}
              </span>
              <div className={cn('p-1.5 rounded-lg', card.bg)}>
                <Icon className={cn('w-4 h-4', card.color)} />
              </div>
            </div>

            <div className="mt-3">
              <div className={cn('text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight', card.color)}>
                {card.count}
              </div>
              <p className="text-[11px] text-muted mt-0.5 truncate">
                {card.sub}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
