import { NormalizedTransaction } from '@/core/types/ledger';
import { CashFlowMetrics } from '@/core/types/analytics';

/**
 * Computes True Income, True Expenses, and Net Savings Rate.
 * Internal transfers are strictly excluded to avoid artificial spending inflation.
 */
export function calculateCashFlow(transactions: NormalizedTransaction[]): CashFlowMetrics {
  let trueIncome = 0;
  let trueExpenses = 0;
  let transferVolume = 0;

  for (const t of transactions) {
    if (t.isTransfer) {
      // Transfer isolation
      if (t.transferDirection === 'out') {
        transferVolume += t.amount;
      }
      continue;
    }

    if (t.type === 'income') {
      trueIncome += t.amount;
    } else if (t.type === 'expense') {
      trueExpenses += t.amount;
    }
  }

  const netCashFlow = trueIncome - trueExpenses;
  const savingsRatePct = trueIncome > 0
    ? Math.max(-100, Math.min(100, ((trueIncome - trueExpenses) / trueIncome) * 100))
    : 0;

  return {
    trueIncome: parseFloat(trueIncome.toFixed(2)),
    trueExpenses: parseFloat(trueExpenses.toFixed(2)),
    netCashFlow: parseFloat(netCashFlow.toFixed(2)),
    savingsRatePct: parseFloat(savingsRatePct.toFixed(1)),
    transferVolume: parseFloat(transferVolume.toFixed(2)),
    transactionCount: transactions.length,
  };
}
