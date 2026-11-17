import type { ColumnMapping, PreviewRow } from '@/types/excel';
import type { Task } from '@/types/task';
import { parseExcelDate, normalizePriority } from './parser';

/**
 * Validate and build preview rows from parsed sheet data and column mappings
 */
export function validateAndBuildPreviewRows(
  rows: Record<string, unknown>[],
  mappings: ColumnMapping[],
  existingTasks: Task[] = []
): PreviewRow[] {
  const mappingMap = new Map<string, string | null>();
  mappings.forEach((m) => {
    mappingMap.set(m.fieldKey, m.matchedHeader);
  });

  const previewRows: PreviewRow[] = [];
  const seenBatchKeys = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;

    // Check if entire row is empty
    const nonNullValues = Object.values(row).filter(
      (v) => v !== null && v !== undefined && String(v).trim() !== ''
    );
    if (nonNullValues.length === 0) {
      // Empty row
      previewRows.push({
        rowNumber,
        raw: row,
        parsed: {
          title: '',
          priority: 'Medium',
          deadline: null,
        },
        validation: {
          isValid: false,
          errors: ['Empty row'],
          warnings: [],
          isDuplicate: false,
        },
        selected: false,
      });
      return;
    }

    // Extract fields based on mapping
    const titleHeader = mappingMap.get('title');
    const deadlineHeader = mappingMap.get('deadline');
    const subjectHeader = mappingMap.get('subject');
    const descHeader = mappingMap.get('description');
    const priorityHeader = mappingMap.get('priority');
    const urlHeader = mappingMap.get('external_url');

    const rawTitle = titleHeader ? row[titleHeader] : undefined;
    const rawDeadline = deadlineHeader ? row[deadlineHeader] : undefined;
    const rawSubject = subjectHeader ? row[subjectHeader] : undefined;
    const rawDesc = descHeader ? row[descHeader] : undefined;
    const rawPriority = priorityHeader ? row[priorityHeader] : undefined;
    const rawUrl = urlHeader ? row[urlHeader] : undefined;

    const title = rawTitle !== undefined && rawTitle !== null ? String(rawTitle).trim() : '';
    const subject = rawSubject ? String(rawSubject).trim() : undefined;
    const description = rawDesc ? String(rawDesc).trim() : undefined;
    const priority = normalizePriority(rawPriority);
    const deadline = parseExcelDate(rawDeadline);
    const external_url = rawUrl ? String(rawUrl).trim() : undefined;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!title) {
      errors.push('Task title is required');
    }

    // Deadline validation
    if (rawDeadline === undefined || rawDeadline === null || String(rawDeadline).trim() === '') {
      errors.push('Deadline is required');
    } else if (!deadline) {
      errors.push(`Could not parse deadline "${String(rawDeadline)}"`);
    }

    // URL validation if present
    if (external_url) {
      try {
        new URL(external_url.startsWith('http') ? external_url : `https://${external_url}`);
      } catch {
        warnings.push('URL format may be invalid');
      }
    }

    // Duplicate detection:
    // Check against existing database tasks
    const normalizedTitle = title.toLowerCase();
    const isExistingDuplicate = existingTasks.some((t) => {
      const matchTitle = t.title.toLowerCase() === normalizedTitle;
      const matchDeadline = (!t.deadline && !deadline) || (t.deadline && deadline && t.deadline.slice(0, 10) === deadline.slice(0, 10));
      return matchTitle && matchDeadline;
    });

    // Check against current batch
    const batchKey = `${normalizedTitle}_${deadline ? deadline.slice(0, 10) : 'none'}`;
    const isBatchDuplicate = seenBatchKeys.has(batchKey);
    seenBatchKeys.add(batchKey);

    const isDuplicate = isExistingDuplicate || isBatchDuplicate;
    if (isExistingDuplicate) {
      warnings.push('Matches an existing task in your manager');
    } else if (isBatchDuplicate) {
      warnings.push('Duplicate of another row in this file');
    }

    const isValid = errors.length === 0;

    previewRows.push({
      rowNumber,
      raw: row,
      parsed: {
        title,
        subject,
        description,
        deadline,
        priority,
        external_url,
      },
      validation: {
        isValid,
        errors,
        warnings,
        isDuplicate,
      },
      selected: isValid, // By default select valid rows
    });
  });

  return previewRows;
}
