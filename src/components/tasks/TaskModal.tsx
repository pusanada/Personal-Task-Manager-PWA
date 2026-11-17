'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Task, TaskPriority, TaskStatus, TaskCreateInput } from '@/types/task';
import { formatInTimeZone } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '@/lib/dates/timezone';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  onSave: (data: TaskCreateInput) => Promise<void>;
}

export function TaskModal({
  isOpen,
  onClose,
  initialTask,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [externalUrl, setExternalUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setSubject(initialTask.subject || '');
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority || 'Medium');
      setStatus(initialTask.status || 'Pending');
      setExternalUrl(initialTask.external_url || '');

      if (initialTask.deadline) {
        try {
          const d = new Date(initialTask.deadline);
          setDeadlineDate(formatInTimeZone(d, DEFAULT_TIMEZONE, 'yyyy-MM-dd'));
          setDeadlineTime(formatInTimeZone(d, DEFAULT_TIMEZONE, 'HH:mm'));
        } catch {
          setDeadlineDate('');
          setDeadlineTime('23:59');
        }
      } else {
        setDeadlineDate('');
        setDeadlineTime('23:59');
      }
    } else {
      // Defaults for new task: tomorrow at 23:59
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTitle('');
      setSubject('');
      setDescription('');
      setDeadlineDate(formatInTimeZone(tomorrow, DEFAULT_TIMEZONE, 'yyyy-MM-dd'));
      setDeadlineTime('23:59');
      setPriority('Medium');
      setStatus('Pending');
      setExternalUrl('');
    }
    setErrors({});
  }, [initialTask, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Task title is required.';
    }

    if (!deadlineDate) {
      errs.deadlineDate = 'Deadline date is required.';
    }

    if (externalUrl.trim()) {
      try {
        const urlToTest = externalUrl.startsWith('http')
          ? externalUrl
          : `https://${externalUrl}`;
        new URL(urlToTest);
      } catch {
        errs.externalUrl = 'Please enter a valid URL (e.g. https://example.com)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);

      let finalDeadline: string | null = null;
      if (deadlineDate) {
        const timePart = deadlineTime || '23:59';
        // Construct ISO string in Asia/Bangkok (+07:00)
        const dateString = `${deadlineDate}T${timePart}:00+07:00`;
        finalDeadline = new Date(dateString).toISOString();
      }

      await onSave({
        title: title.trim(),
        subject: subject.trim() || null,
        description: description.trim() || null,
        deadline: finalDeadline,
        priority,
        status,
        external_url: externalUrl.trim() || null,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save task';
      setErrors({ form: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Create New Task'}
      description={
        initialTask
          ? 'Update the assignment or project details below.'
          : 'Add a new task to your schedule and track its deadline.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {errors.form}
          </div>
        )}

        {/* Title */}
        <Input
          label="Task Title *"
          placeholder="e.g. Final Project Report, Calculus HW 4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        {/* Subject & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Subject / Category"
            placeholder="e.g. CS101, Math, Physics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </Select>
        </div>

        {/* Deadline Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Deadline Date *"
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            error={errors.deadlineDate}
          />

          <Input
            label="Deadline Time"
            type="time"
            value={deadlineTime}
            onChange={(e) => setDeadlineTime(e.target.value)}
            helperText="Default: 23:59 (Asia/Bangkok)"
          />
        </div>

        {/* Status */}
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          <option value="Pending">⏳ Pending</option>
          <option value="In Progress">⚡ In Progress</option>
          <option value="Completed">✅ Completed</option>
        </Select>

        {/* External Link */}
        <Input
          label="Resource Link / Reference URL"
          placeholder="e.g. Google Drive, LMS, Canvas assignment URL"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          error={errors.externalUrl}
        />

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Description / Notes
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            placeholder="Add rubrics, instructions, or group member notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {initialTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
