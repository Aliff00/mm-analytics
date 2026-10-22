import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { IngestionBatchResult } from '@/core/types/ledger';
import { CheckCircle2, AlertTriangle, Calendar, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '@/core/utils/currency';

interface ImportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: IngestionBatchResult | null;
}

export function ImportSummaryModal({
  isOpen,
  onClose,
  result,
}: ImportSummaryModalProps) {
  if (!result) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Completed"
      description="Summary of ingested Money Manager transactions"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Status Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Processed {result.totalRows.toLocaleString()} rows successfully
            </p>
            {result.dateRange.min && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Date Range: <span className="font-mono text-slate-700">{result.dateRange.min}</span> to{' '}
                <span className="font-mono text-slate-700">{result.dateRange.max}</span>
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg">
            <div className="text-2xl font-bold font-mono text-emerald-700">
              +{result.newCount}
            </div>
            <div className="text-xs font-medium text-emerald-800 mt-0.5">New Transactions</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="text-2xl font-bold font-mono text-slate-600">
              {result.duplicateCount}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Duplicate / Preserved</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="text-2xl font-bold font-mono text-slate-600">
              {result.errorCount}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Skipped / Empty</div>
          </div>
        </div>

        {/* Warning messages if any */}
        {result.errors.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-lg text-xs text-amber-800 space-y-1">
            <div className="font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Notices
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-amber-700">
              {result.errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sample Transactions Preview */}
        {result.sampleTransactions.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Ingested Records Preview
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
              {result.sampleTransactions.map((tx) => (
                <div key={tx.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{tx.categoryEmoji || '💳'}</span>
                    <div className="truncate">
                      <div className="font-medium text-slate-800 truncate">
                        {tx.note || tx.categoryRaw}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tx.date} • {tx.account}
                        {tx.isTransfer && ' • [Internal Transfer]'}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-medium text-slate-900 shrink-0 ml-3">
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="primary" size="md">
            View Analytics Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  );
}
