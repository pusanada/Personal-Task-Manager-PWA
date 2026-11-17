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
        setError('No sheets found in the uploaded workbook.');
        return;
      }

      setFileName(name);
      setSheetNames(parsed.sheetNames);
      setSheetsData(parsed.sheets);

      const firstSheet = parsed.sheetNames[0];
      setActiveSheet(firstSheet);
      setupSheet(firstSheet, parsed.sheets[firstSheet]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse Excel workbook';
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
        if (!hasTitle) errors.push('Task title is required');
        if (!hasDeadline) errors.push('Deadline is required');

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
      setError('Please select at least one row to import.');
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
      const msg = err instanceof Error ? err.message : 'Import failed';
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
              <span>Import Tasks from Excel</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Upload spreadsheets (.xlsx / .xls) to automatically extract assignment names, categories, and deadlines.
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
              <span>Upload Different File</span>
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State 1: Dropzone if no file loaded */}
        {!fileName ? (
          <div className="space-y-4">
            <ExcelDropzone onFileLoaded={handleFileLoaded} />

            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Need a sample file to test?
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Download a pre-formatted university syllabus spreadsheet:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/sample-tasks-th.xlsx"
                  download
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:border-indigo-400 transition-colors"
                >
                  📥 Thai Template (.xlsx)
                </a>
                <a
                  href="/sample-tasks-en.xlsx"
                  download
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:border-indigo-400 transition-colors"
                >
                  📥 English Template (.xlsx)
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sheet selector & Active file summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {fileName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {sheetsData[activeSheet]?.rows.length || 0} rows found in current sheet
                  </p>
                </div>
              </div>

              {sheetNames.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Sheet:
                  </span>
                  <select
                    value={activeSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {sheetNames.map((name) => (
                      <option key={name} value={name}>
                        {name} ({sheetsData[name]?.rows.length || 0} rows)
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
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Import Preview & Verification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review extracted records, exclude unwanted rows, or edit dates directly.
                  </p>
                </div>

                {/* Import Confirmation CTA buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset} disabled={importing}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmImport}
                    loading={importing}
                    disabled={selectedCount === 0}
                    className="gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Confirm Import ({selectedCount} Tasks)</span>
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
