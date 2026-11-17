'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  subjectFilter: string;
  onSubjectFilterChange: (subject: string) => void;
  availableSubjects: string[];
  totalResults: number;
}

export function TaskFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  subjectFilter,
  onSubjectFilterChange,
  availableSubjects,
  totalResults,
}: TaskFilterBarProps) {
  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'Active' ||
    priorityFilter !== 'All' ||
    subjectFilter !== 'All';

  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('Active');
    onPriorityFilterChange('All');
    onSubjectFilterChange('All');
  };

  const selectClass =
    'px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="space-y-3 bg-white p-4 rounded-xl border border-neutral-200">
      {/* ช่องค้นหา */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="ค้นหางาน วิชา หรือรายละเอียด..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-overdue hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      {/* ตัวกรอง */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-1.5 text-muted font-medium mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>ตัวกรอง:</span>
        </div>

        {/* สถานะ */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className={selectClass}
        >
          <option value="Active">งานที่ยังไม่เสร็จ</option>
          <option value="All">ทุกสถานะ</option>
          <option value="Pending">รอดำเนินการ</option>
          <option value="In Progress">กำลังทำ</option>
          <option value="Completed">เสร็จแล้ว</option>
        </select>

        {/* ความสำคัญ */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className={selectClass}
        >
          <option value="All">ทุกความสำคัญ</option>
          <option value="High">สูง</option>
          <option value="Medium">กลาง</option>
          <option value="Low">ต่ำ</option>
        </select>

        {/* วิชา */}
        {availableSubjects.length > 0 && (
          <select
            value={subjectFilter}
            onChange={(e) => onSubjectFilterChange(e.target.value)}
            className={selectClass}
          >
            <option value="All">ทุกวิชา ({availableSubjects.length})</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}

        <span className="ml-auto text-xs text-muted font-medium">
          พบ {totalResults} งาน
        </span>
      </div>
    </div>
  );
}
