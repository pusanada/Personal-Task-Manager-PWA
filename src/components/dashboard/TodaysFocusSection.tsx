'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/tasks/TaskCard';
import { isTaskOverdue, isTaskDueToday } from '@/lib/dates/timezone';
import { cn } from '@/lib/utils/cn';

interface TodaysFocusSectionProps {
  tasks: Task[];
  onToggle: (id: string, currentStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
  onOpenAddTask?: () => void;
}

export function TodaysFocusSection({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenAddTask,
}: TodaysFocusSectionProps) {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | '48h'>('all');

  // เรียงลำดับ: เกินกำหนดก่อน → ครบกำหนดวันนี้ → ภายใน 48 ชม.
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.deadline || !b.deadline) return 0;
    const aOverdue = isTaskOverdue(a.deadline);
    const bOverdue = isTaskOverdue(b.deadline);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    const aToday = isTaskDueToday(a.deadline);
    const bToday = isTaskDueToday(b.deadline);
    if (aToday && !bToday) return -1;
    if (!aToday && bToday) return 1;

    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const overdueTasks = sortedTasks.filter((t) => t.deadline && isTaskOverdue(t.deadline));
  const dueTodayTasks = sortedTasks.filter((t) => t.deadline && isTaskDueToday(t.deadline) && !isTaskOverdue(t.deadline));
  const next48hTasks = sortedTasks.filter((t) => t.deadline && !isTaskOverdue(t.deadline) && !isTaskDueToday(t.deadline));

  const displayTasks = sortedTasks.filter((t) => {
    if (filter === 'overdue') return t.deadline && isTaskOverdue(t.deadline);
    if (filter === 'today') return t.deadline && isTaskDueToday(t.deadline) && !isTaskOverdue(t.deadline);
    if (filter === '48h') return t.deadline && !isTaskOverdue(t.deadline) && !isTaskDueToday(t.deadline);
    return true;
  });

  return (
    <section className="space-y-3">
      {/* ส่วนหัวส่วนโฟกัสวันนี้ + ฟิลเตอร์แถบแท็บ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
            โฟกัสวันนี้
          </h2>
          {overdueTasks.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-overdue text-white">
              เกินกำหนด {overdueTasks.length}
            </span>
          )}
        </div>

        {/* แท็บกรองย่อยสำหรับโฟกัสวันนี้ */}
        {tasks.length > 0 && (
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface border border-neutral-200 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                filter === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              ทั้งหมด ({sortedTasks.length})
            </button>
            {overdueTasks.length > 0 && (
              <button
                onClick={() => setFilter('overdue')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  filter === 'overdue'
                    ? 'bg-white text-overdue shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                เกินกำหนด ({overdueTasks.length})
              </button>
            )}
            {dueTodayTasks.length > 0 && (
              <button
                onClick={() => setFilter('today')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  filter === 'today'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                วันนี้ ({dueTodayTasks.length})
              </button>
            )}
            {next48hTasks.length > 0 && (
              <button
                onClick={() => setFilter('48h')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  filter === '48h'
                    ? 'bg-white text-due-soon shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                48 ชม. ({next48hTasks.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* รายการงาน */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 p-8 text-center bg-white">
          <div className="w-12 h-12 rounded-full bg-green-50 text-done mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">
            ไม่มีงานด่วนใน 48 ชั่วโมงนี้
          </h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            ตอนนี้ไม่มีกำหนดส่งที่เร่งด่วน พักผ่อนได้เลย หรือเพิ่มงานใหม่เพื่อวางแผนล่วงหน้า
          </p>
          {onOpenAddTask && (
            <button
              onClick={onOpenAddTask}
              className="mt-4 text-xs font-medium px-3.5 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              + เพิ่มงานใหม่
            </button>
          )}
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center bg-surface">
          <p className="text-xs text-muted">
            ไม่มีงานในหมวดที่เลือก
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
