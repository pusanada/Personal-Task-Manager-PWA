'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout, useTaskModal } from '@/components/layout/AppLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilterBar } from '@/components/tasks/TaskFilterBar';
import { DeleteConfirmModal } from '@/components/tasks/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types/task';
import { isTaskOverdue } from '@/lib/dates/timezone';
import { CheckSquare, AlertCircle, Sparkles } from 'lucide-react';

function TasksContent() {
  const { openAddTask, openEditTask } = useTaskModal();
  const { tasks, loading, toggleTask, updateTask, deleteTask } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active'); // 'Active', 'All', 'Pending', 'In Progress', 'Completed'
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Available subjects for dropdown
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    tasks.forEach((t) => {
      if (t.subject) subjects.add(t.subject);
    });
    return Array.from(subjects).sort();
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesSubject = task.subject ? task.subject.toLowerCase().includes(query) : false;
        const matchesDesc = task.description ? task.description.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesSubject && !matchesDesc) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'Active') {
        if (task.status === 'Completed') return false;
      } else if (statusFilter !== 'All') {
        if (task.status !== statusFilter) return false;
      }

      // 3. Priority Filter
      if (priorityFilter !== 'All') {
        if (task.priority !== priorityFilter) return false;
      }

      // 4. Subject Filter
      if (subjectFilter !== 'All') {
        if (task.subject !== subjectFilter) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, subjectFilter]);

  // Split active tasks into Overdue and Upcoming for clear visual distinction
  const overdueTasks = useMemo(() => {
    return filteredTasks.filter(
      (t) => t.status !== 'Completed' && isTaskOverdue(t.deadline)
    );
  }, [filteredTasks]);

  const nonOverdueTasks = useMemo(() => {
    return filteredTasks.filter(
      (t) => t.status === 'Completed' || !isTaskOverdue(t.deadline)
    );
  }, [filteredTasks]);

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setDeleteLoading(true);
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    await updateTask(id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            งานทั้งหมด
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            เรียงตามกำหนดส่งที่ใกล้ที่สุด งานที่เกินกำหนดจะแสดงก่อน
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <TaskFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        subjectFilter={subjectFilter}
        onSubjectFilterChange={setSubjectFilter}
        availableSubjects={availableSubjects}
        totalResults={filteredTasks.length}
      />

      {/* Loading */}
      {loading && tasks.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
          <div className="h-28 bg-neutral-100 rounded-lg" />
          <div className="h-28 bg-neutral-100 rounded-lg" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 p-12 text-center bg-white">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">
            ไม่พบงานที่ค้นหา
          </h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            {tasks.length === 0
              ? 'ยังไม่มีงานในรายการ เพิ่มงานใหม่ หรือนำเข้าจากไฟล์ Excel เพื่อเริ่มต้นใช้งาน'
              : 'ไม่มีงานที่ตรงกับการค้นหาหรือตัวกรองที่ตั้งไว้'}
          </p>
          {tasks.length === 0 && (
            <button
              onClick={openAddTask}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium"
            >
              เพิ่มงานแรก
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* งานเกินกำหนด */}
          {overdueTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-overdue">
                <AlertCircle className="w-4 h-4" />
                <span>เกินกำหนด ({overdueTasks.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={openEditTask}
                    onDelete={(t) => setDeletingTask(t)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* งานที่กำลังจะถึง */}
          <div className="space-y-3">
            {overdueTasks.length > 0 && (
              <div className="text-xs font-semibold text-muted">
                งานที่กำลังจะถึง ({nonOverdueTasks.length})
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nonOverdueTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onEdit={openEditTask}
                  onDelete={(t) => setDeletingTask(t)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}

export default function AllTasksPage() {
  return (
    <AppLayout>
      <TasksContent />
    </AppLayout>
  );
}
