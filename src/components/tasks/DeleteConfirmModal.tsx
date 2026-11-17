'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { Task } from '@/types/task';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  task,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ลบงาน"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 text-neutral-700 border border-red-200">
          <AlertTriangle className="w-5 h-5 shrink-0 text-overdue mt-0.5" />
          <p className="text-xs leading-relaxed">
            ต้องการลบงาน{' '}
            <strong className="font-semibold text-neutral-900">
              &quot;{task.title}&quot;
            </strong>{' '}
            อย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            ยกเลิก
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            ลบงาน
          </Button>
        </div>
      </div>
    </Modal>
  );
}
