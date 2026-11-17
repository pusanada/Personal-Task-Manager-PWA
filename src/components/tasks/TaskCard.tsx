'use client';

import React from 'react';
import {
  Clock,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { getPriorityLabelShort, getStatusLabel } from '@/lib/labels';
import {
  formatDeadline,
  getRemainingTimeString,
  isTaskOverdue,
} from '@/lib/dates/timezone';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, currentStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
}

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isCompleted = task.status === 'Completed';
  const timeInfo = getRemainingTimeString(task.deadline);
  const isOverdue = !isCompleted && isTaskOverdue(task.deadline);

  const priorityVariants = {
    High: 'high' as const,
    Medium: 'medium' as const,
    Low: 'low' as const,
  };

  const statusVariants = {
    Pending: 'pending' as const,
    'In Progress': 'in_progress' as const,
    Completed: 'completed' as const,
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border p-4 transition-colors bg-white',
        isCompleted
          ? 'border-neutral-200 opacity-70'
          : isOverdue
          ? 'border-red-200'
          : timeInfo.urgency === 'urgent'
          ? 'border-amber-200'
          : 'border-neutral-200 hover:border-neutral-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox วงกลมสไตล์ Things 3 / Google Tasks */}
        <button
          onClick={() => onToggle(task.id, task.status)}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary shrink-0',
            isCompleted
              ? 'bg-done border-done text-white'
              : 'border-neutral-300 hover:border-primary hover:bg-neutral-50'
          )}
          aria-label={isCompleted ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
        >
          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* เนื้อหา */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-[15px] font-medium text-neutral-900 leading-snug break-words',
                isCompleted && 'line-through text-muted'
              )}
            >
              {task.title}
            </h4>

            {/* เมนู */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="ตัวเลือกงาน"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-white border border-neutral-200 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-overdue hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* วิชา / หมวดหมู่ */}
          {task.subject && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted">
              <Tag className="w-3 h-3" />
              <span>{task.subject}</span>
            </div>
          )}

          {task.description && (
            <p className="mt-1.5 text-xs text-muted line-clamp-2">
              {task.description}
            </p>
          )}

          {/* ป้ายกำกับและกำหนดส่ง */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* ความสำคัญ */}
            <Badge variant={priorityVariants[task.priority]} size="sm">
              {getPriorityLabelShort(task.priority)}
            </Badge>

            {/* สถานะ */}
            {onStatusChange ? (
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="text-[11px] font-medium py-0.5 px-2 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Pending">{getStatusLabel('Pending')}</option>
                <option value="In Progress">{getStatusLabel('In Progress')}</option>
                <option value="Completed">{getStatusLabel('Completed')}</option>
              </select>
            ) : (
              <Badge variant={statusVariants[task.status]} size="sm">
                {getStatusLabel(task.status)}
              </Badge>
            )}

            {/* กำหนดส่ง */}
            {task.deadline ? (
              <div
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md',
                  isCompleted
                    ? 'text-neutral-400'
                    : isOverdue
                    ? 'bg-red-50 text-overdue font-semibold'
                    : timeInfo.urgency === 'urgent' || timeInfo.urgency === 'warning'
                    ? 'bg-amber-50 text-due-soon font-semibold'
                    : 'text-muted'
                )}
                title={formatDeadline(task.deadline)}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3 shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 shrink-0" />
                )}
                <span>
                  {formatDeadline(task.deadline, undefined, false)} ·{' '}
                  <span className="font-semibold">{timeInfo.label}</span>
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> ไม่ได้ระบุกำหนดส่ง
              </span>
            )}

            {/* ลิงก์ภายนอก */}
            {task.external_url && (
              <a
                href={
                  task.external_url.startsWith('http')
                    ? task.external_url
                    : `https://${task.external_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline ml-auto"
                title={task.external_url}
              >
                <ExternalLink className="w-3 h-3" />
                <span>ลิงก์</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
