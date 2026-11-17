'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
          งานที่กำลังจะถึง ({tasks.length})
        </h2>

        <Link
          href="/tasks"
          className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1 group"
        >
          <span>ดูทั้งหมด</span>
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
