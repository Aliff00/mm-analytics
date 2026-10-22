import { NormalizedTransaction } from '@/core/types/ledger';
import { BurnRateVelocity } from '@/core/types/analytics';
import { getDaysInMonth } from '@/core/utils/dates';

/**
 * Calculates budget pacing, spend velocity, and projected end-of-month spend
 */
export function calculateBurnRateVelocity(
  transactions: NormalizedTransaction[],
  yearMonth: string,
  totalBudget: number
): BurnRateVelocity {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = getDaysInMonth(year, month);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  
  // If viewing past month, the full month has elapsed. If future month, day is 1. If current month, today's date.
  let currentDay = isCurrentMonth
    ? Math.min(today.getDate(), daysInMonth)
    : (new Date(year, month - 1, 1) < today ? daysInMonth : 1);

  if (currentDay < 1) currentDay = 1;

  // Filter expenses strictly for this month (excluding transfers)
  let actualSpendToDate = 0;
  for (const t of transactions) {
    if (!t.isTransfer && t.type === 'expense' && t.day <= currentDay) {
      actualSpendToDate += t.amount;
    }
  }

  const monthElapsedPct = (currentDay / daysInMonth) * 100;
  const idealSpendToDate = (totalBudget / daysInMonth) * currentDay;
  const spendVelocityPct = idealSpendToDate > 0 ? (actualSpendToDate / idealSpendToDate) * 100 : 0;
  const projectedMonthEndSpend = (actualSpendToDate / currentDay) * daysInMonth;
  const varianceAmount = idealSpendToDate - actualSpendToDate;

  let status: BurnRateVelocity['status'] = 'on_track';
  if (actualSpendToDate > totalBudget) {
    status = 'critical';
  } else if (spendVelocityPct > 115) {
    status = 'over_pacing';
  } else if (spendVelocityPct < 85) {
    status = 'under_pacing';
  } else {
    status = 'on_track';
  }

  return {
    currentDay,
    daysInMonth,
    monthElapsedPct: parseFloat(monthElapsedPct.toFixed(1)),
    totalBudget: parseFloat(totalBudget.toFixed(2)),
    actualSpendToDate: parseFloat(actualSpendToDate.toFixed(2)),
    idealSpendToDate: parseFloat(idealSpendToDate.toFixed(2)),
    spendVelocityPct: parseFloat(spendVelocityPct.toFixed(1)),
    projectedMonthEndSpend: parseFloat(projectedMonthEndSpend.toFixed(2)),
    varianceAmount: parseFloat(varianceAmount.toFixed(2)),
    status,
  };
}

