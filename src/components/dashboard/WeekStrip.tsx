'use client';

import React, { useMemo } from 'react';
import { Task } from '@/types/task';
import { isTaskOverdue, isTaskDueToday, DEFAULT_TIMEZONE } from '@/lib/dates/timezone';
import { formatInTimeZone } from 'date-fns-tz';
import { addDays, startOfWeek, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface WeekStripProps {
  tasks: Task[];
  selectedDate?: Date | null;
  onSelectDate?: (date: Date | null) => void;
}

const THAI_DAY_NAMES = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export function WeekStrip({ tasks, selectedDate, onSelectDate }: WeekStripProps) {
  const today = useMemo(() => new Date(), []);

  // สร้างวันที่ 7 วันของสัปดาห์ปัจจุบัน (เริ่มต้นวันอาทิตย์)
  const weekDays = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [today]);

  // แมปงานในแต่ละวัน
  const tasksByDay = useMemo(() => {
    const map = new Map<string, { count: number; hasOverdue: boolean }>();
    tasks.forEach((t) => {
      if (!t.deadline || t.status === 'Completed') return;
      try {
        const d = new Date(t.deadline);
        const key = formatInTimeZone(d, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
        const existing = map.get(key) || { count: 0, hasOverdue: false };
        map.set(key, {
          count: existing.count + 1,
          hasOverdue: existing.hasOverdue || isTaskOverdue(t.deadline),
        });
      } catch {}
    });
    return map;
  }, [tasks]);

  const monthYearLabel = useMemo(() => {
    return new Intl.DateTimeFormat('th-TH', {
      month: 'long',
      year: 'numeric',
    }).format(today);
  }, [today]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 select-none">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold text-neutral-900 tracking-tight">
          สัปดาห์นี้ · {monthYearLabel}
        </span>
        {selectedDate && (
          <button
            onClick={() => onSelectDate?.(null)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            แสดงทั้งหมด
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {weekDays.map((date, idx) => {
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const dateKey = formatInTimeZone(date, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
          const dayInfo = tasksByDay.get(dateKey);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate?.(isSelected ? null : date)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative group',
                isSelected
                  ? 'bg-primary text-white shadow-xs'
                  : isToday
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'hover:bg-neutral-50 text-neutral-700'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-medium mb-1',
                  isSelected || isToday ? 'text-white/80' : 'text-muted'
                )}
              >
                {THAI_DAY_NAMES[date.getDay()]}
              </span>

              <span
                className={cn(
                  'text-sm sm:text-base font-semibold tabular-nums leading-none',
                  isSelected || isToday ? 'text-white' : 'text-neutral-900'
                )}
              >
                {date.getDate()}
              </span>

              {/* Indicator Dot สำหรับงานที่มีกำหนดส่ง */}
              <div className="h-1.5 mt-1.5 flex items-center justify-center">
                {dayInfo && dayInfo.count > 0 && (
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSelected || isToday
                        ? 'bg-white'
                        : dayInfo.hasOverdue
                        ? 'bg-overdue'
                        : 'bg-primary'
                    )}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
