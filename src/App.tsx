import React, { useState } from 'react';
import { useLedger } from '@/hooks/use-ledger';
import { Header } from '@/components/layout/header';
import { Dropzone } from '@/components/ingestion/dropzone';
import { ImportSummaryModal } from '@/components/ingestion/import-summary-modal';
import { KpiStrip } from '@/components/dashboard/kpi-strip';
import { TrajectoryChart } from '@/components/dashboard/trajectory-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { RecurringTable } from '@/components/dashboard/recurring-table';
import { LedgerTable } from '@/components/ledger/ledger-table';
import { BudgetModal } from '@/components/settings/budget-modal';
import { DriveSyncModal } from '@/components/settings/drive-sync-modal';
import { IngestionBatchResult } from '@/core/types/ledger';
import { loadSampleData } from '@/storage/sample-data';
import { ShieldCheck, Sparkles, FileSpreadsheet, Lock, Cpu, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function App() {
  const {
    allTransactions,
    monthTransactions,
    availableMonths,
    activeMonth,
    setActiveMonth,
    activeBudget,
    setMonthlyBudget,
    cashFlow,
    burnRate,
    trajectory,
    categoryTree,
    recurringSubscriptions,
    isEmpty,
  } = useLedger();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<IngestionBatchResult | null>(null);

  const handleImportComplete = (result: IngestionBatchResult) => {
    setImportResult(result);
    // If the imported data has a latest month, we can switch to it
    if (result.dateRange.max) {
      const targetMonth = result.dateRange.max.slice(0, 7);
      if (targetMonth) {
        setActiveMonth(targetMonth);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        availableMonths={availableMonths}
        activeMonth={activeMonth}
        onSelectMonth={setActiveMonth}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onImportComplete={handleImportComplete}
        totalTransactionsCount={allTransactions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {isEmpty ? (
          /* Empty State Hero */
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Liability & Zero-Knowledge Architecture</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Forward-looking intelligence for iOS Money Manager.
              </h1>
              <p className="text-sm text-slate-500 max-w-lg mx-auto">
                Drop your standard Money Manager Excel export to track budget pacing velocity, detect hidden recurring bills, and calculate true net cash flow.
              </p>
            </div>

            {/* Dropzone */}
            <div className="pt-2">
              <Dropzone onImportComplete={handleImportComplete} />
            </div>

            {/* Quick Demo Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs text-slate-400">Want to test it first without exporting?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await loadSampleData();
                }}
                className="bg-white hover:bg-slate-50 text-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                Load Sample Money Manager Dataset
              </Button>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200/80 text-left">
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <Lock className="w-5 h-5 text-slate-700 mb-2" />
                <h4 className="text-xs font-semibold text-slate-900">Zero Server Telemetry</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  All aggregations, parsing, and rendering execute in your browser. No financial rows leave your device.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <Cpu className="w-5 h-5 text-slate-700 mb-2" />
                <h4 className="text-xs font-semibold text-slate-900">Deterministic Upserts</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Drop cumulative files monthly without duplicating records. SHA-256 fingerprinting guarantees clean merges.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <Database className="w-5 h-5 text-slate-700 mb-2" />
                <h4 className="text-xs font-semibold text-slate-900">Dual-Tier Persistence</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Local IndexedDB keeps state across tab reloads. Optional Google Drive sync enables cross-device backup.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Dashboard View */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top KPI Metrics Strip */}
            <KpiStrip
              cashFlow={cashFlow}
              burnRate={burnRate}
              onEditBudget={() => setIsBudgetModalOpen(true)}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cumulative Spend Trajectory (7 cols) */}
              <div className="lg:col-span-7">
                <TrajectoryChart
                  data={trajectory}
                  totalBudget={burnRate.totalBudget}
                />
              </div>

              {/* Category & Subcategory Drilldown (5 cols) */}
              <div className="lg:col-span-5">
                <CategoryBreakdown categories={categoryTree} />
              </div>
            </div>

            {/* Recurring Subscriptions Detector */}
            <RecurringTable subscriptions={recurringSubscriptions} />

            {/* Searchable Transaction Ledger */}
            <LedgerTable transactions={monthTransactions} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">mm-analytics</span> • Open-source, client-side financial intelligence
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Transfer Isolation Active</span>
            <span>•</span>
            <span>IndexedDB Tier-1 Active</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        config={activeBudget}
        onSave={setMonthlyBudget}
      />

      <DriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />

      <ImportSummaryModal
        isOpen={Boolean(importResult)}
        onClose={() => setImportResult(null)}
        result={importResult}
      />
    </div>
  );
}
export default App;
