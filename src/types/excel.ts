import { TaskPriority } from './task';

export type TaskFieldKey =
  | 'title'
  | 'subject'
  | 'description'
  | 'startDate'
  | 'deadline'
  | 'priority'
  | 'external_url';

export interface ColumnMapping {
  fieldKey: TaskFieldKey;
  label: string;
  matchedHeader: string | null;
  required: boolean;
}

export interface ExcelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate?: boolean;
}

export interface PreviewRow {
  rowNumber: number;
  raw: Record<string, unknown>;
  parsed: {
    title: string;
    subject?: string;
    description?: string;
    deadline?: string | null;
    priority: TaskPriority;
    external_url?: string;
  };
  validation: ExcelValidationResult;
  selected: boolean;
}

export interface ParsedSheetData {
  sheetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
}

export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  invalid: number;
  duplicates: number;
}
