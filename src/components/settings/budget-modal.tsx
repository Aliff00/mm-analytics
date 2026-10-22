import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { MonthlyBudgetConfig } from '@/core/types/analytics';
import { formatMonthName } from '@/core/utils/dates';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MonthlyBudgetConfig;
  onSave: (limit: number, savingsTarget?: number) => Promise<void>;
}

export function BudgetModal({
  isOpen,
  onClose,
  config,
  onSave,
}: BudgetModalProps) {
  const [budgetLimit, setBudgetLimit] = useState(config.totalBudgetLimit.toString());
  const [savingsTarget, setSavingsTarget] = useState((config.savingsGoalTarget ?? 30).toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    const target = parseFloat(savingsTarget);

    if (isNaN(limit) || limit <= 0) return;

    setIsSaving(true);
    await onSave(limit, isNaN(target) ? undefined : target);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monthly Budget Settings"
      description={`Set financial benchmarks for ${formatMonthName(config.yearMonth)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Total Monthly Expense Budget (MYR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
              RM
            </span>
            <input
              type="number"
              step="50"
              required
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Used to calculate day-of-month burn velocity and pacing alerts.
          </p>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Net Savings Rate Goal (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
              %
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Benchmark savings rate for net cash flow analysis.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Update Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
