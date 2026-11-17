'use client';

import React, { useState } from 'react';
import { PreviewRow } from '@/types/excel';
import { TaskPriority } from '@/types/task';
import { Badge } from '@/components/ui/Badge';
import { formatDeadline } from '@/lib/dates/timezone';
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Header controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleAll(e.target.checked)}
              className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Select All Valid ({selectedCount} of {rows.length} rows selected)</span>
          </label>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Click the edit icon on any row to fix errors before saving.
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3 w-10 text-center">Include</th>
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3 min-w-[200px]">Task Name</th>
              <th className="p-3 min-w-[120px]">Subject</th>
              <th className="p-3 min-w-[160px]">Deadline</th>
              <th className="p-3 min-w-[90px]">Priority</th>
              <th className="p-3 min-w-[180px]">Validation Status</th>
              <th className="p-3 w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {rows.map((row) => {
              const isEditing = editingRowNumber === row.rowNumber;
              const hasErrors = row.validation.errors.length > 0;
              const hasWarnings = row.validation.warnings.length > 0;

              return (
                <tr
                  key={row.rowNumber}
                  className={cn(
                    'transition-colors',
                    !row.selected && 'opacity-50 bg-slate-50/40 dark:bg-slate-950/20',
                    hasErrors && 'bg-rose-50/30 dark:bg-rose-950/10',
                    hasWarnings && !hasErrors && 'bg-amber-50/20 dark:bg-amber-950/10'
                  )}
                >
                  {/* Select Checkbox */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => onToggleRow(row.rowNumber)}
                      className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* Row # */}
                  <td className="p-3 text-center text-slate-400">
                    {row.rowNumber}
                  </td>

                  {/* Task Title */}
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-2 py-1 text-xs rounded border border-indigo-400 bg-white dark:bg-slate-900"
                        placeholder="Task Title"
                      />
                    ) : (
                      <div className="font-semibold text-slate-900 dark:text-white break-words">
                        {row.parsed.title || (
                          <span className="text-rose-500 italic">Missing title</span>
                        )}
                        {row.parsed.external_url && (
                          <a
                            href={row.parsed.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-500 hover:text-indigo-600 ml-1.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Subject */}
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.subject}
                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        className="w-full px-2 py-1 text-xs rounded border border-indigo-400 bg-white dark:bg-slate-900"
                        placeholder="Subject"
                      />
                    ) : (
                      row.parsed.subject || <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="p-3 text-slate-700 dark:text-slate-200">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        className="w-full px-2 py-1 text-xs rounded border border-indigo-400 bg-white dark:bg-slate-900"
                      />
                    ) : row.parsed.deadline ? (
                      formatDeadline(row.parsed.deadline)
                    ) : (
                      <span className="text-rose-500 font-semibold">Missing deadline</span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value as TaskPriority })
                        }
                        className="w-full px-2 py-1 text-xs rounded border border-indigo-400 bg-white dark:bg-slate-900"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
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
                        {row.parsed.priority}
                      </Badge>
                    )}
                  </td>

                  {/* Validation Status */}
                  <td className="p-3">
                    <div className="space-y-1">
                      {row.validation.isValid && !hasWarnings && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Valid
                        </span>
                      )}

                      {row.validation.errors.map((err, i) => (
                        <div key={i} className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{err}</span>
                        </div>
                      ))}

                      {row.validation.warnings.map((warn, i) => (
                        <div key={i} className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => saveEditing(row.rowNumber)}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                          title="Save row"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingRowNumber(null)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(row)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit row"
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
