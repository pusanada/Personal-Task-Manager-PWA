import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAndBuildPreviewRows } from '../src/lib/excel/validator.ts';

test('validateAndBuildPreviewRows flags missing titles and deadlines', () => {
  const mappings = [
    { fieldKey: 'title', label: 'Title', matchedHeader: 'Task', required: true },
    { fieldKey: 'deadline', label: 'Deadline', matchedHeader: 'Due', required: true },
    { fieldKey: 'subject', label: 'Subject', matchedHeader: 'Course', required: false },
  ];

  const rawRows = [
    { Task: 'Valid Task', Due: '2026-11-20 23:59', Course: 'CS101' },
    { Task: '', Due: '2026-11-20 23:59', Course: 'CS101' }, // Missing title
    { Task: 'Missing Due Date', Due: '', Course: 'CS101' }, // Missing deadline
    { Task: '', Due: '', Course: '' }, // Empty row
  ];

  const preview = validateAndBuildPreviewRows(rawRows, mappings, []);

  assert.equal(preview.length, 4);
  assert.equal(preview[0].validation.isValid, true);
  assert.equal(preview[1].validation.isValid, false);
  assert.ok(preview[1].validation.errors.some((e) => e.includes('title is required')));
  assert.equal(preview[2].validation.isValid, false);
  assert.ok(preview[2].validation.errors.some((e) => e.includes('Deadline is required')));
  assert.equal(preview[3].validation.isValid, false);
  assert.ok(preview[3].validation.errors.some((e) => e.includes('Empty row')));
});

test('validateAndBuildPreviewRows flags duplicate tasks against database and batch', () => {
  const mappings = [
    { fieldKey: 'title', label: 'Title', matchedHeader: 'Task', required: true },
    { fieldKey: 'deadline', label: 'Deadline', matchedHeader: 'Due', required: true },
  ];

  const existingTasks = [
    {
      id: 'existing-1',
      title: 'Operating Systems Project',
      deadline: '2026-11-25T16:59:00.000Z',
      status: 'Pending',
      priority: 'High',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const rawRows = [
    // Matches existing task
    { Task: 'Operating Systems Project', Due: '2026-11-25 23:59' },
    // First occurrence
    { Task: 'Database Lab 3', Due: '2026-11-28 23:59' },
    // Duplicate of previous row in batch
    { Task: 'Database Lab 3', Due: '2026-11-28 23:59' },
  ];

  const preview = validateAndBuildPreviewRows(rawRows, mappings, existingTasks);

  assert.equal(preview[0].validation.isDuplicate, true);
  assert.ok(preview[0].validation.warnings.some((w) => w.includes('existing task')));

  assert.equal(preview[1].validation.isDuplicate, false);

  assert.equal(preview[2].validation.isDuplicate, true);
  assert.ok(preview[2].validation.warnings.some((w) => w.includes('Duplicate of another row')));
});
