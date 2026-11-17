'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout, useTaskModal } from '@/components/layout/AppLayout';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { TaskStatsOverview } from '@/components/dashboard/TaskStatsOverview';
import { WeekStrip } from '@/components/dashboard/WeekStrip';
import { TodaysFocusSection } from '@/components/dashboard/TodaysFocusSection';
import { UpcomingDeadlinesSection } from '@/components/dashboard/UpcomingDeadlinesSection';
import { DeleteConfirmModal } from '@/components/tasks/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types/task';
import { isSameDay } from 'date-fns';

function DashboardContent() {
  const { openAddTask, openEditTask } = useTaskModal();
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

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
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

  // กรองงานตามวันที่เลือกบนแถบสัปดาห์ (ถ้าเลือก)
  const filteredFocusTasks = useMemo(() => {
    if (!selectedCalendarDate) return todaysFocusTasks;
    return tasks.filter((t) => {
      if (!t.deadline || t.status === 'Completed') return false;
      try {
        return isSameDay(new Date(t.deadline), selectedCalendarDate);
      } catch {
        return false;
      }
    });
  }, [selectedCalendarDate, todaysFocusTasks, tasks]);

  return (
    <div className="space-y-6">
      {/* 1. ส่วนหัวทักทาย + กระดิ่งแจ้งเตือน + วันที่ปัจจุบัน */}
      <GreetingHeader
        completedCount={stats.completed}
        totalCount={stats.total}
        overdueCount={stats.overdue}
        onOpenAddTask={openAddTask}
      />

      {/* 2. การ์ดสรุปสถิติ 4 ช่อง (Overview) */}
      <TaskStatsOverview stats={stats} />

      {/* 3. แถบปฏิทินสัปดาห์ปัจจุบัน (Week Strip View แบบตัวอย่าง) */}
      <WeekStrip
        tasks={tasks}
        selectedDate={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
      />

      {/* Loading Skeleton */}
      {loading && tasks.length === 0 ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-neutral-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-28 bg-neutral-100 rounded-lg" />
            <div className="h-28 bg-neutral-100 rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          {/* 4. โฟกัสวันนี้ (Today's Focus Section) */}
          <TodaysFocusSection
            tasks={filteredFocusTasks}
            onToggle={toggleTask}
            onEdit={openEditTask}
            onDelete={(task) => setDeletingTask(task)}
            onStatusChange={handleStatusChange}
            onOpenAddTask={openAddTask}
          />

          {/* 5. งานที่กำลังจะถึง (Upcoming Deadlines Section) */}
          {!selectedCalendarDate && (
            <UpcomingDeadlinesSection
              tasks={upcomingTasks}
              onToggle={toggleTask}
              onEdit={openEditTask}
              onDelete={(task) => setDeletingTask(task)}
              onStatusChange={handleStatusChange}
            />
          )}
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
  );
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}
