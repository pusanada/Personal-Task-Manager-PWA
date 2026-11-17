'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  // Sort with overdue first, then due today, then within 48h
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
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <Flame className="w-5 h-5 fill-indigo-600 dark:fill-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Today&apos;s Focus
              {overdueCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  {overdueCount} Overdue
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tasks overdue, due today, or due within 48 hours
            </p>
          </div>
        </div>

        <Link
          href="/tasks"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white/40 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            All clear for the next 48 hours!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            You don&apos;t have any urgent deadlines right now. Relax, review upcoming assignments, or add a new task.
          </p>
          {onOpenAddTask && (
            <button
              onClick={onOpenAddTask}
              className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              + Add a Task
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
