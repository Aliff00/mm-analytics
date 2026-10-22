export interface MonthlyBudgetConfig {
  yearMonth: string; // 'YYYY-MM'
  totalBudgetLimit: number; // e.g. 5000 (MYR)
  savingsGoalTarget?: number; // e.g. 35 (%)
  categoryLimits?: Record<string, number>;
}

export interface BurnRateVelocity {
  currentDay: number;
  daysInMonth: number;
  monthElapsedPct: number;
  totalBudget: number;
  actualSpendToDate: number;
  idealSpendToDate: number;
  spendVelocityPct: number;
  projectedMonthEndSpend: number;
  varianceAmount: number; // idealSpendToDate - actualSpendToDate (+ = under pacing, safe)
  status: 'under_pacing' | 'on_track' | 'over_pacing' | 'critical';
}

export interface CashFlowMetrics {
  trueIncome: number;
  trueExpenses: number;
  netCashFlow: number;
  savingsRatePct: number;
  transferVolume: number;
  transactionCount: number;
}

export interface TrajectoryPoint {
  day: number;
  date: string;
  actualCumulativeSpend: number;
  idealLinearSpend: number;
  projectedSpend: number;
  isPastOrToday: boolean;
  benchmarkAvgSpend?: number;
}

export interface CategorySummary {
  category: string;
  categoryRaw: string;
  categoryEmoji?: string;
  amount: number;
  percentage: number;
  count: number;
  subcategories: {
    name: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
}

export interface RecurringSubscriptionItem {
  key: string;
  note: string;
  category: string;
  categoryRaw: string;
  categoryEmoji?: string;
  account: string;
  averageAmount: number;
  lastAmount: number;
  occurrences: number;
  lastDate: string;
  cadence: 'monthly' | 'bi-weekly' | 'irregular';
  estimatedAnnualCost: number;
  confidenceScore: number;
}
