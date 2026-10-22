import { NormalizedTransaction, RawImportRow, IngestionBatchResult } from '@/core/types/ledger';
import { detectHeaders, isRowValid } from './schema-validator';
import { normalizeRow } from './normalizer';

/**
 * Deduplicates and prepares transactions for atomic insertion into Dexie.js
 */
export function processRawRows(
  rows: RawImportRow[],
  existingIds: Set<string>,
  sourceFileName: string = 'import.xlsx'
): {
  toInsert: NormalizedTransaction[];
  result: IngestionBatchResult;
} {
  const result: IngestionBatchResult = {
    totalRows: rows.length,
    newCount: 0,
    updatedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
    errors: [],
    dateRange: { min: '9999-99-99', max: '0000-00-00' },
    sampleTransactions: [],
  };

  if (rows.length === 0) {
    return { toInsert: [], result };
  }

  // Detect header schema from the first non-empty row
  let mapping = null;
  for (const r of rows.slice(0, 10)) {
    mapping = detectHeaders(r);
    if (mapping) break;
  }

  if (!mapping) {
    result.errorCount = rows.length;
    result.errors.push('Could not detect Money Manager column structure (missing Period or Amount columns).');
    return { toInsert: [], result };
  }

  const toInsert: NormalizedTransaction[] = [];
  const seenInBatchCount = new Map<string, number>();

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    if (!isRowValid(rawRow, mapping)) {
      result.errorCount++;
      continue;
    }

    // Key for identical transactions within the same import file
    const approxKey = `${rawRow[mapping.periodKey]}_${rawRow[mapping.accountKey]}_${rawRow[mapping.amountKey]}_${rawRow[mapping.noteKey]}`;
    const occ = seenInBatchCount.get(approxKey) || 0;
    seenInBatchCount.set(approxKey, occ + 1);

    const normalized = normalizeRow(
      rawRow,
      mapping,
      { sourceFileName, importedAt: Date.now() },
      occ
    );

    if (!normalized) {
      result.errorCount++;
      continue;
    }

    if (existingIds.has(normalized.id)) {
      result.duplicateCount++;
    } else {
      result.newCount++;
      existingIds.add(normalized.id); // Prevent intra-batch duplicates
      toInsert.push(normalized);
    }

    // Track min/max dates
    if (normalized.date < result.dateRange.min) {
      result.dateRange.min = normalized.date;
    }
    if (normalized.date > result.dateRange.max) {
      result.dateRange.max = normalized.date;
    }

    if (result.sampleTransactions.length < 5) {
      result.sampleTransactions.push(normalized);
    }
  }

  if (result.dateRange.min === '9999-99-99') {
    result.dateRange.min = '';
    result.dateRange.max = '';
  }

  return { toInsert, result };
}
