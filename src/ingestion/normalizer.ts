import { NormalizedTransaction, RawImportRow, TransactionType, TransferDirection } from '@/core/types/ledger';
import { HeaderMapping } from './schema-validator';
import { parseRawDate } from '@/core/utils/dates';
import { parseRawAmount } from '@/core/utils/currency';
import { extractCategoryInfo, sanitizeText } from '@/core/utils/text';
import { generateTransactionHashSync } from '@/core/crypto/fingerprint';

export interface NormalizationContext {
  sourceFileName?: string;
  importedAt?: number;
}

/**
 * Normalizes a single raw row into a canonical NormalizedTransaction
 */
export function normalizeRow(
  row: RawImportRow,
  mapping: HeaderMapping,
  context: NormalizationContext = {},
  intraFileIndex: number = 0
): NormalizedTransaction | null {
  const rawDate = row[mapping.periodKey];
  const parsedDate = parseRawDate(rawDate);
  if (!parsedDate) {
    return null;
  }

  const rawAmount = row[mapping.amountKey];
  const amount = parseRawAmount(rawAmount);
  if (amount <= 0 && rawAmount !== 0) {
    // Drop 0 or unparseable amounts if required, or keep 0-amount if note exists
  }

  const rawType = String(row[mapping.typeKey] || '').trim().toLowerCase();
  let type: TransactionType = 'expense';
  let transferDirection: TransferDirection = null;
  let isTransfer = false;

  if (rawType.includes('transfer-in')) {
    type = 'transfer';
    transferDirection = 'in';
    isTransfer = true;
  } else if (rawType.includes('transfer-out')) {
    type = 'transfer';
    transferDirection = 'out';
    isTransfer = true;
  } else if (rawType.includes('income')) {
    type = 'income';
    isTransfer = false;
  } else {
    // Default: Exp. / Expense
    type = 'expense';
    isTransfer = false;
  }

  const account = sanitizeText(row[mapping.accountKey]) || 'Default Account';
  const rawCategory = sanitizeText(row[mapping.categoryKey]) || 'Uncategorized';
  const categoryInfo = extractCategoryInfo(rawCategory);
  const subcategory = sanitizeText(row[mapping.subcategoryKey]);
  const note = sanitizeText(row[mapping.noteKey] || row.Description);

  const hash = generateTransactionHashSync({
    date: parsedDate.dateStr,
    account,
    type,
    amount,
    category: categoryInfo.cleanName,
    subcategory,
    note,
    discriminator: intraFileIndex,
  });

  return {
    id: hash,
    date: parsedDate.dateStr,
    timestamp: parsedDate.timestamp,
    year: parsedDate.year,
    month: parsedDate.month,
    day: parsedDate.day,
    account,
    category: categoryInfo.cleanName,
    categoryRaw: categoryInfo.rawName,
    categoryEmoji: categoryInfo.emoji,
    subcategory,
    note,
    type,
    transferDirection,
    amount,
    currency: 'MYR',
    isTransfer,
    sourceFile: context.sourceFileName,
    importedAt: context.importedAt || Date.now(),
  };
}

