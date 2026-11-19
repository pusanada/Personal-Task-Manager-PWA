'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileTopNav } from './MobileTopNav';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineBanner } from './OfflineBanner';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useTasks } from '@/hooks/useTasks';
import { Task, CreateTaskInput } from '@/types/task';
import { subscribeToForegroundMessages } from '@/lib/firebase/client';

interface TaskModalContextType {
  openAddTask: () => void;
  openEditTask: (task: Task) => void;
}

const TaskModalContext = createContext<TaskModalContextType>({
  openAddTask: () => {},
  openEditTask: () => {},
});

export const useTaskModal = () => useContext(TaskModalContext);

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { addTask, updateTask } = useTasks();

  useEffect(() => {
    // รับการแจ้งเตือน Push เมื่อเปิดหน้าเว็บอยู่
    const unsubscribe = subscribeToForegroundMessages(({ title, body }) => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          });
        }).catch(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/icons/icon-192x192.png' });
          }
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icons/icon-192x192.png' });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (data: CreateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
    setIsTaskModalOpen(false);
  };

  return (
    <TaskModalContext.Provider
      value={{
        openAddTask: handleOpenAddTask,
        openEditTask: handleEditTask,
      }}
    >
      <div className="min-h-screen flex flex-col bg-white text-neutral-900 antialiased selection:bg-primary selection:text-white">
        <OfflineBanner />

        <div className="flex flex-1">
          <Sidebar onOpenAddTask={handleOpenAddTask} />

          <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
            <MobileTopNav onOpenAddTask={handleOpenAddTask} />

            <main className="flex-1 p-4 md:p-8 max-w-[1000px] mx-auto w-full">
              {children}
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
    </TaskModalContext.Provider>
  );
}
