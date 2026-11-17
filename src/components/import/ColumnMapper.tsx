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

export function ColumnMapper({
  mappings,
  availableHeaders,
  onMappingChange,
}: ColumnMapperProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Column Mapping
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify or customize how columns from your Excel file match TaskFlow fields.
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
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                  : isMatched
                  ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
              )}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900 dark:text-slate-200 flex items-center gap-1">
                  {mapping.label}
                  {mapping.required && <span className="text-rose-500">*</span>}
                </span>

                {isMatched ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : mapping.required ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
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
                  'w-full py-1.5 px-2 rounded-md border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-900',
                  hasError
                    ? 'border-rose-400 text-rose-800 dark:text-rose-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                )}
              >
                <option value="">— Unmapped (None) —</option>
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
