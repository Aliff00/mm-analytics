import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { formatMonthName } from '@/core/utils/dates';
import { exportSnapshot, restoreSnapshot, clearAllData } from '@/storage/snapshot';
import { loadSampleData } from '@/storage/sample-data';
import { Dropzone } from '@/components/ingestion/dropzone';
import {
  Calendar,
  Download,
  Upload,
  Trash2,
  Cloud,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  availableMonths: string[];
  activeMonth: string;
  onSelectMonth: (month: string) => void;
  onOpenBudgetModal: () => void;
  onOpenDriveModal: () => void;
  onImportComplete: (result: any) => void;
  totalTransactionsCount: number;
}

export function Header({
  availableMonths,
  activeMonth,
  onSelectMonth,
  onOpenBudgetModal,
  onOpenDriveModal,
  onImportComplete,
  totalTransactionsCount,
}: HeaderProps) {
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const res = await restoreSnapshot(e.target.files[0]);
        alert(`Snapshot restored successfully! Loaded ${res.restoredCount} transactions.`);
      } catch (err: any) {
        alert(`Failed to restore snapshot: ${err.message}`);
      }
      e.target.value = '';
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete all local transactions and budget configurations from your browser?')) {
      await clearAllData();
    }
  };

  const handleLoadDemo = async () => {
    const count = await loadSampleData();
    alert(`Loaded ${count} sample iOS Money Manager transactions across 3 months!`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs shrink-0">
              <img
                src="/icons/app-icon.jpg"
                alt="mm-analytics icon"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center -z-0">mm</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">mm-analytics</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/70">
                  iOS Spec
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Zero-liability client-side BI for Money Manager
              </p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={activeMonth}
                onChange={(e) => onSelectMonth(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 appearance-none cursor-pointer"
              >
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonthName(ym)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 text-slate-400 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBudgetModal}
              title="Edit monthly budget benchmarks"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Budget</span>
            </Button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Quick compact import */}
            <Dropzone onImportComplete={onImportComplete} compact />

            {/* Google Drive sync modal trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenDriveModal}
              title="Cloud Sync with Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Cloud Sync</span>
            </Button>

            {/* Snapshot Backup / Restore Actions */}
            <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportSnapshot()}
                disabled={totalTransactionsCount === 0}
                title="Download JSON Snapshot backup"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline">Backup</span>
              </Button>

              <input
                ref={restoreInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => restoreInputRef.current?.click()}
                title="Restore from JSON Snapshot"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline">Restore</span>
              </Button>

              {totalTransactionsCount === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDemo}
                  className="bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100/70"
                  title="Load demo data for instant inspection"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo</span>
                </Button>
              )}

              {totalTransactionsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearData}
                  className="text-rose-600 hover:bg-rose-50"
                  title="Purge all local data"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

