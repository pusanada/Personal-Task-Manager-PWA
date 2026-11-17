import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendPushNotificationToToken, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { ReminderType } from '@/types/notification';
import {
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueWithin48Hours,
  formatDeadline,
} from '@/lib/dates/timezone';
import { Task } from '@/types/task';

export async function GET() {
  return handleDeadlineReminders();
}

export async function POST() {
  return handleDeadlineReminders();
}

async function handleDeadlineReminders() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        message: 'Supabase not configured on server. Skipping scheduled check.',
      });
    }

    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json({
        message: 'Firebase Admin not configured. Skipping push reminders.',
      });
    }

    // 1. Fetch all tokens
    const { data: tokensData } = await supabase.from('notification_tokens').select('token');
    const tokens = (tokensData || []).map((t) => t.token);
    if (tokens.length === 0) {
      return NextResponse.json({ message: 'No registered FCM tokens found.' });
    }

    // 2. Fetch incomplete tasks with deadlines
    const { data: tasksData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'Completed')
      .not('deadline', 'is', null);

    if (taskError || !tasksData) {
      return NextResponse.json({ error: taskError?.message || 'Failed to fetch tasks' }, { status: 500 });
    }

    const tasks = tasksData as Task[];
    let remindersSent = 0;

    for (const task of tasks) {
      if (!task.deadline) continue;

      let reminderType: ReminderType | null = null;
      let title = '';
      let body = '';

      if (isTaskOverdue(task.deadline)) {
        reminderType = 'overdue';
        title = `⚠️ Overdue Task: ${task.title}`;
        body = `Deadline was ${formatDeadline(task.deadline)}. Don't forget to submit!`;
      } else if (isTaskDueToday(task.deadline)) {
        reminderType = 'due_today';
        title = `🎯 Due Today: ${task.title}`;
        body = `Your deadline is today at ${formatDeadline(task.deadline, undefined, true)}.`;
      } else if (isTaskDueWithin48Hours(task.deadline)) {
        reminderType = '48h';
        title = `⏳ Approaching Deadline: ${task.title}`;
        body = `Due within 48 hours (${formatDeadline(task.deadline)}). Plan ahead!`;
      }

      if (!reminderType) continue;

      // 3. Check if already notified for this task and reminder type
      const { data: existingLog } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('task_id', task.id)
        .eq('reminder_type', reminderType)
        .limit(1);

      if (existingLog && existingLog.length > 0) {
        // Already sent this reminder window
        continue;
      }

      // 4. Send to all registered user tokens
      let atLeastOneSent = false;
      for (const token of tokens) {
        const result = await sendPushNotificationToToken(token, title, body, {
          taskId: task.id,
          url: '/',
        });
        if (result.success) {
          atLeastOneSent = true;
        }
      }

      // 5. Log the notification so we never send duplicate reminders
      if (atLeastOneSent) {
        remindersSent++;
        await supabase.from('notification_logs').insert([
          {
            task_id: task.id,
            reminder_type: reminderType,
            status: 'sent',
          },
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      tasksEvaluated: tasks.length,
      remindersSent,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during reminder cron';
    console.error('Cron reminder error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
