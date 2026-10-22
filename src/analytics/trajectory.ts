import { NormalizedTransaction } from '@/core/types/ledger';
import { TrajectoryPoint } from '@/core/types/analytics';
import { getDaysInMonth } from '@/core/utils/dates';

/**
 * Builds the cumulative daily burn series across days 1–31
 */
export function buildTrajectorySeries(
  monthTransactions: NormalizedTransaction[],
  yearMonth: string,
  totalBudget: number,
  allPastTransactions: NormalizedTransaction[] = []
): TrajectoryPoint[] {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = getDaysInMonth(year, month);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const currentDay = isCurrentMonth ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

  // Aggregate daily expenses for the target month
  const dailySpendMap = new Map<number, number>();
  for (const t of monthTransactions) {
    if (!t.isTransfer && t.type === 'expense') {
      const current = dailySpendMap.get(t.day) || 0;
      dailySpendMap.set(t.day, current + t.amount);
    }
  }

  // Calculate past months daily average curve if available
  const pastMonthsDailyAvg = new Map<number, number>();
  if (allPastTransactions.length > 0) {
    const pastMonthsCount = new Set(allPastTransactions.map(t => `${t.year}-${t.month}`)).size || 1;
    for (const t of allPastTransactions) {
      if (!t.isTransfer && t.type === 'expense') {
        const c = pastMonthsDailyAvg.get(t.day) || 0;
        pastMonthsDailyAvg.set(t.day, c + t.amount / pastMonthsCount);
      }
    }
  }

  const series: TrajectoryPoint[] = [];
  let runningActual = 0;
  let runningPastAvg = 0;

  // Pre-calculate current daily velocity for projection
  const currentActualToDate = runningActual;
  const dailyRunRate = currentDay > 0 ? (dailySpendMap.get(currentDay) ? runningActual / currentDay : 0) : 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const isPastOrToday = !isCurrentMonth || day <= currentDay;
    const daySpend = dailySpendMap.get(day) || 0;

    if (isPastOrToday) {
      runningActual += daySpend;
    }

    const pastAvgDaySpend = pastMonthsDailyAvg.get(day) || 0;
    runningPastAvg += pastAvgDaySpend;

    const idealLinearSpend = (totalBudget / daysInMonth) * day;

    // Projected spend: continues from current runningActual with current run-rate
    let projectedSpend = runningActual;
    if (isCurrentMonth && day > currentDay) {
      const runRate = currentDay > 0 ? runningActual / currentDay : 0;
      projectedSpend = runningActual + runRate * (day - currentDay);
    }

    const dStr = String(day).padStart(2, '0');
    series.push({
      day,
      date: `${yearMonth}-${dStr}`,
      actualCumulativeSpend: isPastOrToday ? parseFloat(runningActual.toFixed(2)) : parseFloat(runningActual.toFixed(2)),
      idealLinearSpend: parseFloat(idealLinearSpend.toFixed(2)),
      projectedSpend: parseFloat(projectedSpend.toFixed(2)),
      isPastOrToday,
      benchmarkAvgSpend: pastMonthsDailyAvg.size > 0 ? parseFloat(runningPastAvg.toFixed(2)) : undefined,
    });
  }

  return series;
}
