'use client';

import React from 'react';
import {
  Calendar,
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
        'group relative rounded-xl border p-4 transition-all duration-200 shadow-xs hover:shadow-md bg-white dark:bg-slate-900',
        isCompleted
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-70 bg-slate-50/50 dark:bg-slate-900/40'
          : isOverdue
          ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10'
          : timeInfo.urgency === 'urgent'
          ? 'border-amber-300 dark:border-amber-900/80'
          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, task.status)}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 shrink-0',
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
          )}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-sm font-semibold text-slate-900 dark:text-white leading-tight break-words',
                isCompleted && 'line-through text-slate-500 dark:text-slate-400'
              )}
            >
              {task.title}
            </h4>

            {/* Actions Menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Task options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subject & Description */}
          {task.subject && (
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <Tag className="w-3 h-3" />
              <span>{task.subject}</span>
            </div>
          )}

          {task.description && (
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges and metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Priority */}
            <Badge variant={priorityVariants[task.priority]} size="sm">
              {task.priority}
            </Badge>

            {/* Status Switcher pill */}
            {onStatusChange ? (
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="text-[11px] font-medium py-0.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="In Progress">⚡ In Progress</option>
                <option value="Completed">✅ Completed</option>
              </select>
            ) : (
              <Badge variant={statusVariants[task.status]} size="sm">
                {task.status}
              </Badge>
            )}

            {/* Deadline & Remaining Time */}
            {task.deadline ? (
              <div
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md',
                  isCompleted
                    ? 'text-slate-400'
                    : isOverdue
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 font-semibold'
                    : timeInfo.urgency === 'urgent'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                )}
                title={formatDeadline(task.deadline)}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 shrink-0" />
                )}
                <span>
                  {formatDeadline(task.deadline, undefined, false)} •{' '}
                  <span className="font-semibold">{timeInfo.label}</span>
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> No deadline
              </span>
            )}

            {/* External URL */}
            {task.external_url && (
              <a
                href={
                  task.external_url.startsWith('http')
                    ? task.external_url
                    : `https://${task.external_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline ml-auto"
                title={task.external_url}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Link</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
