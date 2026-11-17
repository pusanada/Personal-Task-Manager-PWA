import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  isBefore,
  addHours,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'Asia/Bangkok';

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const ENGLISH_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** แปลงชื่อเดือนภาษาอังกฤษจาก date-fns เป็นตัวย่อภาษาไทย */
function toThaiMonthText(text: string): string {
  return text.replace(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g,
    (m) => THAI_MONTHS[ENGLISH_MONTHS.indexOf(m)] ?? m
  );
}

/**
 * Returns current Date in the specified timezone (default Asia/Bangkok)
 */
export function getNowInTimezone(tz: string = DEFAULT_TIMEZONE): Date {
  return toZonedTime(new Date(), tz);
}

/**
 * Check if a deadline is overdue
 */
export function isTaskOverdue(deadline: string | Date | null): boolean {
  if (!deadline) return false;
  const date = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  if (isNaN(date.getTime())) return false;
  return isBefore(date, new Date());
}

/**
 * Check if a task is due today in the specified timezone
 */
export function isTaskDueToday(
  deadline: string | Date | null,
  tz: string = DEFAULT_TIMEZONE
): boolean {
  if (!deadline) return false;
  const date = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  if (isNaN(date.getTime())) return false;

  const nowZoned = toZonedTime(new Date(), tz);
  const targetZoned = toZonedTime(date, tz);

  const startToday = startOfDay(nowZoned);
  const endToday = endOfDay(nowZoned);

  return targetZoned >= startToday && targetZoned <= endToday;
}

/**
 * Check if a task deadline is within the next 48 hours (from now to now + 48h)
 */
export function isTaskDueWithin48Hours(
  deadline: string | Date | null
): boolean {
  if (!deadline) return false;
  const date = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const limit48h = addHours(now, 48);

  return date >= now && date <= limit48h;
}

/**
 * Format remaining time relative to now (e.g., "Overdue 2h", "Due in 4h", "2d left")
 */
export function getRemainingTimeString(deadline: string | Date | null): {
  label: string;
  isOverdue: boolean;
  urgency: 'overdue' | 'urgent' | 'warning' | 'normal' | 'none';
} {
  if (!deadline) {
    return { label: 'No deadline', isOverdue: false, urgency: 'none' };
  }

  const date = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  if (isNaN(date.getTime())) {
    return { label: 'Invalid date', isOverdue: false, urgency: 'none' };
  }

  const now = new Date();
  const overdue = isBefore(date, now);

  if (overdue) {
    const mins = Math.abs(differenceInMinutes(now, date));
    const hours = Math.abs(differenceInHours(now, date));
    const days = Math.abs(differenceInDays(now, date));

    let timeStr = '';
    if (mins < 60) {
      timeStr = `${mins} นาที`;
    } else if (hours < 24) {
      timeStr = `${hours} ชม.`;
    } else {
      timeStr = `${days} วัน`;
    }

    return {
      label: `เกินกำหนด ${timeStr}`,
      isOverdue: true,
      urgency: 'overdue',
    };
  }

  // Future deadline
  const mins = differenceInMinutes(date, now);
  const hours = differenceInHours(date, now);
  const days = differenceInDays(date, now);

  if (mins < 60) {
    return {
      label: `อีก ${mins} นาที`,
      isOverdue: false,
      urgency: 'urgent', // within 1 hour
    };
  } else if (hours < 24) {
    return {
      label: `อีก ${hours} ชม.`,
      isOverdue: false,
      urgency: 'urgent', // within 24 hours
    };
  } else if (hours <= 48) {
    return {
      label: `อีก ${Math.ceil(hours / 24)} วัน`,
      isOverdue: false,
      urgency: 'warning', // 24-48 hours
    };
  } else {
    return {
      label: `อีก ${days} วัน`,
      isOverdue: false,
      urgency: 'normal',
    };
  }
}

/**
 * Format a deadline nicely in Asia/Bangkok timezone
 */
export function formatDeadline(
  deadline: string | Date | null,
  tz: string = DEFAULT_TIMEZONE,
  includeTime: boolean = true
): string {
  if (!deadline) return 'ไม่ได้ระบุกำหนดส่ง';
  const date = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  if (isNaN(date.getTime())) return 'วันที่ไม่ถูกต้อง';

  const pattern = includeTime ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy';
  return toThaiMonthText(formatInTimeZone(date, tz, pattern));
}

/**
 * Sort tasks chronologically:
 * 1. Incomplete Overdue tasks (oldest deadline first so most urgent appears at top)
 * 2. Incomplete Upcoming tasks sorted by nearest deadline first
 * 3. Incomplete Tasks without deadline
 * 4. Completed tasks (if included)
 */
export function sortTasksChronologically<T extends { deadline: string | null; status: string }>(
  tasks: T[]
): T[] {
  const now = new Date();

  return [...tasks].sort((a, b) => {
    // Completed status ordering
    const aCompleted = a.status === 'Completed';
    const bCompleted = b.status === 'Completed';

    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    // Both have same completion status:
    const aDate = a.deadline ? new Date(a.deadline) : null;
    const bDate = b.deadline ? new Date(b.deadline) : null;

    // Handle null deadlines
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    const aOverdue = isBefore(aDate, now);
    const bOverdue = isBefore(bDate, now);

    // Overdue tasks take precedence
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Both overdue: nearest to current or oldest
    if (aOverdue && bOverdue) {
      return aDate.getTime() - bDate.getTime();
    }

    // Both upcoming: nearest deadline first
    return aDate.getTime() - bDate.getTime();
  });
}
