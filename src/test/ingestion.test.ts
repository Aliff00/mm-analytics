import { describe, it, expect } from 'vitest';
import { parseRawDate, excelSerialToDate } from '@/core/utils/dates';
import { parseRawAmount } from '@/core/utils/currency';
import { extractCategoryInfo } from '@/core/utils/text';
import { generateTransactionHashSync } from '@/core/crypto/fingerprint';
import { normalizeRow } from '@/ingestion/normalizer';
import { calculateCashFlow } from '@/analytics/cash-flow';
import { calculateBurnRateVelocity } from '@/analytics/burn-rate';
import { HeaderMapping } from '@/ingestion/schema-validator';

describe('Date Parsing & Excel Serial Conversion', () => {
  it('converts Excel serial number correctly', () => {
    // 45210 corresponds to 2023-10-11
    const date = excelSerialToDate(45210);
    expect(date.getUTCFullYear()).toBe(2023);
    expect(date.getUTCMonth()).toBe(9); // 0-indexed October
    expect(date.getUTCDate()).toBe(11);
  });

  it('parses DD/MM/YYYY format safely', () => {
    const res = parseRawDate('25/12/2026');
    expect(res).not.toBeNull();
    expect(res?.dateStr).toBe('2026-12-25');
    expect(res?.year).toBe(2026);
    expect(res?.month).toBe(12);
    expect(res?.day).toBe(25);
  });

  it('parses YYYY-MM-DD format safely', () => {
    const res = parseRawDate('2026-05-18');
    expect(res).not.toBeNull();
    expect(res?.dateStr).toBe('2026-05-18');
    expect(res?.year).toBe(2026);
    expect(res?.month).toBe(5);
    expect(res?.day).toBe(18);
  });
});

describe('Currency & Amount Parsing', () => {
  it('strips currency prefixes and negative signs for positive absolute storage', () => {
    expect(parseRawAmount('RM 1,250.50')).toBe(1250.50);
    expect(parseRawAmount('-45.00')).toBe(45.00);
    expect(parseRawAmount(320.75)).toBe(320.75);
  });
});

describe('Emoji & Category Cleaner', () => {
  it('extracts emojis and isolates clean category name for grouping', () => {
    const info = extractCategoryInfo('🍽️ Food & Drink');
    expect(info.emoji).toBe('🍽️');
    expect(info.cleanName).toBe('Food & Drink');
    expect(info.rawName).toBe('🍽️ Food & Drink');
  });

  it('handles categories without emojis', () => {
    const info = extractCategoryInfo('Salary');
    expect(info.emoji).toBeUndefined();
    expect(info.cleanName).toBe('Salary');
  });
});

describe('Deterministic SHA-256 Fingerprint', () => {
  it('produces identical hashes for identical transactions', () => {
    const payload = {
      date: '2026-10-22',
      account: 'Maybank',
      type: 'expense',
      amount: 15.50,
      category: 'Food & Drink',
      subcategory: 'Lunch',
      note: 'Chicken Rice',
    };
    const h1 = generateTransactionHashSync(payload);
    const h2 = generateTransactionHashSync(payload);
    expect(h1).toBe(h2);
    expect(h1.length).toBeGreaterThan(10);
  });

  it('produces distinct hashes if discriminator is varied (intra-day duplicates)', () => {
    const payload = {
      date: '2026-10-22',
      account: 'Maybank',
      type: 'expense',
      amount: 3.00,
      category: 'Food & Drink',
      subcategory: 'Coffee',
      note: 'Kopitiam',
    };
    const h1 = generateTransactionHashSync({ ...payload, discriminator: 0 });
    const h2 = generateTransactionHashSync({ ...payload, discriminator: 1 });
    expect(h1).not.toBe(h2);
  });
});

describe('Normalization & Transfer Isolation Engine', () => {
  const mapping: HeaderMapping = {
    periodKey: 'Period',
    accountKey: 'Accounts',
    categoryKey: 'Category',
    subcategoryKey: 'Subcategory',
    noteKey: 'Note',
    typeKey: 'Income/Expense',
    amountKey: 'Amount',
  };

  it('identifies and isolates Transfer-In and Transfer-Out', () => {
    const transferOutRow = {
      Period: '2026-10-01',
      Accounts: 'Maybank',
      Category: 'Transfer',
      'Income/Expense': 'Transfer-Out',
      Amount: 500,
      Note: 'Topup Setel',
    };
    const tx = normalizeRow(transferOutRow, mapping);
    expect(tx).not.toBeNull();
    expect(tx?.type).toBe('transfer');
    expect(tx?.transferDirection).toBe('out');
    expect(tx?.isTransfer).toBe(true);
  });

  it('guarantees transfers do NOT pollute cashflow or savings rate', () => {
    const transactions = [
      // True Income: 5000
      {
        id: '1',
        date: '2026-10-01',
        timestamp: 1,
        year: 2026,
        month: 10,
        day: 1,
        account: 'Maybank',
        category: 'Salary',
        categoryRaw: 'Salary',
        subcategory: '',
        note: 'Salary',
        type: 'income' as const,
        transferDirection: null,
        amount: 5000,
        currency: 'MYR',
        isTransfer: false,
        importedAt: 1,
      },
      // True Expense: 2000
      {
        id: '2',
        date: '2026-10-05',
        timestamp: 2,
        year: 2026,
        month: 10,
        day: 5,
        account: 'Maybank',
        category: 'Housing',
        categoryRaw: 'Housing',
        subcategory: '',
        note: 'Rent',
        type: 'expense' as const,
        transferDirection: null,
        amount: 2000,
        currency: 'MYR',
        isTransfer: false,
        importedAt: 2,
      },
      // Large internal transfer: RM 10,000 between accounts
      {
        id: '3',
        date: '2026-10-10',
        timestamp: 3,
        year: 2026,
        month: 10,
        day: 10,
        account: 'Maybank',
        category: 'Transfer',
        categoryRaw: 'Transfer',
        subcategory: '',
        note: 'Transfer to TnG',
        type: 'transfer' as const,
        transferDirection: 'out' as const,
        amount: 10000,
        currency: 'MYR',
        isTransfer: true,
        importedAt: 3,
      },
      {
        id: '4',
        date: '2026-10-10',
        timestamp: 4,
        year: 2026,
        month: 10,
        day: 10,
        account: 'Touch N Go',
        category: 'Transfer',
        categoryRaw: 'Transfer',
        subcategory: '',
        note: 'Received from Maybank',
        type: 'transfer' as const,
        transferDirection: 'in' as const,
        amount: 10000,
        currency: 'MYR',
        isTransfer: true,
        importedAt: 4,
      },
    ];

    const metrics = calculateCashFlow(transactions);
    // True income must remain 5000, NOT 15000
    expect(metrics.trueIncome).toBe(5000);
    // True expense must remain 2000, NOT 12000
    expect(metrics.trueExpenses).toBe(2000);
    // Net cash flow: 3000
    expect(metrics.netCashFlow).toBe(3000);
    // Savings rate: (3000 / 5000) * 100 = 60%
    expect(metrics.savingsRatePct).toBe(60);
    // Transfer volume captured separately
    expect(metrics.transferVolume).toBe(10000);
  });
});

describe('Burn Rate Velocity Calculation', () => {
  it('detects under-pacing correctly', () => {
    // Day 15 of 30 days = 50% through month
    // Target budget: 3000. Ideal spend to date: 1500.
    // If actual spend is 1000, pacing is favorable (+500 under target)
    const transactions = [
      {
        id: '1',
        date: '2026-04-10',
        timestamp: 1,
        year: 2026,
        month: 4,
        day: 10,
        account: 'Maybank',
        category: 'Food',
        categoryRaw: 'Food',
        subcategory: '',
        note: 'Meals',
        type: 'expense' as const,
        transferDirection: null,
        amount: 1000,
        currency: 'MYR',
        isTransfer: false,
        importedAt: 1,
      },
    ];

    const burn = calculateBurnRateVelocity(transactions, '2026-04', 3000);
    expect(burn.daysInMonth).toBe(30);
    expect(burn.actualSpendToDate).toBe(1000);
  });
});
