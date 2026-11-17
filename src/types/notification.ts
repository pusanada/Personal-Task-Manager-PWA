export type ReminderType =
  | 'overdue'
  | '48h'
  | 'today_morning'
  | 'today_noon'
  | 'today_evening'
  | 'due_today'
  | '24h';

export interface NotificationTokenRecord {
  id: string;
  user_id?: string | null;
  token: string;
  platform: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationLogRecord {
  id: string;
  task_id: string;
  user_id?: string | null;
  reminder_type: ReminderType;
  sent_at: string;
  status: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}
