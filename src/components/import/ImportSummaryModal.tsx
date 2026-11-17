'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ImportSummary } from '@/types/excel';

interface ImportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ImportSummary | null;
}

export function ImportSummaryModal({
  isOpen,
  onClose,
  summary,
}: ImportSummaryModalProps) {
  if (!summary) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Completed"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Excel Tasks Imported Successfully
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your schedule has been updated with the extracted tasks and deadlines.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Rows</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {summary.totalRows}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
            <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-semibold">
              Imported
            </span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {summary.imported}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Skipped (Excluded)</span>
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {summary.skipped}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
            <span className="text-rose-700 dark:text-rose-400 block text-[11px] font-semibold">
              Invalid (Errors)
            </span>
            <span className="text-lg font-bold text-rose-700 dark:text-rose-400">
              {summary.invalid}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Link href="/">
            <Button size="sm" className="gap-1.5">
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
