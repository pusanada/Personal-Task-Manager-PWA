'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Plus } from 'lucide-react';

interface MobileTopNavProps {
  onOpenAddTask?: () => void;
}

export function MobileTopNav({ onOpenAddTask }: MobileTopNavProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
          <CheckSquare className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-neutral-900">
          TaskFlow
        </span>
      </Link>

      <button
        onClick={onOpenAddTask}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-medium"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>เพิ่มงาน</span>
      </button>
    </header>
  );
}
