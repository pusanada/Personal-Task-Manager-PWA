import { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task';

const TASKS_STORAGE_KEY = 'taskflow_tasks_v1';

export function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read tasks from local storage:', e);
    return [];
  }
}

export function saveLocalTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event('taskflow-storage-updated'));
  } catch (e) {
    console.error('Failed to save tasks to local storage:', e);
  }
}

export function createLocalTask(input: TaskCreateInput): Task {
  const tasks = getLocalTasks();
  const now = new Date().toISOString();
  const newTask: Task = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user_id: null,
    title: input.title.trim(),
    subject: input.subject?.trim() || null,
    description: input.description?.trim() || null,
    deadline: input.deadline || null,
    priority: input.priority || 'Medium',
    status: input.status || 'Pending',
    external_url: input.external_url?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  tasks.unshift(newTask);
  saveLocalTasks(tasks);
  return newTask;
}

export function updateLocalTask(id: string, updates: TaskUpdateInput): Task | null {
  const tasks = getLocalTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const existing = tasks[idx];
  const updated: Task = {
    ...existing,
    ...updates,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    subject: updates.subject !== undefined ? updates.subject?.trim() || null : existing.subject,
    description: updates.description !== undefined ? updates.description?.trim() || null : existing.description,
    external_url: updates.external_url !== undefined ? updates.external_url?.trim() || null : existing.external_url,
    updated_at: new Date().toISOString(),
  };

  tasks[idx] = updated;
  saveLocalTasks(tasks);
  return updated;
}

export function deleteLocalTask(id: string): boolean {
  const tasks = getLocalTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  saveLocalTasks(filtered);
  return true;
}

export function bulkCreateLocalTasks(inputs: TaskCreateInput[]): Task[] {
  const tasks = getLocalTasks();
  const now = new Date().toISOString();
  const created: Task[] = inputs.map((input) => ({
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user_id: null,
    title: input.title.trim(),
    subject: input.subject?.trim() || null,
    description: input.description?.trim() || null,
    deadline: input.deadline || null,
    priority: input.priority || 'Medium',
    status: input.status || 'Pending',
    external_url: input.external_url?.trim() || null,
    created_at: now,
    updated_at: now,
  }));

  const merged = [...created, ...tasks];
  saveLocalTasks(merged);
  return created;
}
