import Dexie, { type EntityTable } from 'dexie';
import { NormalizedTransaction } from '@/core/types/ledger';
import { MonthlyBudgetConfig } from '@/core/types/analytics';

export interface AppMetadata {
  key: string;
  value: unknown;
  updatedAt: number;
}

// Dexie Database Class
class MoneyManagerDB extends Dexie {
  transactions!: EntityTable<NormalizedTransaction, 'id'>;
  budgets!: EntityTable<MonthlyBudgetConfig, 'yearMonth'>;
  meta!: EntityTable<AppMetadata, 'key'>;

  constructor() {
    super('MMAnalyticsDB');
    this.version(1).stores({
      transactions: 'id, date, timestamp, year, month, [year+month], category, account, type, isTransfer',
      budgets: 'yearMonth',
      meta: 'key',
    });
  }
}

export const db = new MoneyManagerDB();

