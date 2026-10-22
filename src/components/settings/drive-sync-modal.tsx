import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { driveClient } from '@/storage/drive/client';
import { db } from '@/storage/db';
import { Cloud, Lock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DriveSyncModal({ isOpen, onClose }: DriveSyncModalProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleManualSync = async () => {
    if (!tokenInput.trim() && !driveClient.hasToken()) {
      setErrorMessage('Please provide an OAuth Access Token with drive.file scope.');
      return;
    }

    try {
      setIsSyncing(true);
      setErrorMessage(null);
      setStatusMessage('Connecting directly to Google Drive REST API...');

      if (tokenInput.trim()) {
        driveClient.setToken(tokenInput.trim());
      }

      // Check if file exists in Drive
      const existing = await driveClient.findMasterFile();

      // Export local state
      const transactions = await db.transactions.toArray();
      const rawBudgets = await db.budgets.toArray();
      const budgets: Record<string, any> = {};
      for (const b of rawBudgets) budgets[b.yearMonth] = b;

      const masterPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        transactions,
        budgets,
        metadata: {
          totalRecords: transactions.length,
          accountList: Array.from(new Set(transactions.map(t => t.account))),
          earliestDate: transactions[0]?.date || '',
          latestDate: transactions[transactions.length - 1]?.date || '',
        },
      };

      const fileId = await driveClient.uploadMasterFile(masterPayload, existing?.id);
      setIsSyncing(false);
      setStatusMessage(`Synced successfully with Google Drive! (File ID: ${fileId.slice(0, 8)}...)`);
    } catch (err: unknown) {
      setIsSyncing(false);
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Sync (BYOC)"
      description="Bring-Your-Own-Cloud cross-device synchronization"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Security badge */}
        <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-900">Zero-Backend Architecture: </span>
            Your browser talks directly to Google Drive via scoped tokens (<code className="font-mono bg-slate-200/60 px-1 py-0.5 rounded">drive.file</code>).
            No intermediate server or 3rd-party database ever touches your financial records.
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Google OAuth 2.0 Access Token
          </label>
          <input
            type="password"
            placeholder="Paste Google OAuth token (or click Link below)"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Saves and synchronizes a single <code className="font-mono text-slate-600">mm_master_ledger.json</code> file in your private Drive.
          </p>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 mr-1.5" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
