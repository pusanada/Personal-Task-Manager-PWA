'use client';

import React, { useState } from 'react';
import { PreviewRow } from '@/types/excel';
import { TaskPriority } from '@/types/task';
import { Badge } from '@/components/ui/Badge';
import { formatDeadline } from '@/lib/dates/timezone';
import { getPriorityLabel } from '@/lib/labels';
import {
  Check,
  AlertTriangle,
  XCircle,
  Edit2,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ImportPreviewTableProps {
  rows: PreviewRow[];
  onToggleRow: (rowNumber: number) => void;
  onToggleAll: (selectAll: boolean) => void;
  onUpdateRow: (rowNumber: number, field: string, value: any) => void;
}

export function ImportPreviewTable({
  rows,
  onToggleRow,
  onToggleAll,
  onUpdateRow,
}: ImportPreviewTableProps) {
  const [editingRowNumber, setEditingRowNumber] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    subject: string;
    deadline: string;
    priority: TaskPriority;
  }>({
    title: '',
    subject: '',
    deadline: '',
    priority: 'Medium',
  });

  const selectedCount = rows.filter((r) => r.selected).length;
  const allSelected = selectedCount === rows.length && rows.length > 0;

  const startEditing = (row: PreviewRow) => {
    setEditingRowNumber(row.rowNumber);
    setEditForm({
      title: row.parsed.title,
      subject: row.parsed.subject || '',
      deadline: row.parsed.deadline ? row.parsed.deadline.slice(0, 16) : '',
      priority: row.parsed.priority,
    });
  };

  const saveEditing = (rowNumber: number) => {
    onUpdateRow(rowNumber, 'title', editForm.title);
    onUpdateRow(rowNumber, 'subject', editForm.subject || null);
    onUpdateRow(rowNumber, 'deadline', editForm.deadline ? new Date(editForm.deadline).toISOString() : null);
    onUpdateRow(rowNumber, 'priority', editForm.priority);
    setEditingRowNumber(null);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* ส่วนควบคุมด้านบน */}
      <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onToggleAll(e.target.checked)}
            className="w-4 h-4 rounded-sm border-neutral-300 text-primary focus:ring-primary"
          />
          <span>
            เลือกทั้งหมดที่ถูกต้อง (เลือกแล้ว {selectedCount} จาก {rows.length} แถว)
          </span>
        </label>

        <div className="text-xs text-muted">
          คลิกไอคอนแก้ไขในแต่ละแถวเพื่อแก้ไขข้อผิดพลาดก่อนบันทึก
        </div>
      </div>

      {/* ตาราง */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface text-muted font-medium border-b border-neutral-200">
            <tr>
              <th className="p-3 w-10 text-center">เลือก</th>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3 min-w-[200px]">ชื่องาน</th>
              <th className="p-3 min-w-[120px]">วิชา</th>
              <th className="p-3 min-w-[160px]">กำหนดส่ง</th>
              <th className="p-3 min-w-[90px]">ความสำคัญ</th>
              <th className="p-3 min-w-[180px]">สถานะตรวจสอบ</th>
              <th className="p-3 w-16 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-medium">
            {rows.map((row) => {
              const isEditing = editingRowNumber === row.rowNumber;
              const hasErrors = row.validation.errors.length > 0;
              const hasWarnings = row.validation.warnings.length > 0;

              return (
                <tr
                  key={row.rowNumber}
                  className={cn(
                    'transition-colors',
                    !row.selected && 'opacity-50 bg-surface/50',
                    hasErrors && 'bg-red-50/40',
                    hasWarnings && !hasErrors && 'bg-amber-50/30'
                  )}
                >
                  {/* Checkbox เลือก */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => onToggleRow(row.rowNumber)}
                      className="w-4 h-4 rounded-sm border-neutral-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>

                  {/* เลขแถว */}
                  <td className="p-3 text-center text-neutral-400">
                    {row.rowNumber}
                  </td>

                  {/* ชื่องาน */}
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-2 py-1 text-xs rounded border border-primary bg-white"
                        placeholder="ชื่องาน"
                      />
                    ) : (
                      <div className="font-semibold text-neutral-900 break-words">
                        {row.parsed.title || (
                          <span className="text-overdue italic">ไม่มีชื่องาน</span>
                        )}
                        {row.parsed.external_url && (
                          <a
                            href={row.parsed.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary hover:text-primary-dark ml-1.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  {/* วิชา */}
                  <td className="p-3 text-neutral-600">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.subject}
                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        className="w-full px-2 py-1 text-xs rounded border border-primary bg-white"
                        placeholder="วิชา"
                      />
                    ) : (
                      row.parsed.subject || <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  {/* กำหนดส่ง */}
                  <td className="p-3 text-neutral-700">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        className="w-full px-2 py-1 text-xs rounded border border-primary bg-white"
                      />
                    ) : row.parsed.deadline ? (
                      formatDeadline(row.parsed.deadline)
                    ) : (
                      <span className="text-overdue font-semibold">ไม่มีกำหนดส่ง</span>
                    )}
                  </td>

                  {/* ความสำคัญ */}
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value as TaskPriority })
                        }
                        className="w-full px-2 py-1 text-xs rounded border border-primary bg-white"
                      >
                        <option value="High">{getPriorityLabel('High')}</option>
                        <option value="Medium">{getPriorityLabel('Medium')}</option>
                        <option value="Low">{getPriorityLabel('Low')}</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          row.parsed.priority === 'High'
                            ? 'high'
                            : row.parsed.priority === 'Low'
                            ? 'low'
                            : 'medium'
                        }
                        size="sm"
                      >
                        {getPriorityLabel(row.parsed.priority)}
                      </Badge>
                    )}
                  </td>

                  {/* สถานะการตรวจสอบ */}
                  <td className="p-3">
                    <div className="space-y-1">
                      {row.validation.isValid && !hasWarnings && (
                        <span className="inline-flex items-center gap-1 text-done font-semibold">
                          <Check className="w-3.5 h-3.5" /> ถูกต้อง
                        </span>
                      )}

                      {row.validation.errors.map((err, i) => (
                        <div key={i} className="flex items-center gap-1 text-overdue">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{err}</span>
                        </div>
                      ))}

                      {row.validation.warnings.map((warn, i) => (
                        <div key={i} className="flex items-center gap-1 text-due-soon">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* จัดการ */}
                  <td className="p-3 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => saveEditing(row.rowNumber)}
                          className="p-1 rounded text-done hover:bg-green-50"
                          title="บันทึกแถว"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingRowNumber(null)}
                          className="p-1 rounded text-neutral-400 hover:bg-neutral-100"
                          title="ยกเลิก"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(row)}
                        className="p-1 rounded text-neutral-400 hover:text-primary hover:bg-neutral-100"
                        title="แก้ไขแถว"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
