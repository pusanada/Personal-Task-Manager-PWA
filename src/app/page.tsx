'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { TaskStatsOverview } from '@/components/dashboard/TaskStatsOverview';
import { TodaysFocusSection } from '@/components/dashboard/TodaysFocusSection';
import { UpcomingDeadlinesSection } from '@/components/dashboard/UpcomingDeadlinesSection';
import { DeleteConfirmModal } from '@/components/tasks/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types/task';
import { FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    tasks,
    loading,
    stats,
    todaysFocusTasks,
    upcomingTasks,
    toggleTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setDeleteLoading(true);
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    await updateTask(id, { status: newStatus });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Greeting & Header */}
        <GreetingHeader
          completedCount={stats.completed}
          totalCount={stats.total}
        />

        {/* Statistics Cards */}
        <TaskStatsOverview stats={stats} />

        {/* Quick action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200/50 dark:border-indigo-900/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Got a new course syllabus or assignment sheet?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload your Excel file to automatically extract deadlines and organize your semester.
            </p>
          </div>
          <Link
            href="/import"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Import Excel</span>
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading && tasks.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Today's Focus Section */}
            <TodaysFocusSection
              tasks={todaysFocusTasks}
              onToggle={toggleTask}
              onEdit={(task) => (window as any).taskflowEditTask?.(task)}
              onDelete={(task) => setDeletingTask(task)}
              onStatusChange={handleStatusChange}
            />

            {/* Upcoming Deadlines Section */}
            <UpcomingDeadlinesSection
              tasks={upcomingTasks}
              onToggle={toggleTask}
              onEdit={(task) => (window as any).taskflowEditTask?.(task)}
              onDelete={(task) => setDeletingTask(task)}
              onStatusChange={handleStatusChange}
            />
          </>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={Boolean(deletingTask)}
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      </div>
    </AppLayout>
  );
}
