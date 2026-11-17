'use client';

import React from 'react';
import { ColumnMapping, TaskFieldKey } from '@/types/excel';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ColumnMapperProps {
  mappings: ColumnMapping[];
  availableHeaders: string[];
  onMappingChange: (fieldKey: TaskFieldKey, newHeader: string | null) => void;
}

const fieldLabels: Record<TaskFieldKey, string> = {
  title: 'ชื่องาน',
  subject: 'วิชา / หมวดหมู่',
  description: 'รายละเอียด',
  startDate: 'วันเริ่มต้น',
  deadline: 'กำหนดส่ง',
  priority: 'ความสำคัญ',
  external_url: 'ลิงก์อ้างอิง',
};

export function ColumnMapper({
  mappings,
  availableHeaders,
  onMappingChange,
}: ColumnMapperProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            จับคู่คอลัมน์
          </h3>
          <p className="text-xs text-muted">
            ตรวจสอบหรือปรับการจับคู่คอลัมน์จากไฟล์ Excel กับช่องข้อมูลของ TaskFlow
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mappings.map((mapping) => {
          const isMatched = Boolean(mapping.matchedHeader);
          const hasError = mapping.required && !isMatched;

          return (
            <div
              key={mapping.fieldKey}
              className={cn(
                'p-3 rounded-lg border text-xs space-y-1.5 transition-colors',
                hasError
                  ? 'border-red-200 bg-red-50/50'
                  : isMatched
                  ? 'border-blue-200 bg-primary-50/50'
                  : 'border-neutral-200 bg-surface'
              )}
            >
              <div className="flex items-center justify-between font-medium">
                <span className="text-neutral-900 flex items-center gap-1">
                  {fieldLabels[mapping.fieldKey] ?? mapping.label}
                  {mapping.required && <span className="text-overdue">*</span>}
                </span>

                {isMatched ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-done shrink-0" />
                ) : mapping.required ? (
                  <AlertCircle className="w-3.5 h-3.5 text-overdue shrink-0" />
                ) : (
                  <span className="text-[10px] text-neutral-400 font-normal">
                    ไม่บังคับ
                  </span>
                )}
              </div>

              <select
                value={mapping.matchedHeader || ''}
                onChange={(e) =>
                  onMappingChange(
                    mapping.fieldKey,
                    e.target.value === '' ? null : e.target.value
                  )
                }
                className={cn(
                  'w-full py-1.5 px-2 rounded-md border text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white',
                  hasError
                    ? 'border-overdue text-overdue'
                    : 'border-neutral-200 text-neutral-800'
                )}
              >
                <option value="">— ไม่จับคู่ —</option>
                {availableHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
