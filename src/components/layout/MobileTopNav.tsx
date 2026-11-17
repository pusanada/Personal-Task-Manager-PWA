'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface MobileTopNavProps {
  onOpenAddTask?: () => void;
}

export function MobileTopNav({ onOpenAddTask }: MobileTopNavProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <CheckSquare className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
          TaskFlow
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={onOpenAddTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
