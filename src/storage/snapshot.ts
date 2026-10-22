import { db } from './db';
import { MasterLedgerState, NormalizedTransaction } from '@/core/types/ledger';
import { MonthlyBudgetConfig } from '@/core/types/analytics';

/**
 * Exports all local data to a portable, self-contained JSON snapshot
 */
export async function exportSnapshot(): Promise<void> {
  const transactions = await db.transactions.toArray();
  const rawBudgets = await db.budgets.toArray();
  
  const budgets: Record<string, MonthlyBudgetConfig> = {};
  for (const b of rawBudgets) {
    budgets[b.yearMonth] = b;
  }

  const accounts = Array.from(new Set(transactions.map(t => t.account))).sort();
  const dates = transactions.map(t => t.date).sort();

  const snapshot: MasterLedgerState = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    budgets,
    metadata: {
      totalRecords: transactions.length,
      accountList: accounts,
      earliestDate: dates[0] || '',
      latestDate: dates[dates.length - 1] || '',
    },
  };

  const jsonString = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const nowStr = new Date().toISOString().slice(0, 10);
  a.download = `mm_analytics_snapshot_${nowStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restores a JSON snapshot file into Dexie.js
 */
export async function restoreSnapshot(file: File): Promise<{
  restoredCount: number;
  budgetsCount: number;
}> {
  const text = await file.text();
  const data = JSON.parse(text) as MasterLedgerState;

  if (!data || !Array.isArray(data.transactions)) {
    throw new Error('Invalid snapshot file format: Missing transactions array.');
  }

  return await db.transaction('rw', db.transactions, db.budgets, async () => {
    // Upsert transactions
    await db.transactions.bulkPut(data.transactions);

    // Upsert budgets
    if (data.budgets && typeof data.budgets === 'object') {
      const budgetList = Object.values(data.budgets);
      if (budgetList.length > 0) {
        await db.budgets.bulkPut(budgetList);
      }
    }

    return {
      restoredCount: data.transactions.length,
      budgetsCount: data.budgets ? Object.keys(data.budgets).length : 0,
    };
  });
}

/**
 * Completely purges all data from local IndexedDB
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.transactions, db.budgets, db.meta, async () => {
    await db.transactions.clear();
    await db.budgets.clear();
    await db.meta.clear();
  });
}
