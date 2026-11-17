import { Task, TaskCreateInput, TaskUpdateInput, TaskStats } from '@/types/task';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  getLocalTasks,
  saveLocalTasks,
  createLocalTask,
  updateLocalTask,
  deleteLocalTask,
  bulkCreateLocalTasks,
} from '@/lib/utils/storage';
import {
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueWithin48Hours,
  sortTasksChronologically,
} from '@/lib/dates/timezone';

export async function fetchAllTasks(): Promise<Task[]> {
  const supabase = getSupabaseClient();

  if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Cache to local storage
        saveLocalTasks(data as Task[]);
        return sortTasksChronologically(data as Task[]);
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local store:', e);
    }
  }

  // Fallback to local
  const local = getLocalTasks();
  return sortTasksChronologically(local);
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const supabase = getSupabaseClient();

  if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: input.title.trim(),
            subject: input.subject?.trim() || null,
            description: input.description?.trim() || null,
            deadline: input.deadline || null,
            priority: input.priority || 'Medium',
            status: input.status || 'Pending',
            external_url: input.external_url?.trim() || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        // Also update local storage
        const current = getLocalTasks();
        saveLocalTasks([data as Task, ...current.filter((t) => t.id !== data.id)]);
        return data as Task;
      }
    } catch (e) {
      console.warn('Supabase insert failed, creating locally:', e);
    }
  }

  return createLocalTask(input);
}

export async function updateTask(id: string, updates: TaskUpdateInput): Promise<Task | null> {
  const supabase = getSupabaseClient();

  if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const current = getLocalTasks();
        const idx = current.findIndex((t) => t.id === id);
        if (idx !== -1) {
          current[idx] = data as Task;
          saveLocalTasks(current);
        }
        return data as Task;
      }
    } catch (e) {
      console.warn('Supabase update failed, updating locally:', e);
    }
  }

  return updateLocalTask(id, updates);
}

export async function toggleTaskCompletion(id: string, currentStatus: string): Promise<Task | null> {
  const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
  return updateTask(id, { status: nextStatus });
}

export async function deleteTask(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) {
        deleteLocalTask(id);
        return true;
      }
    } catch (e) {
      console.warn('Supabase delete failed, deleting locally:', e);
    }
  }

  return deleteLocalTask(id);
}

export async function bulkImportTasks(inputs: TaskCreateInput[]): Promise<Task[]> {
  const supabase = getSupabaseClient();

  if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const rowsToInsert = inputs.map((input) => ({
        title: input.title.trim(),
        subject: input.subject?.trim() || null,
        description: input.description?.trim() || null,
        deadline: input.deadline || null,
        priority: input.priority || 'Medium',
        status: input.status || 'Pending',
        external_url: input.external_url?.trim() || null,
      }));

      const { data, error } = await supabase
        .from('tasks')
        .insert(rowsToInsert)
        .select();

      if (!error && data) {
        const current = getLocalTasks();
        const combined = [...(data as Task[]), ...current];
        saveLocalTasks(combined);
        return data as Task[];
      }
    } catch (e) {
      console.warn('Supabase bulk insert failed, saving locally:', e);
    }
  }

  return bulkCreateLocalTasks(inputs);
}

export function computeTaskStats(tasks: Task[]): TaskStats {
  let completed = 0;
  let pending = 0;
  let inProgress = 0;
  let overdue = 0;
  let dueToday = 0;
  let dueWithin48h = 0;
  let completedToday = 0;

  for (const task of tasks) {
    const isCompleted = task.status === 'Completed';

    if (isCompleted) {
      completed++;
      if (task.updated_at && isTaskDueToday(task.updated_at)) {
        completedToday++;
      }
    } else {
      if (task.status === 'In Progress') {
        inProgress++;
      } else {
        pending++;
      }

      if (task.deadline) {
        if (isTaskOverdue(task.deadline)) {
          overdue++;
        } else if (isTaskDueToday(task.deadline)) {
          dueToday++;
        } else if (isTaskDueWithin48Hours(task.deadline)) {
          dueWithin48h++;
        }
      }
    }
  }

  return {
    total: tasks.length,
    completed,
    pending,
    inProgress,
    overdue,
    dueToday,
    dueWithin48h,
    completedToday,
  };
}
