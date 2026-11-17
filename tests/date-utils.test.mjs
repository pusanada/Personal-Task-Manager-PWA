import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueWithin48Hours,
  getRemainingTimeString,
  sortTasksChronologically,
} from '../src/lib/dates/timezone.ts';

test('isTaskOverdue detects past and future dates', () => {
  const pastDate = new Date(Date.now() - 3600000).toISOString();
  const futureDate = new Date(Date.now() + 3600000).toISOString();

  assert.equal(isTaskOverdue(pastDate), true);
  assert.equal(isTaskOverdue(futureDate), false);
  assert.equal(isTaskOverdue(null), false);
});

test('isTaskDueWithin48Hours calculates 48-hour window correctly', () => {
  const within24h = new Date(Date.now() + 12 * 3600000).toISOString();
  const within40h = new Date(Date.now() + 40 * 3600000).toISOString();
  const beyond48h = new Date(Date.now() + 72 * 3600000).toISOString();
  const past = new Date(Date.now() - 3600000).toISOString();

  assert.equal(isTaskDueWithin48Hours(within24h), true);
  assert.equal(isTaskDueWithin48Hours(within40h), true);
  assert.equal(isTaskDueWithin48Hours(beyond48h), false);
  assert.equal(isTaskDueWithin48Hours(past), false);
});

test('getRemainingTimeString formats remaining hours and overdue correctly', () => {
  const past = new Date(Date.now() - 2 * 3600000).toISOString();
  const future = new Date(Date.now() + 5 * 3600000).toISOString();

  const pastInfo = getRemainingTimeString(past);
  assert.equal(pastInfo.isOverdue, true);
  assert.equal(pastInfo.urgency, 'overdue');

  const futureInfo = getRemainingTimeString(future);
  assert.equal(futureInfo.isOverdue, false);
  assert.equal(futureInfo.urgency, 'urgent');
});

test('sortTasksChronologically orders overdue tasks first, then nearest deadline', () => {
  const pastOld = { id: '1', title: 'Old Overdue', deadline: new Date(Date.now() - 48 * 3600000).toISOString(), status: 'Pending' };
  const pastRecent = { id: '2', title: 'Recent Overdue', deadline: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'Pending' };
  const futureSoon = { id: '3', title: 'Due Soon', deadline: new Date(Date.now() + 5 * 3600000).toISOString(), status: 'Pending' };
  const futureLate = { id: '4', title: 'Due Later', deadline: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'Pending' };
  const completedOverdue = { id: '5', title: 'Completed Past', deadline: new Date(Date.now() - 10 * 3600000).toISOString(), status: 'Completed' };

  const unsorted = [futureLate, completedOverdue, pastRecent, futureSoon, pastOld];
  const sorted = sortTasksChronologically(unsorted);

  assert.equal(sorted[0].id, '1', 'Oldest overdue should be top of list');
  assert.equal(sorted[1].id, '2', 'Recent overdue should be next');
  assert.equal(sorted[2].id, '3', 'Nearest upcoming deadline should follow overdue');
  assert.equal(sorted[3].id, '4', 'Later upcoming should follow');
  assert.equal(sorted[4].id, '5', 'Completed task should be last');
});
