'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskCreateInput, TaskUpdateInput, TaskStats } from '@/types/task';
import {
  fetchAllTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  toggleTaskCompletion as apiToggleTaskCompletion,
  deleteTask as apiDeleteTask,
  computeTaskStats,
} from '@/services/taskService';
import {
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueWithin48Hours,
  sortTasksChronologically,
} from '@/lib/dates/timezone';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllTasks();
      setTasks(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const handleStorageUpdate = () => {
      loadTasks();
    };

    window.addEventListener('taskflow-storage-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('taskflow-storage-updated', handleStorageUpdate);
    };
  }, [loadTasks]);

  const addTask = async (input: TaskCreateInput): Promise<Task> => {
    const created = await apiCreateTask(input);
    setTasks((prev) => sortTasksChronologically([created, ...prev.filter((t) => t.id !== created.id)]));
    return created;
  };

  const updateTask = async (id: string, updates: TaskUpdateInput): Promise<Task | null> => {
    const updated = await apiUpdateTask(id, updates);
    if (updated) {
      setTasks((prev) =>
        sortTasksChronologically(prev.map((t) => (t.id === id ? updated : t)))
      );
    }
    return updated;
  };

  const toggleTask = async (id: string, currentStatus: string): Promise<Task | null> => {
    // Optimistic UI update
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus, updated_at: new Date().toISOString() } : t))
    );

    const updated = await apiToggleTaskCompletion(id, currentStatus);
    if (updated) {
      setTasks((prev) =>
        sortTasksChronologically(prev.map((t) => (t.id === id ? updated : t)))
      );
    }
    return updated;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return await apiDeleteTask(id);
  };

  // Compute stats
  const stats: TaskStats = useMemo(() => computeTaskStats(tasks), [tasks]);

  // Today's focus tasks: incomplete tasks that are overdue, due today, or due within 48h
  const todaysFocusTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      if (!t.deadline) return false;
      return (
        isTaskOverdue(t.deadline) ||
        isTaskDueToday(t.deadline) ||
        isTaskDueWithin48Hours(t.deadline)
      );
    });
  }, [tasks]);

  // Upcoming tasks: incomplete tasks beyond 48 hours or all upcoming incomplete
  const upcomingTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      if (!t.deadline) return true; // Tasks without deadline also included in all upcoming
      return !isTaskOverdue(t.deadline) && !isTaskDueToday(t.deadline) && !isTaskDueWithin48Hours(t.deadline);
    });
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    stats,
    todaysFocusTasks,
    upcomingTasks,
    loadTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
}
