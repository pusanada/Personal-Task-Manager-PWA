'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/tasks/TaskCard';
import { isTaskOverdue, isTaskDueToday } from '@/lib/dates/timezone';

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

  const overdueCount = tasks.filter((t) => t.deadline && isTaskOverdue(t.deadline)).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 flex items-center gap-2">
          โฟกัสวันนี้
          {overdueCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-overdue text-white">
              เกินกำหนด {overdueCount}
            </span>
          )}
        </h2>

        <Link
          href="/tasks"
          className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1 group"
        >
          <span>ดูทั้งหมด</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 p-8 text-center bg-white">
          <div className="w-12 h-12 rounded-full bg-green-50 text-done mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">
            ไม่มีงานด่วนใน 48 ชั่วโมงนี้
          </h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            ตอนนี้ไม่มีกำหนดส่งที่เร่งด่วน พักได้เลย หรือเพิ่มงานใหม่ได้ตามสะดวก
          </p>
          {onOpenAddTask && (
            <button
              onClick={onOpenAddTask}
              className="mt-4 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 text-primary hover:bg-blue-100 transition-colors"
            >
              + เพิ่มงาน
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedTasks.map((task) => (
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
