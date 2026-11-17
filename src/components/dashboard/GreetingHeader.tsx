'use client';

import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '@/lib/dates/timezone';

interface GreetingHeaderProps {
  onOpenAddTask?: () => void;
  completedCount: number;
  totalCount: number;
}

export function GreetingHeader({
  onOpenAddTask,
  completedCount,
  totalCount,
}: GreetingHeaderProps) {
  const now = new Date();
  const dateFormatted = formatInTimeZone(
    now,
    DEFAULT_TIMEZONE,
    'EEEE, d MMMM yyyy'
  );
  const hour = parseInt(formatInTimeZone(now, DEFAULT_TIMEZONE, 'H'), 10);

  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17) {
    greeting = 'Good evening';
  }

  // Calculate student productivity score / level
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  let levelTitle = 'Novice Scholar';
  if (percent >= 80) levelTitle = 'Dean’s List Master';
  else if (percent >= 50) levelTitle = 'Focused Achiever';
  else if (percent >= 25) levelTitle = 'Study Warrior';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {dateFormatted}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50">
            <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            {levelTitle}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
          {greeting}, Student 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {totalCount === 0
            ? 'No tasks yet. Import your class syllabus or add your first assignment!'
            : completedCount === totalCount
            ? '🎉 All tasks finished! You are completely caught up.'
            : `You have completed ${completedCount} of ${totalCount} tasks (${percent}%). Keep up the momentum!`}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenAddTask}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
