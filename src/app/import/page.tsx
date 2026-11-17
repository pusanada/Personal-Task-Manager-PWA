'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExcelDropzone } from '@/components/import/ExcelDropzone';
import { ColumnMapper } from '@/components/import/ColumnMapper';
import { ImportPreviewTable } from '@/components/import/ImportPreviewTable';
import { ImportSummaryModal } from '@/components/import/ImportSummaryModal';
import { Button } from '@/components/ui/Button';
import { parseWorkbook } from '@/lib/excel/parser';
import { autoMatchColumns } from '@/lib/excel/columnMatcher';
import { validateAndBuildPreviewRows } from '@/lib/excel/validator';
import { useTasks } from '@/hooks/useTasks';
import { bulkImportTasks } from '@/services/taskService';
import {
  ColumnMapping,
  PreviewRow,
  TaskFieldKey,
  ImportSummary,
  ParsedSheetData,
} from '@/types/excel';
import {
  FileSpreadsheet,
  Layers,
  RotateCcw,
  AlertTriangle,
  Upload,
} from 'lucide-react';

export default function ExcelImportPage() {
  const { tasks: existingTasks, loadTasks } = useTasks();

  const [fileName, setFileName] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [sheetsData, setSheetsData] = useState<Record<string, ParsedSheetData>>({});
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState<boolean>(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // When a file is loaded
  const handleFileLoaded = (buffer: ArrayBuffer, name: string) => {
    try {
      setError(null);
      const parsed = parseWorkbook(buffer);
      if (parsed.sheetNames.length === 0) {
        setError('ไม่พบชีตในไฟล์ที่อัปโหลด');
        return;
      }

      setFileName(name);
      setSheetNames(parsed.sheetNames);
      setSheetsData(parsed.sheets);

      const firstSheet = parsed.sheetNames[0];
      setActiveSheet(firstSheet);
      setupSheet(firstSheet, parsed.sheets[firstSheet]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'อ่านไฟล์ Excel ไม่สำเร็จ';
      setError(msg);
    }
  };

  const setupSheet = (name: string, sheetData: ParsedSheetData) => {
    const matched = autoMatchColumns(sheetData.headers);
    setMappings(matched);

    const rows = validateAndBuildPreviewRows(
      sheetData.rows,
      matched,
      existingTasks
    );
    setPreviewRows(rows);
  };

  const handleSheetChange = (newSheet: string) => {
    setActiveSheet(newSheet);
    if (sheetsData[newSheet]) {
      setupSheet(newSheet, sheetsData[newSheet]);
    }
  };

  const handleMappingChange = (fieldKey: TaskFieldKey, newHeader: string | null) => {
    const updated = mappings.map((m) =>
      m.fieldKey === fieldKey ? { ...m, matchedHeader: newHeader } : m
    );
    setMappings(updated);

    if (sheetsData[activeSheet]) {
      const rows = validateAndBuildPreviewRows(
        sheetsData[activeSheet].rows,
        updated,
        existingTasks
      );
      setPreviewRows(rows);
    }
  };

  const handleToggleRow = (rowNumber: number) => {
    setPreviewRows((prev) =>
      prev.map((r) =>
        r.rowNumber === rowNumber ? { ...r, selected: !r.selected } : r
      )
    );
  };

  const handleToggleAll = (selectAll: boolean) => {
    setPreviewRows((prev) =>
      prev.map((r) => ({
        ...r,
        selected: selectAll ? r.validation.isValid : false,
      }))
    );
  };

  const handleUpdateRow = (rowNumber: number, field: string, value: any) => {
    setPreviewRows((prev) =>
      prev.map((r) => {
        if (r.rowNumber !== rowNumber) return r;
        const updatedParsed = { ...r.parsed, [field]: value };
        const hasTitle = Boolean(updatedParsed.title && updatedParsed.title.trim());
        const hasDeadline = Boolean(updatedParsed.deadline);
        const errors: string[] = [];
        if (!hasTitle) errors.push('กรุณากรอกชื่องาน');
        if (!hasDeadline) errors.push('กรุณาระบุกำหนดส่ง');

        return {
          ...r,
          parsed: updatedParsed,
          validation: {
            ...r.validation,
            isValid: errors.length === 0,
            errors,
          },
          selected: errors.length === 0 ? true : r.selected,
        };
      })
    );
  };

  const handleReset = () => {
    setFileName(null);
    setSheetNames([]);
    setActiveSheet('');
    setSheetsData({});
    setMappings([]);
    setPreviewRows([]);
    setError(null);
  };

  const handleConfirmImport = async () => {
    const selectedRows = previewRows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      setError('กรุณาเลือกอย่างน้อย 1 แถวเพื่อนำเข้า');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      const tasksToImport = selectedRows.map((r) => ({
        title: r.parsed.title,
        subject: r.parsed.subject || null,
        description: r.parsed.description || null,
        deadline: r.parsed.deadline || null,
        priority: r.parsed.priority,
        status: 'Pending' as const,
        external_url: r.parsed.external_url || null,
      }));

      await bulkImportTasks(tasksToImport);
      await loadTasks();

      // Compute summary
      const totalRows = previewRows.length;
      const imported = selectedRows.length;
      const skipped = totalRows - imported;
      const invalid = previewRows.filter((r) => !r.validation.isValid).length;
      const duplicates = previewRows.filter((r) => r.validation.isDuplicate).length;

      setSummary({
        totalRows,
        imported,
        skipped,
        invalid,
        duplicates,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'นำเข้าไม่สำเร็จ';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = previewRows.filter((r) => r.selected).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-done" />
              <span>นำเข้างานจาก Excel</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              อัปโหลดไฟล์สเปรดชีต (.xlsx / .xls) เพื่อดึงชื่องาน หมวดหมู่ และกำหนดส่งโดยอัตโนมัติ
            </p>
          </div>

          {fileName && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>เลือกไฟล์ใหม่</span>
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 text-xs font-medium rounded-lg bg-red-50 text-overdue border border-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State 1: Dropzone if no file loaded */}
        {!fileName ? (
          <div className="space-y-4">
            <ExcelDropzone onFileLoaded={handleFileLoaded} />

            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-neutral-200 text-xs">
              <div>
                <span className="font-medium text-neutral-800 block">
                  ต้องการไฟล์ตัวอย่างเพื่อทดสอบ?
                </span>
                <span className="text-muted">
                  ดาวน์โหลดไฟล์ตารางเรียนที่จัดรูปแบบไว้แล้ว:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/sample-tasks-th.xlsx"
                  download
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium hover:border-primary transition-colors"
                >
                  📥 ไฟล์ตัวอย่างภาษาไทย (.xlsx)
                </a>
                <a
                  href="/sample-tasks-en.xlsx"
                  download
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium hover:border-primary transition-colors"
                >
                  📥 ไฟล์ตัวอย่างภาษาอังกฤษ (.xlsx)
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* แถบสรุปไฟล์และเลือกชีต */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-done">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {fileName}
                  </h4>
                  <p className="text-xs text-muted">
                    พบ {sheetsData[activeSheet]?.rows.length || 0} แถวในชีตนี้
                  </p>
                </div>
              </div>

              {sheetNames.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted font-medium flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    ชีต:
                  </span>
                  <select
                    value={activeSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {sheetNames.map((name) => (
                      <option key={name} value={name}>
                        {name} ({sheetsData[name]?.rows.length || 0} แถว)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Column Mapping Section */}
            <ColumnMapper
              mappings={mappings}
              availableHeaders={sheetsData[activeSheet]?.headers || []}
              onMappingChange={handleMappingChange}
            />

            {/* Preview Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    ตรวจสอบข้อมูลก่อนนำเข้า
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    ตรวจทานข้อมูลที่ดึงมา หักแถวที่ไม่ต้องการออก หรือแก้ไขวันที่ได้โดยตรง
                  </p>
                </div>

                {/* ปุ่มยืนยันนำเข้า */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset} disabled={importing}>
                    ยกเลิก
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmImport}
                    loading={importing}
                    disabled={selectedCount === 0}
                    className="gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>นำเข้า {selectedCount} งาน</span>
                  </Button>
                </div>
              </div>

              <ImportPreviewTable
                rows={previewRows}
                onToggleRow={handleToggleRow}
                onToggleAll={handleToggleAll}
                onUpdateRow={handleUpdateRow}
              />
            </div>
          </div>
        )}

        {/* Import Summary Modal */}
        <ImportSummaryModal
          isOpen={Boolean(summary)}
          onClose={() => setSummary(null)}
          summary={summary}
        />
      </div>
    </AppLayout>
  );
}
