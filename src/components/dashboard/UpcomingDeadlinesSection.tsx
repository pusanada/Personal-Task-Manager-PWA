'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/tasks/TaskCard';

interface UpcomingDeadlinesSectionProps {
  tasks: Task[];
  onToggle: (id: string, currentStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
}

export function UpcomingDeadlinesSection({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
}: UpcomingDeadlinesSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming Deadlines ({tasks.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Future assignments and projects scheduled ahead
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tasks.map((task) => (
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
    </section>
  );
}
