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

  const links = [
    { label: 'Today', href: '/', icon: LayoutDashboard },
    { label: 'All Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Add', isAction: true, onClick: onOpenAddTask, icon: Plus },
    { label: 'Import', href: '/import', icon: FileSpreadsheet },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
      {links.map((item, idx) => {
        if (item.isAction) {
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center p-1 text-indigo-600 dark:text-indigo-400 group"
              aria-label="Add Task"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-active:scale-95 transition-transform -mt-3 border-2 border-white dark:border-slate-900">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                {item.label}
              </span>
            </button>
          );
        }

        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href!}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
            <span className="mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
