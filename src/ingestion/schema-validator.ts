import { RawImportRow } from '@/core/types/ledger';

/**
 * Validates and maps varying Money Manager export headers.
 */

export interface HeaderMapping {
  periodKey: string;
  accountKey: string;
  categoryKey: string;
  subcategoryKey: string;
  noteKey: string;
  typeKey: string;
  amountKey: string;
}

const ALIASES = {
  period: ['period', 'date', 'time', 'datetime', 'trans date'],
  account: ['accounts', 'account', 'payment method', 'wallet'],
  category: ['category', 'main category', 'parent category'],
  subcategory: ['subcategory', 'sub category', 'sub-category'],
  note: ['note', 'description', 'memo', 'merchant', 'payee'],
  type: ['income/expense', 'type', 'exp./income', 'trans type'],
  amount: ['amount', 'myr', 'cost', 'total', 'value'],
};

export function detectHeaders(sampleRow: Record<string, unknown>): HeaderMapping | null {
  const keys = Object.keys(sampleRow);
  const normalizedKeyMap = new Map<string, string>();
  for (const k of keys) {
    normalizedKeyMap.set(k.toLowerCase().trim(), k);
  }

  function findMatch(candidates: string[]): string | undefined {
    for (const c of candidates) {
      if (normalizedKeyMap.has(c)) {
        return normalizedKeyMap.get(c);
      }
    }
    // Partial substring fallback
    for (const c of candidates) {
      for (const [normKey, originalKey] of normalizedKeyMap.entries()) {
        if (normKey.includes(c)) {
          return originalKey;
        }
      }
    }
    return undefined;
  }

  const periodKey = findMatch(ALIASES.period);
  const typeKey = findMatch(ALIASES.type);
  const amountKey = findMatch(ALIASES.amount);

  // Critical keys must exist
  if (!periodKey || !amountKey) {
    return null;
  }

  return {
    periodKey,
    accountKey: findMatch(ALIASES.account) || 'Accounts',
    categoryKey: findMatch(ALIASES.category) || 'Category',
    subcategoryKey: findMatch(ALIASES.subcategory) || 'Subcategory',
    noteKey: findMatch(ALIASES.note) || 'Note',
    typeKey: typeKey || 'Income/Expense',
    amountKey,
  };
}

export function isRowValid(row: RawImportRow, mapping: HeaderMapping): boolean {
  const period = row[mapping.periodKey];
  const amount = row[mapping.amountKey];

  if (period == null || period === '') return false;
  if (amount == null || amount === '') return false;

  return true;
}

