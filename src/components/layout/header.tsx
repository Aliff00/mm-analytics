import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportSnapshot, restoreSnapshot, clearAllData } from '@/storage/snapshot';
import { loadSampleData } from '@/storage/sample-data';
import { Dropzone } from '@/components/ingestion/dropzone';
import {
  Download,
  Upload,
  Trash2,
  Cloud,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenDriveModal: () => void;
  onImportComplete: (result: any) => void;
  totalTransactionsCount: number;
}

export function Header({
  onOpenDriveModal,
  onImportComplete,
  totalTransactionsCount,
}: HeaderProps) {
  const [iconError, setIconError] = useState(false);
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
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo & App Icon */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 shadow-xs shrink-0 flex items-center justify-center bg-white text-slate-900">
              {!iconError ? (
                <img
                  src="/icons/app-icon.png"
                  alt="mm-analytics icon"
                  className="w-full h-full object-contain p-0.5"
                  onError={() => setIconError(true)}
                />
              ) : (
                <span className="font-bold text-xs tracking-tighter text-slate-900">mm</span>
              )}
            </div>
            <span className="font-semibold text-sm text-slate-900 tracking-tight">mm-analytics</span>
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
              <span className="hidden sm:inline text-xs">Cloud Sync</span>
            </Button>

            {/* Snapshot Backup / Restore Actions */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportSnapshot()}
                disabled={totalTransactionsCount === 0}
                title="Download JSON Snapshot backup"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline text-xs">Backup</span>
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
                <span className="hidden md:inline text-xs">Restore</span>
              </Button>

              {totalTransactionsCount === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDemo}
                  className="bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100/70 text-xs"
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
