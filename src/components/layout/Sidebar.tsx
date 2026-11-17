'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  FileSpreadsheet,
  Settings,
  Plus,
  DownloadCloud,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTasks } from '@/hooks/useTasks';

interface SidebarProps {
  onOpenAddTask?: () => void;
}

export function Sidebar({ onOpenAddTask }: SidebarProps) {
  const pathname = usePathname();
  const { stats } = useTasks();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    {
      label: 'ภาพรวม',
      href: '/',
      icon: LayoutDashboard,
      badge: stats.dueToday > 0 ? stats.dueToday : undefined,
      badgeClass: 'bg-primary text-white',
    },
    {
      label: 'งานทั้งหมด',
      href: '/tasks',
      icon: CheckSquare,
      badge: stats.overdue > 0 ? stats.overdue : undefined,
      badgeClass: 'bg-overdue text-white',
    },
    {
      label: 'นำเข้า Excel',
      href: '/import',
      icon: FileSpreadsheet,
    },
    {
      label: 'ตั้งค่า',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-neutral-200 bg-white h-screen sticky top-0 z-30 select-none">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-neutral-900">
            TaskFlow
          </span>
        </Link>
      </div>

      {/* ปุ่มเพิ่มงานหลัก */}
      <div className="px-4 pb-4">
        <button
          onClick={onOpenAddTask}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เพิ่มงาน</span>
        </button>
      </div>

      {/* เมนูนำทาง */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive ? 'text-primary' : 'text-neutral-400'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[11px] font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center',
                    item.badgeClass
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ปุ่มติดตั้งแอป (PWA) */}
      {canInstall && (
        <div className="px-4 py-2">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 transition-colors"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>ติดตั้งแอป</span>
          </button>
        </div>
      )}

      <div className="p-5 border-t border-neutral-100">
        <span className="text-xs text-muted">TaskFlow</span>
      </div>
    </aside>
  );
}
