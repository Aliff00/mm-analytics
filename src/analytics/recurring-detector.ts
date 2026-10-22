import { NormalizedTransaction } from '@/core/types/ledger';
import { RecurringSubscriptionItem } from '@/core/types/analytics';

/**
 * Smart Recurring / Subscription Detector
 * Heuristic detector flagging transactions repeating monthly with identical or near-identical notes/amounts.
 */
export function detectRecurringSubscriptions(
  allTransactions: NormalizedTransaction[]
): RecurringSubscriptionItem[] {
  // Only evaluate expenses (exclude transfers and incomes)
  const expenses = allTransactions.filter(t => !t.isTransfer && t.type === 'expense');

  // Group by (cleanNote + roughAmount)
  const patternGroups = new Map<string, {
    note: string;
    category: string;
    categoryRaw: string;
    categoryEmoji?: string;
    account: string;
    amounts: number[];
    dates: string[];
    months: Set<string>;
  }>();

  for (const t of expenses) {
    if (!t.note || t.note.trim().length < 3) continue;

    // Normalize note: lowercase, remove numbers at the end (e.g. invoice numbers), clean whitespace
    const cleanNote = t.note.toLowerCase().trim().replace(/#[0-9]+/g, '').trim();
    // Bucket amount to nearest 5% to account for slight currency/tax fluctuations
    const amountBucket = Math.round(t.amount);
    const groupKey = `${cleanNote}__${amountBucket}`;

    let group = patternGroups.get(groupKey);
    if (!group) {
      group = {
        note: t.note,
        category: t.category,
        categoryRaw: t.categoryRaw,
        categoryEmoji: t.categoryEmoji,
        account: t.account,
        amounts: [],
        dates: [],
        months: new Set(),
      };
      patternGroups.set(groupKey, group);
    }

    group.amounts.push(t.amount);
    group.dates.push(t.date);
    group.months.add(`${t.year}-${String(t.month).padStart(2, '0')}`);
  }

  const subscriptions: RecurringSubscriptionItem[] = [];

  for (const [key, group] of patternGroups.entries()) {
    // Only items occurring in 2 or more distinct months qualify
    if (group.months.size >= 2) {
      const avgAmount = group.amounts.reduce((a, b) => a + b, 0) / group.amounts.length;
      const sortedDates = [...group.dates].sort();
      const lastDate = sortedDates[sortedDates.length - 1];
      const lastAmount = group.amounts[group.amounts.length - 1];

      // Confidence score based on distinct months and amount variance
      const variance = Math.max(...group.amounts) - Math.min(...group.amounts);
      const isExactAmount = variance === 0;
      let confidence = Math.min(1.0, 0.5 + group.months.size * 0.15 + (isExactAmount ? 0.2 : 0));

      // Cadence estimation
      let cadence: RecurringSubscriptionItem['cadence'] = 'monthly';
      if (group.amounts.length / group.months.size > 2.2) {
        cadence = 'bi-weekly';
      }

      subscriptions.push({
        key,
        note: group.note,
        category: group.category,
        categoryRaw: group.categoryRaw,
        categoryEmoji: group.categoryEmoji,
        account: group.account,
        averageAmount: parseFloat(avgAmount.toFixed(2)),
        lastAmount: parseFloat(lastAmount.toFixed(2)),
        occurrences: group.months.size,
        lastDate,
        cadence,
        estimatedAnnualCost: parseFloat((avgAmount * (cadence === 'monthly' ? 12 : 26)).toFixed(2)),
        confidenceScore: parseFloat(confidence.toFixed(2)),
      });
    }
  }

  // Sort by highest average amount descending
  return subscriptions.sort((a, b) => b.averageAmount - a.averageAmount);
}

