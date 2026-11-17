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
    { label: 'ภาพรวม', href: '/', icon: LayoutDashboard },
    { label: 'งาน', href: '/tasks', icon: CheckSquare },
    { label: 'เพิ่มงาน', isAction: true, onClick: onOpenAddTask, icon: Plus },
    { label: 'นำเข้า', href: '/import', icon: FileSpreadsheet },
    { label: 'ตั้งค่า', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
      {links.map((item, idx) => {
        if (item.isAction) {
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center p-1 group"
              aria-label="เพิ่มงาน"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm group-active:scale-95 transition-transform -mt-3 border-2 border-white">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-medium text-neutral-600 mt-0.5">
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
                ? 'text-primary font-semibold'
                : 'text-muted hover:text-neutral-900'
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
