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
      title="นำเข้าเสร็จสมบูรณ์"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-green-50 text-done mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h4 className="text-base font-semibold text-neutral-900">
            นำเข้างานจาก Excel สำเร็จ
          </h4>
          <p className="text-xs text-muted mt-0.5">
            ตารางของคุณได้รับการอัปเดตด้วยงานและกำหนดส่งที่ดึงมาแล้ว
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-lg bg-surface border border-neutral-200">
            <span className="text-muted block text-[11px]">แถวทั้งหมด</span>
            <span className="text-lg font-semibold text-neutral-900">
              {summary.totalRows}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <span className="text-done block text-[11px] font-medium">
              นำเข้าแล้ว
            </span>
            <span className="text-lg font-semibold text-done">
              {summary.imported}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-neutral-200">
            <span className="text-muted block text-[11px]">ข้าม (ไม่เลือก)</span>
            <span className="text-lg font-semibold text-neutral-700">
              {summary.skipped}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <span className="text-overdue block text-[11px] font-medium">
              ไม่ถูกต้อง
            </span>
            <span className="text-lg font-semibold text-overdue">
              {summary.invalid}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิด
          </Button>
          <Link href="/">
            <Button size="sm" className="gap-1.5">
              <span>ไปที่ภาพรวม</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
