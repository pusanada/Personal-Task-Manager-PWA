export type ReminderType = 'overdue' | 'due_today' | '48h' | '24h';

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
