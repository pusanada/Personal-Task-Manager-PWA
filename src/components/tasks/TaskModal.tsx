'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Task, TaskPriority, TaskStatus, TaskCreateInput } from '@/types/task';
import { formatInTimeZone } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '@/lib/dates/timezone';
import { getPriorityLabel, getStatusLabel } from '@/lib/labels';

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
      // ค่าเริ่มต้นสำหรับงานใหม่: พรุ่งนี้ เวลา 23:59
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
      errs.title = 'กรุณากรอกชื่องาน';
    }

    if (!deadlineDate) {
      errs.deadlineDate = 'กรุณาเลือกวันกำหนดส่ง';
    }

    if (externalUrl.trim()) {
      try {
        const urlToTest = externalUrl.startsWith('http')
          ? externalUrl
          : `https://${externalUrl}`;
        new URL(urlToTest);
      } catch {
        errs.externalUrl = 'รูปแบบ URL ไม่ถูกต้อง (เช่น https://example.com)';
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
        // สร้าง ISO string ตามเขตเวลา Asia/Bangkok (+07:00)
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
      const msg = err instanceof Error ? err.message : 'บันทึกงานไม่สำเร็จ';
      setErrors({ form: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}
      description={
        initialTask
          ? 'แก้ไขรายละเอียดงานด้านล่าง'
          : 'เพิ่มงานใหม่เข้าไปในตารางของคุณ พร้อมติดตามกำหนดส่ง'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 text-xs font-medium rounded-lg bg-red-50 text-overdue border border-red-200">
            {errors.form}
          </div>
        )}

        {/* ชื่องาน */}
        <Input
          label="ชื่องาน *"
          placeholder="เช่น รายงานโปรเจกต์จบ, การบ้านคณิต 4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        {/* วิชา & ความสำคัญ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="วิชา / หมวดหมู่"
            placeholder="เช่น CS101, คณิตศาสตร์, ฟิสิกส์"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Select
            label="ความสำคัญ"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="High">{getPriorityLabel('High')}</option>
            <option value="Medium">{getPriorityLabel('Medium')}</option>
            <option value="Low">{getPriorityLabel('Low')}</option>
          </Select>
        </div>

        {/* วัน & เวลากำหนดส่ง */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="วันกำหนดส่ง *"
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            error={errors.deadlineDate}
          />

          <Input
            label="เวลากำหนดส่ง"
            type="time"
            value={deadlineTime}
            onChange={(e) => setDeadlineTime(e.target.value)}
            helperText="ค่าเริ่มต้น: 23:59 (เวลาประเทศไทย)"
          />
        </div>

        {/* สถานะ */}
        <Select
          label="สถานะ"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          <option value="Pending">{getStatusLabel('Pending')}</option>
          <option value="In Progress">{getStatusLabel('In Progress')}</option>
          <option value="Completed">{getStatusLabel('Completed')}</option>
        </Select>

        {/* ลิงก์อ้างอิง */}
        <Input
          label="ลิงก์อ้างอิง (URL)"
          placeholder="เช่น Google Drive, LMS, ลิงก์งานใน Canvas"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          error={errors.externalUrl}
        />

        {/* รายละเอียด */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">
            รายละเอียด / บันทึกย่อ
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            placeholder="เพิ่มเกณฑ์การให้คะแนน คำแนะนำ หรือบันทึกกลุ่ม..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ปุ่มดำเนินการ */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button type="submit" loading={saving}>
            {initialTask ? 'บันทึกการแก้ไข' : 'เพิ่มงาน'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
