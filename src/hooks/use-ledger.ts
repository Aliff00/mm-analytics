import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/storage/db';
import { getCurrentYearMonth } from '@/core/utils/dates';
import { calculateCashFlow } from '@/analytics/cash-flow';
import { calculateBurnRateVelocity } from '@/analytics/burn-rate';
import { buildTrajectorySeries } from '@/analytics/trajectory';
import { buildCategoryTree } from '@/analytics/category-tree';
import { detectRecurringSubscriptions } from '@/analytics/recurring-detector';

export function useLedger() {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth());

  // Query all transactions from Dexie (reactive)
  const allTransactions = useLiveQuery(
    () => db.transactions.orderBy('timestamp').reverse().toArray(),
    []
  ) ?? [];

  // Query all budgets
  const allBudgets = useLiveQuery(
    () => db.budgets.toArray(),
    []
  ) ?? [];

  // Extract distinct available months from transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const t of allTransactions) {
      set.add(`${t.year}-${String(t.month).padStart(2, '0')}`);
    }
    const current = getCurrentYearMonth();
    set.add(current);
    return Array.from(set).sort().reverse();
  }, [allTransactions]);

  // If selectedMonth is not in available months and we have transactions, ensure valid
  const activeMonth = useMemo(() => {
    if (availableMonths.includes(selectedMonth)) {
      return selectedMonth;
    }
    return availableMonths[0] || getCurrentYearMonth();
  }, [selectedMonth, availableMonths]);

  // Filter transactions for active month
  const monthTransactions = useMemo(() => {
    const [yearStr, monthStr] = activeMonth.split('-');
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    return allTransactions.filter(t => t.year === y && t.month === m);
  }, [allTransactions, activeMonth]);

  // Budget for the active month (default: RM 4,000 if not set)
  const activeBudget = useMemo(() => {
    const found = allBudgets.find(b => b.yearMonth === activeMonth);
    return found || {
      yearMonth: activeMonth,
      totalBudgetLimit: 4000,
      savingsGoalTarget: 30,
    };
  }, [allBudgets, activeMonth]);

  // Analytics Computations
  const cashFlow = useMemo(() => {
    return calculateCashFlow(monthTransactions);
  }, [monthTransactions]);

  const burnRate = useMemo(() => {
    return calculateBurnRateVelocity(
      monthTransactions,
      activeMonth,
      activeBudget.totalBudgetLimit
    );
  }, [monthTransactions, activeMonth, activeBudget.totalBudgetLimit]);

  const trajectory = useMemo(() => {
    const pastTransactions = allTransactions.filter(t => {
      const ym = `${t.year}-${String(t.month).padStart(2, '0')}`;
      return ym < activeMonth;
    });
    return buildTrajectorySeries(
      monthTransactions,
      activeMonth,
      activeBudget.totalBudgetLimit,
      pastTransactions
    );
  }, [monthTransactions, activeMonth, activeBudget.totalBudgetLimit, allTransactions]);

  const categoryTree = useMemo(() => {
    return buildCategoryTree(monthTransactions, 'expense');
  }, [monthTransactions]);

  const recurringSubscriptions = useMemo(() => {
    return detectRecurringSubscriptions(allTransactions);
  }, [allTransactions]);

  // Save budget handler
  const setMonthlyBudget = async (limit: number, savingsTarget?: number) => {
    await db.budgets.put({
      yearMonth: activeMonth,
      totalBudgetLimit: limit,
      savingsGoalTarget: savingsTarget,
    });
  };

  return {
    allTransactions,
    monthTransactions,
    availableMonths,
    activeMonth,
    setActiveMonth: setSelectedMonth,
    activeBudget,
    setMonthlyBudget,
    cashFlow,
    burnRate,
    trajectory,
    categoryTree,
    recurringSubscriptions,
    isEmpty: allTransactions.length === 0,
  };
}

