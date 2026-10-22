import { NormalizedTransaction } from '@/core/types/ledger';
import { generateTransactionHashSync } from '@/core/crypto/fingerprint';
import { db } from './db';

/**
 * Generates 3 months of realistic iOS Money Manager transactions
 * (Expenses, Incomes, Internal Transfers, Emojis, Subscriptions)
 */
export async function loadSampleData(): Promise<number> {
  const transactions: NormalizedTransaction[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // We generate data for the current month and previous 2 months
  const monthsToGenerate = [
    { year: currentYear, month: currentMonth },
    { year: currentMonth === 1 ? currentYear - 1 : currentYear, month: currentMonth === 1 ? 12 : currentMonth - 1 },
    { year: currentMonth <= 2 ? currentYear - 1 : currentYear, month: currentMonth <= 2 ? currentMonth + 10 : currentMonth - 2 },
  ];

  const categories = [
    { raw: '🍽️ Food & Drink', clean: 'Food & Drink', emoji: '🍽️', sub: ['Lunch', 'Dinner', 'Coffee', 'Groceries'] },
    { raw: '🚗 Transport', clean: 'Transport', emoji: '🚗', sub: ['Petrol', 'Toll / Touch N Go', 'Parking', 'Grab'] },
    { raw: '🏠 Housing & Bills', clean: 'Housing & Bills', emoji: '🏠', sub: ['Rent', 'Electricity (TNB)', 'Water', 'Internet (Unifi)'] },
    { raw: '🛍️ Shopping', clean: 'Shopping', emoji: '🛍️', sub: ['Gadgets', 'Clothing', 'Supermarket'] },
    { raw: '🎬 Entertainment', clean: 'Entertainment', emoji: '🎬', sub: ['Cinema', 'Games', 'Subscriptions'] },
    { raw: '💊 Health', clean: 'Health', emoji: '💊', sub: ['Pharmacy', 'Clinic', 'Supplements'] },
  ];

  const accounts = ['Maybank', 'Touch \'N Go', 'Setel Wallet', 'Cash'];

  for (const { year, month } of monthsToGenerate) {
    const daysInMonth = new Date(year, month, 0).getDate();
    // For current month, only generate up to today
    const maxDay = (year === currentYear && month === currentMonth)
      ? Math.min(currentDate.getDate(), daysInMonth)
      : daysInMonth;

    const mStr = String(month).padStart(2, '0');

    // 1. Monthly Salary (Income) on the 25th
    if (maxDay >= 25) {
      const dateStr = `${year}-${mStr}-25`;
      const salaryTx: NormalizedTransaction = {
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Maybank',
          type: 'income',
          amount: 6800.00,
          category: 'Salary',
          subcategory: 'Primary Job',
          note: 'Monthly Salary Tech Corp',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 25),
        year,
        month,
        day: 25,
        account: 'Maybank',
        category: 'Salary',
        categoryRaw: '💰 Salary',
        categoryEmoji: '💰',
        subcategory: 'Primary Job',
        note: 'Monthly Salary Tech Corp',
        type: 'income',
        transferDirection: null,
        amount: 6800.00,
        currency: 'MYR',
        isTransfer: false,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      };
      transactions.push(salaryTx);
    }

    // 2. Freelance side income on the 10th
    if (maxDay >= 10) {
      const dateStr = `${year}-${mStr}-10`;
      const freelanceTx: NormalizedTransaction = {
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Maybank',
          type: 'income',
          amount: 1200.00,
          category: 'Side Income',
          subcategory: 'Consulting',
          note: 'Website Design Retainer',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 10),
        year,
        month,
        day: 10,
        account: 'Maybank',
        category: 'Side Income',
        categoryRaw: '💼 Side Income',
        categoryEmoji: '💼',
        subcategory: 'Consulting',
        note: 'Website Design Retainer',
        type: 'income',
        transferDirection: null,
        amount: 1200.00,
        currency: 'MYR',
        isTransfer: false,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      };
      transactions.push(freelanceTx);
    }

    // 3. Regular Recurring Bills
    // Rent on 1st
    if (maxDay >= 1) {
      const dateStr = `${year}-${mStr}-01`;
      transactions.push({
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Maybank',
          type: 'expense',
          amount: 1600.00,
          category: 'Housing & Bills',
          subcategory: 'Rent',
          note: 'Condo Rental Transfer',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 1),
        year,
        month,
        day: 1,
        account: 'Maybank',
        category: 'Housing & Bills',
        categoryRaw: '🏠 Housing & Bills',
        categoryEmoji: '🏠',
        subcategory: 'Rent',
        note: 'Condo Rental Transfer',
        type: 'expense',
        transferDirection: null,
        amount: 1600.00,
        currency: 'MYR',
        isTransfer: false,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      });
    }

    // Netflix Subscription on 12th
    if (maxDay >= 12) {
      const dateStr = `${year}-${mStr}-12`;
      transactions.push({
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Maybank',
          type: 'expense',
          amount: 55.00,
          category: 'Entertainment',
          subcategory: 'Subscriptions',
          note: 'Netflix Premium 4K',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 12),
        year,
        month,
        day: 12,
        account: 'Maybank',
        category: 'Entertainment',
        categoryRaw: '🎬 Entertainment',
        categoryEmoji: '🎬',
        subcategory: 'Subscriptions',
        note: 'Netflix Premium 4K',
        type: 'expense',
        transferDirection: null,
        amount: 55.00,
        currency: 'MYR',
        isTransfer: false,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      });
    }

    // Spotify Subscription on 18th
    if (maxDay >= 18) {
      const dateStr = `${year}-${mStr}-18`;
      transactions.push({
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Touch \'N Go',
          type: 'expense',
          amount: 17.90,
          category: 'Entertainment',
          subcategory: 'Subscriptions',
          note: 'Spotify Individual',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 18),
        year,
        month,
        day: 18,
        account: 'Touch \'N Go',
        category: 'Entertainment',
        categoryRaw: '🎬 Entertainment',
        categoryEmoji: '🎬',
        subcategory: 'Subscriptions',
        note: 'Spotify Individual',
        type: 'expense',
        transferDirection: null,
        amount: 17.90,
        currency: 'MYR',
        isTransfer: false,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      });
    }

    // Unifi Home Broadband on 5th
    if (maxDay >= 5) {
      const dateStr = `${year}-${mStr}-05`;
      transactions.push({
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Maybank',
          type: 'expense',
          amount: 139.00,
          category: 'Housing & Bills',
          subcategory: 'Internet (Unifi)',
          note: 'TM Unifi 100Mbps Bill',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 5),
        year,
        month,
        day: 5,
        account: 'Maybank',
        category: 'Housing & Bills',
        categoryRaw: '🏠 Housing & Bills',
        categoryEmoji: '🏠',
        subcategory: 'Internet (Unifi)',
        note: 'TM Unifi 100Mbps Bill',
        type: 'expense',
        transferDirection: null,
        amount: 139.00,
        currency: 'MYR',
        isTransfer: false,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      });
    }

    // 4. Internal Transfers (Isolated from spend/income!)
    if (maxDay >= 3) {
      const dateStr = `${year}-${mStr}-03`;
      // Transfer Out from Maybank
      transactions.push({
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Maybank',
          type: 'transfer',
          amount: 300.00,
          category: 'Transfer',
          subcategory: 'Wallet Reload',
          note: 'Top up TnG eWallet',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 3),
        year,
        month,
        day: 3,
        account: 'Maybank',
        category: 'Transfer',
        categoryRaw: '🔄 Transfer',
        categoryEmoji: '🔄',
        subcategory: 'Wallet Reload',
        note: 'Top up TnG eWallet',
        type: 'transfer',
        transferDirection: 'out',
        amount: 300.00,
        currency: 'MYR',
        isTransfer: true,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      });

      // Corresponding Transfer In to Touch 'N Go
      transactions.push({
        id: generateTransactionHashSync({
          date: dateStr,
          account: 'Touch \'N Go',
          type: 'transfer',
          amount: 300.00,
          category: 'Transfer',
          subcategory: 'Wallet Reload',
          note: 'Reload from Maybank',
          discriminator: 1,
        }),
        date: dateStr,
        timestamp: Date.UTC(year, month - 1, 3),
        year,
        month,
        day: 3,
        account: 'Touch \'N Go',
        category: 'Transfer',
        categoryRaw: '🔄 Transfer',
        categoryEmoji: '🔄',
        subcategory: 'Wallet Reload',
        note: 'Reload from Maybank',
        type: 'transfer',
        transferDirection: 'in',
        amount: 300.00,
        currency: 'MYR',
        isTransfer: true,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      });
    }

    // 5. Daily lifestyle expenses (Food, Petrol, Groceries, Coffee)
    for (let day = 1; day <= maxDay; day++) {
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      const dayTimestamp = Date.UTC(year, month - 1, day);

      // Lunch every day
      const lunchAmount = 14 + (day % 11) * 1.5;
      transactions.push({
        id: generateTransactionHashSync({
          date: dateStr,
          account: day % 2 === 0 ? 'Touch \'N Go' : 'Maybank',
          type: 'expense',
          amount: lunchAmount,
          category: 'Food & Drink',
          subcategory: 'Lunch',
          note: day % 3 === 0 ? 'Kopitiam Chicken Rice' : day % 3 === 1 ? 'Nasi Kandar Pelita' : 'Subway Wrap',
          discriminator: 0,
        }),
        date: dateStr,
        timestamp: dayTimestamp,
        year,
        month,
        day,
        account: day % 2 === 0 ? 'Touch \'N Go' : 'Maybank',
        category: 'Food & Drink',
        categoryRaw: '🍽️ Food & Drink',
        categoryEmoji: '🍽️',
        subcategory: 'Lunch',
        note: day % 3 === 0 ? 'Kopitiam Chicken Rice' : day % 3 === 1 ? 'Nasi Kandar Pelita' : 'Subway Wrap',
        type: 'expense',
        transferDirection: null,
        amount: parseFloat(lunchAmount.toFixed(2)),
        currency: 'MYR',
        isTransfer: false,
        sourceFile: 'sample_export.xlsx',
        importedAt: Date.now(),
      });

      // Dinner every 2 days
      if (day % 2 === 1) {
        const dinnerAmount = 22 + (day % 7) * 3;
        transactions.push({
          id: generateTransactionHashSync({
            date: dateStr,
            account: 'Maybank',
            type: 'expense',
            amount: dinnerAmount,
            category: 'Food & Drink',
            subcategory: 'Dinner',
            note: 'Dinner with friends',
            discriminator: 1,
          }),
          date: dateStr,
          timestamp: dayTimestamp,
          year,
          month,
          day,
          account: 'Maybank',
          category: 'Food & Drink',
          categoryRaw: '🍽️ Food & Drink',
          categoryEmoji: '🍽️',
          subcategory: 'Dinner',
          note: 'Dinner with friends',
          type: 'expense',
          transferDirection: null,
          amount: parseFloat(dinnerAmount.toFixed(2)),
          currency: 'MYR',
          isTransfer: false,
          sourceFile: 'sample_export.xlsx',
          importedAt: Date.now(),
        });
      }

      // Petrol twice a week (every 4th day)
      if (day % 5 === 2) {
        transactions.push({
          id: generateTransactionHashSync({
            date: dateStr,
            account: 'Setel Wallet',
            type: 'expense',
            amount: 65.00,
            category: 'Transport',
            subcategory: 'Petrol',
            note: 'Petronas Primax 95',
            discriminator: 2,
          }),
          date: dateStr,
          timestamp: dayTimestamp,
          year,
          month,
          day,
          account: 'Setel Wallet',
          category: 'Transport',
          categoryRaw: '🚗 Transport',
          categoryEmoji: '🚗',
          subcategory: 'Petrol',
          note: 'Petronas Primax 95',
          type: 'expense',
          transferDirection: null,
          amount: 65.00,
          currency: 'MYR',
          isTransfer: false,
          sourceFile: 'sample_export.xlsx',
          importedAt: Date.now(),
        });
      }

      // Groceries on weekends (day % 7 === 0 or 6)
      if (day % 7 === 0) {
        const grocAmount = 145 + (day % 4) * 20;
        transactions.push({
          id: generateTransactionHashSync({
            date: dateStr,
            account: 'Maybank',
            type: 'expense',
            amount: grocAmount,
            category: 'Food & Drink',
            subcategory: 'Groceries',
            note: 'Jaya Grocer Weekly',
            discriminator: 3,
          }),
          date: dateStr,
          timestamp: dayTimestamp,
          year,
          month,
          day,
          account: 'Maybank',
          category: 'Food & Drink',
          categoryRaw: '🍽️ Food & Drink',
          categoryEmoji: '🍽️',
          subcategory: 'Groceries',
          note: 'Jaya Grocer Weekly',
          type: 'expense',
          transferDirection: null,
          amount: parseFloat(grocAmount.toFixed(2)),
          currency: 'MYR',
          isTransfer: false,
          sourceFile: 'sample_export.xlsx',
          importedAt: Date.now(),
        });
      }
    }
  }

  // Set default monthly budgets
  for (const { year, month } of monthsToGenerate) {
    const ym = `${year}-${String(month).padStart(2, '0')}`;
    await db.budgets.put({
      yearMonth: ym,
      totalBudgetLimit: 4500,
      savingsGoalTarget: 40,
    });
  }

  await db.transactions.bulkPut(transactions);
  return transactions.length;
}
