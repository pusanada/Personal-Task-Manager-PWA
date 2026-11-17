export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  user_id?: string | null;
  title: string;
  subject?: string | null;
  description?: string | null;
  deadline: string | null; // ISO 8601 string
  priority: TaskPriority;
  status: TaskStatus;
  external_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  subject?: string | null;
  description?: string | null;
  deadline?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  external_url?: string | null;
}

export interface TaskUpdateInput {
  title?: string;
  subject?: string | null;
  description?: string | null;
  deadline?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  external_url?: string | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  dueWithin48h: number;
  completedToday: number;
}
