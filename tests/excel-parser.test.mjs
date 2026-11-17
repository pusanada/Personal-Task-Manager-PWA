import test from 'node:test';
import assert from 'node:assert/strict';
import {
  excelSerialDateToJSDate,
  parseExcelDate,
  normalizePriority,
} from '../src/lib/excel/parser.ts';
import { autoMatchColumns } from '../src/lib/excel/columnMatcher.ts';

test('excelSerialDateToJSDate correctly converts Excel serial numbers', () => {
  // Excel serial 45678 = 2025-01-21
  const date = excelSerialDateToJSDate(45678);
  assert.equal(date.getUTCFullYear(), 2025);
  assert.equal(date.getUTCMonth(), 0); // January
  assert.equal(date.getUTCDate(), 21);
});

test('parseExcelDate handles Thai Buddhist Era and Thai month names', () => {
  // "17 พ.ย. 2569" -> Year 2569 BE = 2026 CE, Month 11 (November), Day 17
  const thaiDateStr = '17 พ.ย. 2569 23:59';
  const parsedIso = parseExcelDate(thaiDateStr);
  assert.ok(parsedIso, 'Should parse Thai date');

  const parsed = new Date(parsedIso);
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 10); // November (0-indexed)
  assert.equal(parsed.getDate(), 17);
});

test('parseExcelDate handles DD/MM/YYYY and YYYY-MM-DD formats', () => {
  const dmy = parseExcelDate('25/12/2026 18:00');
  assert.ok(dmy);
  const dmyDate = new Date(dmy);
  assert.equal(dmyDate.getFullYear(), 2026);
  assert.equal(dmyDate.getMonth(), 11);
  assert.equal(dmyDate.getDate(), 25);

  const iso = parseExcelDate('2026-11-20T14:30:00Z');
  assert.ok(iso);
});

test('normalizePriority maps Thai and English priority terms accurately', () => {
  assert.equal(normalizePriority('High'), 'High');
  assert.equal(normalizePriority('urgent'), 'High');
  assert.equal(normalizePriority('ด่วน'), 'High');
  assert.equal(normalizePriority('สูง'), 'High');
  assert.equal(normalizePriority('1'), 'High');

  assert.equal(normalizePriority('Low'), 'Low');
  assert.equal(normalizePriority('ต่ำ'), 'Low');
  assert.equal(normalizePriority('3'), 'Low');

  assert.equal(normalizePriority('Medium'), 'Medium');
  assert.equal(normalizePriority('ปานกลาง'), 'Medium');
  assert.equal(normalizePriority(null), 'Medium');
});

test('autoMatchColumns matches English and Thai headers accurately', () => {
  // English header list
  const englishHeaders = ['Task Name', 'Due Date', 'Course', 'Priority', 'Details'];
  const englishMatches = autoMatchColumns(englishHeaders);

  const titleMatch = englishMatches.find((m) => m.fieldKey === 'title');
  const deadlineMatch = englishMatches.find((m) => m.fieldKey === 'deadline');
  const subjectMatch = englishMatches.find((m) => m.fieldKey === 'subject');

  assert.equal(titleMatch?.matchedHeader, 'Task Name');
  assert.equal(deadlineMatch?.matchedHeader, 'Due Date');
  assert.equal(subjectMatch?.matchedHeader, 'Course');

  // Thai header list
  const thaiHeaders = ['ชื่องาน', 'กำหนดส่ง', 'วิชา', 'ระดับความสำคัญ', 'รายละเอียด'];
  const thaiMatches = autoMatchColumns(thaiHeaders);

  const thaiTitle = thaiMatches.find((m) => m.fieldKey === 'title');
  const thaiDeadline = thaiMatches.find((m) => m.fieldKey === 'deadline');
  const thaiSubject = thaiMatches.find((m) => m.fieldKey === 'subject');

  assert.equal(thaiTitle?.matchedHeader, 'ชื่องาน');
  assert.equal(thaiDeadline?.matchedHeader, 'กำหนดส่ง');
  assert.equal(thaiSubject?.matchedHeader, 'วิชา');
});
