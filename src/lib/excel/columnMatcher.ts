import type { TaskFieldKey, ColumnMapping } from '@/types/excel';

export interface ColumnDefinition {
  fieldKey: TaskFieldKey;
  label: string;
  required: boolean;
  aliases: string[];
}

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    fieldKey: 'title',
    label: 'Task Title',
    required: true,
    aliases: [
      'task name',
      'task title',
      'title',
      'task',
      'assignment',
      'name',
      'activity',
      'todo',
      'item',
      'งาน',
      'ชื่องาน',
      'หัวข้องาน',
      'รายการ',
      'กิจกรรม',
      'ภารกิจ',
      'การบ้าน',
      'โปรเจกต์',
      'หัวข้อ',
    ],
  },
  {
    fieldKey: 'deadline',
    label: 'Deadline / Due Date',
    required: true,
    aliases: [
      'deadline',
      'due date',
      'due',
      'due_date',
      'due time',
      'target date',
      'end date',
      'submission date',
      'due by',
      'กำหนดส่ง',
      'วันครบกำหนด',
      'เดดไลน์',
      'วันส่ง',
      'ส่งภายใน',
      'วันที่ส่ง',
      'เวลาส่ง',
      'วันสิ้นสุด',
      'วันกำหนดส่ง',
    ],
  },
  {
    fieldKey: 'subject',
    label: 'Subject / Project',
    required: false,
    aliases: [
      'subject',
      'course',
      'project',
      'category',
      'class',
      'module',
      'topic',
      'วิชา',
      'รหัสวิชา',
      'ชื่อวิชา',
      'หมวดหมู่',
      'โครงการ',
      'รายวิชา',
    ],
  },
  {
    fieldKey: 'priority',
    label: 'Priority',
    required: false,
    aliases: [
      'priority',
      'importance',
      'urgency',
      'level',
      'ความสำคัญ',
      'ลำดับความสำคัญ',
      'ระดับความสำคัญ',
    ],
  },
  {
    fieldKey: 'description',
    label: 'Description',
    required: false,
    aliases: [
      'description',
      'details',
      'notes',
      'detail',
      'summary',
      'memo',
      'comment',
      'รายละเอียด',
      'คำอธิบาย',
      'หมายเหตุ',
      'รายละเอียดงาน',
    ],
  },
  {
    fieldKey: 'startDate',
    label: 'Start Date',
    required: false,
    aliases: [
      'start date',
      'start',
      'begin date',
      'start time',
      'วันเริ่มต้น',
      'วันที่เริ่ม',
      'เริ่ม',
      'วันเริ่ม',
    ],
  },
  {
    fieldKey: 'external_url',
    label: 'Task Link / URL',
    required: false,
    aliases: [
      'link',
      'url',
      'task link',
      'external link',
      'reference',
      'attachment',
      'web',
      'ลิงก์',
      'ลิงค์',
      'ลิ้งค์',
      'ลิงก์งาน',
      'เอกสารอ้างอิง',
    ],
  },
];

/**
 * Normalize text for fuzzy matching: lowercase, trim, remove symbols
 */
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .replace(/[_\-\s./\\()]+/g, ' ')
    .trim();
}

/**
 * Automatically match spreadsheet headers to known task fields
 */
export function autoMatchColumns(headers: string[]): ColumnMapping[] {
  const usedHeaders = new Set<string>();
  const mappings: ColumnMapping[] = [];

  for (const def of COLUMN_DEFINITIONS) {
    let matched: string | null = null;

    // 1. Exact match against aliases
    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      const normalized = normalizeHeader(header);

      if (def.aliases.some((alias) => normalizeHeader(alias) === normalized)) {
        matched = header;
        break;
      }
    }

    // 2. Substring match if exact match not found
    if (!matched) {
      for (const header of headers) {
        if (usedHeaders.has(header)) continue;
        const normalized = normalizeHeader(header);

        if (
          def.aliases.some(
            (alias) =>
              normalized.includes(normalizeHeader(alias)) ||
              normalizeHeader(alias).includes(normalized)
          )
        ) {
          matched = header;
          break;
        }
      }
    }

    if (matched) {
      usedHeaders.add(matched);
    }

    mappings.push({
      fieldKey: def.fieldKey,
      label: def.label,
      matchedHeader: matched,
      required: def.required,
    });
  }

  return mappings;
}
