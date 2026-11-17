'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import { TaskStats } from '@/types/task';
import { cn } from '@/lib/utils/cn';

interface TaskStatsOverviewProps {
  stats: TaskStats;
}

export function TaskStatsOverview({ stats }: TaskStatsOverviewProps) {
  const cards = [
    {
      title: 'Overdue',
      count: stats.overdue,
      description: 'Require immediate action',
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'border-rose-200/80 dark:border-rose-900/60',
      badgeClass: stats.overdue > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500',
      filterHref: '/tasks?status=Active&timeRange=Overdue',
    },
    {
      title: 'Due Today',
      count: stats.dueToday,
      description: 'Deadlines before midnight',
      icon: CalendarCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200/80 dark:border-amber-900/60',
      badgeClass: stats.dueToday > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500',
      filterHref: '/tasks?status=Active&timeRange=Today',
    },
    {
      title: 'Due In 48h',
      count: stats.dueWithin48h,
      description: 'Approaching next 2 days',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-200/80 dark:border-indigo-900/60',
      badgeClass: stats.dueWithin48h > 0 ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500',
      filterHref: '/tasks?status=Active&timeRange=48h',
    },
    {
      title: 'Completed',
      count: stats.completed,
      description: stats.completedToday > 0 ? `${stats.completedToday} done today` : 'Total finished',
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200/80 dark:border-emerald-900/60',
      badgeClass: 'bg-emerald-500 text-white',
      filterHref: '/tasks?status=Completed',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <Link
            key={idx}
            href={card.filterHref}
            className={cn(
              'group rounded-xl p-4 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between bg-white dark:bg-slate-900',
              card.borderColor
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={cn('p-2 rounded-lg', card.bgColor)}>
                <Icon className={cn('w-4 h-4', card.color)} />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {card.count}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {card.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
