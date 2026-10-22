import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CashFlowMetrics, BurnRateVelocity } from '@/core/types/analytics';
import { formatCurrency } from '@/core/utils/currency';
import { ArrowUpRight, ArrowDownRight, PiggyBank, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface KpiStripProps {
  cashFlow: CashFlowMetrics;
  burnRate: BurnRateVelocity;
  onEditBudget?: () => void;
}

export function KpiStrip({ cashFlow, burnRate, onEditBudget }: KpiStripProps) {
  const isPositiveCashFlow = cashFlow.netCashFlow >= 0;

  // Pacing status pill configuration
  const pacingConfig = {
    under_pacing: {
      label: 'Under Pacing (Favorable)',
      variant: 'emerald' as const,
      icon: CheckCircle2,
      desc: `${formatCurrency(burnRate.varianceAmount)} under linear target`,
    },
    on_track: {
      label: 'On Track',
      variant: 'slate' as const,
      icon: Gauge,
      desc: 'Spending evenly against budget',
    },
    over_pacing: {
      label: 'Over Pacing',
      variant: 'amber' as const,
      icon: AlertTriangle,
      desc: `${formatCurrency(Math.abs(burnRate.varianceAmount))} over linear target`,
    },
    critical: {
      label: 'Budget Exceeded',
      variant: 'rose' as const,
      icon: AlertTriangle,
      desc: `Exceeded by ${formatCurrency(burnRate.actualSpendToDate - burnRate.totalBudget)}`,
    },
  }[burnRate.status];

  const PacingIcon = pacingConfig.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. True Income */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>True Income</span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            {formatCurrency(cashFlow.trueIncome)}
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>Excludes internal transfers</span>
          {cashFlow.transferVolume > 0 && (
            <span className="text-slate-500 font-mono">
              🔄 {formatCurrency(cashFlow.transferVolume)}
            </span>
          )}
        </div>
      </Card>

      {/* 2. True Expenses */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>True Expenses</span>
            <span className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            {formatCurrency(cashFlow.trueExpenses)}
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>Net: <span className={`font-mono font-medium ${isPositiveCashFlow ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(cashFlow.netCashFlow)}
          </span></span>
          <span className="font-mono text-slate-500">{cashFlow.transactionCount} items</span>
        </div>
      </Card>

      {/* 3. Net Savings Rate */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Net Savings Rate</span>
            <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
              <PiggyBank className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            {cashFlow.savingsRatePct}%
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>((Income - Expense) / Income)</span>
          <span className={`font-medium ${cashFlow.savingsRatePct >= 30 ? 'text-emerald-600' : 'text-slate-500'}`}>
            {cashFlow.savingsRatePct >= 30 ? 'Healthy' : 'Below Target'}
          </span>
        </div>
      </Card>

      {/* 4. Monthly Budget Pacing */}
      <Card
        onClick={onEditBudget}
        className="flex flex-col justify-between cursor-pointer group hover:border-slate-300"
      >
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Budget Pacing (D{burnRate.currentDay})</span>
            <Badge variant={pacingConfig.variant} size="sm">
              <PacingIcon className="w-3 h-3 mr-0.5" />
              {pacingConfig.label}
            </Badge>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            {formatCurrency(burnRate.actualSpendToDate)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              / {formatCurrency(burnRate.totalBudget)}
            </span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>{pacingConfig.desc}</span>
          <span className="text-slate-400 group-hover:text-slate-700 underline text-[10px]">
            Edit Budget
          </span>
        </div>
      </Card>
    </div>
  );
}

