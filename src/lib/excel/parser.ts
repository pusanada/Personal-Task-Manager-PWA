import * as XLSX from 'xlsx';
import type { ParsedSheetData } from '@/types/excel';
import type { TaskPriority } from '@/types/task';

const THAI_MONTH_MAP: Record<string, number> = {
  'ม.ค.': 0,
  มกราคม: 0,
  'ก.พ.': 1,
  กุมภาพันธ์: 1,
  'มี.ค.': 2,
  มีนาคม: 2,
  'เม.ย.': 3,
  เมษายน: 3,
  'พ.ค.': 4,
  พฤษภาคม: 4,
  'มิ.ย.': 5,
  มิถุนายน: 5,
  'ก.ค.': 6,
  กรกฎาคม: 6,
  'ส.ค.': 7,
  สิงหาคม: 7,
  'ก.ย.': 8,
  กันยายน: 8,
  'ต.ค.': 9,
  ตุลาคม: 9,
  'พ.ย.': 10,
  พฤศจิกายน: 10,
  'ธ.ค.': 11,
  ธันวาคม: 11,
};

/**
 * Convert Excel serial date number to JavaScript Date in Asia/Bangkok
 */
export function excelSerialDateToJSDate(serial: number): Date {
  // Excel epoch: Dec 30, 1899 (accounting for 1900 leap year bug in Lotus/Excel)
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const msPerDay = 86400000;
  const targetMs = excelEpoch.getTime() + Math.round(serial * msPerDay);
  return new Date(targetMs);
}

/**
 * Parse any date representation into an ISO string in Asia/Bangkok timezone (+07:00)
 */
export function parseExcelDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // 1. If it's already a Date instance
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      return value.toISOString();
    }
    return null;
  }

  // 2. If it's a number (Excel serial date)
  if (typeof value === 'number') {
    // Valid Excel dates are usually between 10000 (year 1927) and 80000 (year 2119)
    if (value > 20000 && value < 90000) {
      const d = excelSerialDateToJSDate(value);
      return d.toISOString();
    }
  }

  // 3. String date parsing
  const str = String(value).trim();
  if (!str) return null;

  // Numeric string (e.g. "45678" or "45678.5")
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    const d = excelSerialDateToJSDate(num);
    return d.toISOString();
  }

  // Check for Thai Buddhist Era with Thai month names: e.g. "17 พ.ย. 2569" or "17 พฤศจิกายน 2569 23:59"
  for (const [monthName, monthIndex] of Object.entries(THAI_MONTH_MAP)) {
    if (str.includes(monthName)) {
      // Extract day, month, year, and optional time
      const thaiMatch = str.match(
        new RegExp(`(\\d{1,2})\\s*${monthName}\\s*(\\d{4})(?:\\s+(\\d{1,2}):(\\d{2}))?`)
      );
      if (thaiMatch) {
        const day = parseInt(thaiMatch[1], 10);
        let year = parseInt(thaiMatch[2], 10);
        // If year is BE (> 2400), convert to CE
        if (year > 2400) year -= 543;
        const hour = thaiMatch[3] ? parseInt(thaiMatch[3], 10) : 23;
        const minute = thaiMatch[4] ? parseInt(thaiMatch[4], 10) : 59;

        // Construct date in Asia/Bangkok (+07:00)
        const pad = (n: number) => String(n).padStart(2, '0');
        const isoString = `${year}-${pad(monthIndex + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+07:00`;
        const parsed = new Date(isoString);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
      }
    }
  }

  // Check for DD/MM/YYYY or DD-MM-YYYY (or YYYY/MM/DD)
  // Check if year is Buddhist era: e.g. "17/11/2569"
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);

    // If month > 12 and day <= 12, user might have entered MM/DD/YYYY
    if (month > 12 && day <= 12) {
      const temp = day;
      day = month;
      month = temp;
    }

    if (year > 2400) year -= 543; // BE to CE
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 23;
    const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 59;
    const sec = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;

    const pad = (n: number) => String(n).padStart(2, '0');
    const isoString = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(min)}:${pad(sec)}+07:00`;
    const parsed = new Date(isoString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Check for ISO YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10);
    if (year > 2400) year -= 543;
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    const hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 23;
    const min = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 59;
    const sec = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;

    const pad = (n: number) => String(n).padStart(2, '0');
    const isoString = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(min)}:${pad(sec)}+07:00`;
    const parsed = new Date(isoString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Standard fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return null;
}

/**
 * Normalize priority from various text values (Thai & English)
 */
export function normalizePriority(value: unknown): TaskPriority {
  if (!value) return 'Medium';
  const str = String(value).toLowerCase().trim();

  // High priority indicators
  if (
    str === 'high' ||
    str === 'urgent' ||
    str === 'สูง' ||
    str === 'ด่วน' ||
    str === 'สำคัญมาก' ||
    str === '1' ||
    str === 'h'
  ) {
    return 'High';
  }

  // Low priority indicators
  if (
    str === 'low' ||
    str === 'ต่ำ' ||
    str === 'ไม่ด่วน' ||
    str === '3' ||
    str === 'l'
  ) {
    return 'Low';
  }

  // Default
  return 'Medium';
}

/**
 * Read workbook from ArrayBuffer
 */
export function parseWorkbook(buffer: ArrayBuffer): {
  sheetNames: string[];
  sheets: Record<string, ParsedSheetData>;
} {
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false,
  });

  const sheets: Record<string, ParsedSheetData> = {};

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    // Convert to array of arrays first to identify true headers
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
      raw: false,
      dateNF: 'yyyy-mm-dd hh:mm',
    });

    // Also get headers directly
    let headers: string[] = [];
    if (rawData.length > 0) {
      headers = Object.keys(rawData[0]);
    }

    sheets[sheetName] = {
      sheetName,
      headers,
      rows: rawData,
    };
  }

  return {
    sheetNames: workbook.SheetNames,
    sheets,
  };
}
