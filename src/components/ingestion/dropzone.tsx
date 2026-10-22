import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { readExcelFile } from '@/ingestion/excel-reader';
import { processRawRows } from '@/ingestion/upsert-engine';
import { db } from '@/storage/db';
import { IngestionBatchResult } from '@/core/types/ledger';

interface DropzoneProps {
  onImportComplete?: (result: IngestionBatchResult) => void;
  compact?: boolean;
}

export function Dropzone({ onImportComplete, compact = false }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setErrorMessage('Please upload a valid Money Manager Excel (.xlsx) file.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      // 1. Read Excel sheets
      const { rows } = await readExcelFile(file);

      // 2. Fetch existing transaction IDs for deduplication
      const existingTx = await db.transactions.toArray();
      const existingIds = new Set(existingTx.map(t => t.id));

      // 3. Process & deduplicate
      const { toInsert, result } = processRawRows(rows, existingIds, file.name);

      // 4. Save to Dexie IndexedDB
      if (toInsert.length > 0) {
        await db.transactions.bulkPut(toInsert);
      }

      setIsLoading(false);
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Failed to parse file.';
      setErrorMessage(msg);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Import .xlsx</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 ${
          isDragging
            ? 'border-slate-900 bg-slate-100/70 scale-[0.99]'
            : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform mb-3 border border-slate-200">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
          ) : (
            <FileSpreadsheet className="w-6 h-6 text-slate-700" />
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">
            {isLoading ? 'Processing Money Manager export...' : 'Drop your Money Manager export (.xlsx) here'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            or click to browse from your device • 100% client-side zero-knowledge parsing
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60">
          <span>🔒 Private</span>
          <span>•</span>
          <span>⚡ SHA-256 Deduplication</span>
          <span>•</span>
          <span>🔄 Non-destructive Upsert</span>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

