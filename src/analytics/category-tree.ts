import { NormalizedTransaction } from '@/core/types/ledger';
import { CategorySummary } from '@/core/types/analytics';

/**
 * Aggregates expenses by parent category and subcategory
 */
export function buildCategoryTree(
  transactions: NormalizedTransaction[],
  typeFilter: 'expense' | 'income' = 'expense'
): CategorySummary[] {
  const filtered = transactions.filter(t => !t.isTransfer && t.type === typeFilter);
  const totalAmount = filtered.reduce((acc, t) => acc + t.amount, 0);

  const categoryMap = new Map<string, {
    category: string;
    categoryRaw: string;
    categoryEmoji?: string;
    amount: number;
    count: number;
    subMap: Map<string, { amount: number; count: number }>;
  }>();

  for (const t of filtered) {
    const cat = t.category || 'Uncategorized';
    let entry = categoryMap.get(cat);
    if (!entry) {
      entry = {
        category: cat,
        categoryRaw: t.categoryRaw || cat,
        categoryEmoji: t.categoryEmoji,
        amount: 0,
        count: 0,
        subMap: new Map(),
      };
      categoryMap.set(cat, entry);
    }

    entry.amount += t.amount;
    entry.count += 1;

    const sub = t.subcategory || 'General';
    const subEntry = entry.subMap.get(sub) || { amount: 0, count: 0 };
    subEntry.amount += t.amount;
    subEntry.count += 1;
    entry.subMap.set(sub, subEntry);
  }

  const summaries: CategorySummary[] = [];

  for (const item of categoryMap.values()) {
    const subcategories = Array.from(item.subMap.entries()).map(([subName, data]) => ({
      name: subName,
      amount: parseFloat(data.amount.toFixed(2)),
      percentage: item.amount > 0 ? parseFloat(((data.amount / item.amount) * 100).toFixed(1)) : 0,
      count: data.count,
    })).sort((a, b) => b.amount - a.amount);

    summaries.push({
      category: item.category,
      categoryRaw: item.categoryRaw,
      categoryEmoji: item.categoryEmoji,
      amount: parseFloat(item.amount.toFixed(2)),
      percentage: totalAmount > 0 ? parseFloat(((item.amount / totalAmount) * 100).toFixed(1)) : 0,
      count: item.count,
      subcategories,
    });
  }

  // Sort descending by amount
  return summaries.sort((a, b) => b.amount - a.amount);
}
