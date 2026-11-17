'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileTopNav } from './MobileTopNav';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineBanner } from './OfflineBanner';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/task';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { addTask, updateTask } = useTasks();

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (data: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
    setIsTaskModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      <OfflineBanner />

      <div className="flex flex-1">
        <Sidebar onOpenAddTask={handleOpenAddTask} />

        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <MobileTopNav onOpenAddTask={handleOpenAddTask} />

          <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
            {/* Clone children or pass context if needed */}
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<any>, {
                  onOpenAddTask: handleOpenAddTask,
                  onEditTask: handleEditTask,
                })
              : children}
          </main>
        </div>
      </div>

      <MobileBottomNav onOpenAddTask={handleOpenAddTask} />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        initialTask={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
