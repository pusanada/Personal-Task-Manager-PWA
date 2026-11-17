'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ExcelDropzoneProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  loading?: boolean;
}

export function ExcelDropzone({ onFileLoaded, loading = false }: ExcelDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('รองรับเฉพาะไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 15MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        onFileLoaded(e.target.result, file.name);
      }
    };
    reader.onerror = () => {
      setError('อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบว่าไฟล์ไม่เสียหาย');
    };
    reader.readAsArrayBuffer(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors duration-200 select-none',
          isDragOver
            ? 'border-primary bg-primary-50'
            : 'border-neutral-200 hover:border-primary bg-white',
          loading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="mx-auto w-14 h-14 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-4">
          {loading ? (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <UploadCloud className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
          ลากไฟล์ Excel มาวางที่นี่ หรือ{' '}
          <span className="text-primary underline underline-offset-2">
            เลือกไฟล์
          </span>
        </h3>
        <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-md mx-auto">
          รองรับไฟล์ <strong>.xlsx</strong> และ <strong>.xls</strong> — ตารางเรียน ใบสั่งงาน
          และตารางกำหนดส่งภาษาไทย/อังกฤษจะถูกตรวจจับโดยอัตโนมัติ
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="w-4 h-4 text-done" /> รองรับหลายชีต
          </span>
          <span>•</span>
          <span>จับคู่คอลัมน์ภาษาไทย/อังกฤษอัตโนมัติ</span>
          <span>•</span>
          <span>ตรวจสอบก่อนบันทึก</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs font-medium rounded-lg bg-red-50 text-overdue border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
