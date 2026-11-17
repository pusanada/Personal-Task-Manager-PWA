import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendPushNotificationToToken, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { ReminderType } from '@/types/notification';
import {
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueWithin48Hours,
  formatDeadline,
  getNowInTimezone,
  DEFAULT_TIMEZONE,
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
    const nowBangkok = getNowInTimezone(DEFAULT_TIMEZONE);
    const currentHour = nowBangkok.getHours();

    for (const task of tasks) {
      if (!task.deadline) continue;

      let reminderType: ReminderType | null = null;
      let title = '';
      let body = '';

      if (isTaskOverdue(task.deadline)) {
        reminderType = 'overdue';
        title = `⚠️ เลยกำหนดส่งแล้ว: ${task.title}`;
        body = `งาน "${task.title}" เลยกำหนดส่งเมื่อ ${formatDeadline(task.deadline)} กรุณาส่งงานหรืออัปเดตสถานะ`;
      } else if (isTaskDueToday(task.deadline)) {
        // วันกำหนดส่ง: แจ้งเตือน 3 รอบต่อวันตามช่วงเวลา (8:00 น., 11:00 น., 17:00 น.)
        if (currentHour < 11) {
          reminderType = 'today_morning';
          title = `☀️ แจ้งเตือนเช้า (08:00 น.): ${task.title}`;
          body = `เริ่มวันใหม่! วันนี้มีกำหนดส่งงาน "${task.title}" เวลา ${formatDeadline(task.deadline, undefined, true)} จัดการให้เสร็จสิ้นนะครับ`;
        } else if (currentHour >= 11 && currentHour < 17) {
          reminderType = 'today_noon';
          title = `⏰ แจ้งเตือนก่อนเที่ยง (11:00 น.): ${task.title}`;
          body = `ใกล้พักเที่ยงแล้ว งาน "${task.title}" มีกำหนดส่งวันนี้ (${formatDeadline(task.deadline, undefined, true)}) อย่าลืมเตรียมพร้อมนะครับ`;
        } else {
          reminderType = 'today_evening';
          title = `🔔 แจ้งเตือนช่วงเย็น (17:00 น.): ${task.title}`;
          body = `ช่วงเย็นแล้ว ตรวจสอบงาน "${task.title}" ก่อนถึงกำหนดส่งเวลา ${formatDeadline(task.deadline, undefined, true)} เรียบร้อยแล้วหรือยัง?`;
        }
      } else if (isTaskDueWithin48Hours(task.deadline)) {
        // ล่วงหน้า 2 วัน (48 ชม.)
        reminderType = '48h';
        title = `⏳ แจ้งเตือนล่วงหน้า 2 วัน: ${task.title}`;
        body = `งาน "${task.title}" มีกำหนดส่งในอีก 2 วัน (${formatDeadline(task.deadline)}) เริ่มต้นวางแผนทำได้เลย!`;
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
