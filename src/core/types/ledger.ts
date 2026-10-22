// ==========================================
// Raw Ingestion Interfaces (iOS Money Manager Spec)
// ==========================================

export type RawTransactionType =
  | 'Exp.'
  | 'Income'
  | 'Transfer-In'
  | 'Transfer-Out'
  | string;

export interface RawImportRow {
  Period?: string | number | Date;
  Accounts?: string;
  Category?: string;
  Subcategory?: string;
  Note?: string;
  Description?: string;
  'Income/Expense'?: string;
  Amount?: string | number;
  MYR?: string | number;
  [key: string]: unknown;
}

// ==========================================
// Normalized Domain Model
// ==========================================

export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransferDirection = 'in' | 'out' | null;

export interface NormalizedTransaction {
  id: string;                      // Deterministic SHA-256 fingerprint
  date: string;                    // Canonical 'YYYY-MM-DD'
  timestamp: number;               // Epoch millisecond for fast sorting
  year: number;                    // 2026
  month: number;                   // 1 - 12
  day: number;                     // 1 - 31
  account: string;                 // Sanitized account name (e.g. 'Maybank')
  category: string;                // Category without emoji for clean grouping
  categoryRaw: string;             // Category with emoji intact
  categoryEmoji?: string;          // Extracted emoji (e.g., '🍽️')
  subcategory: string;             // Subcategory (e.g., 'Lunch')
  note: string;                    // Memo / merchant name
  type: TransactionType;           // 'expense' | 'income' | 'transfer'
  transferDirection: TransferDirection; // 'in' | 'out' | null
  amount: number;                  // Positive float (2 decimal places)
  currency: string;                // Default 'MYR'
  isTransfer: boolean;             // True if transfer (isolated from spend calculations)
  sourceFile?: string;             // Audit trail
  importedAt: number;              // Ingestion epoch ms
}

// ==========================================
// Ingestion Batch Result
// ==========================================

export interface IngestionBatchResult {
  totalRows: number;
  newCount: number;
  updatedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: string[];
  dateRange: {
    min: string;
    max: string;
  };
  sampleTransactions: NormalizedTransaction[];
}

// ==========================================
// Master Ledger State (for JSON Snapshots & Drive Sync)
// ==========================================

export interface MasterLedgerState {
  version: number;
  exportedAt: string;
  transactions: NormalizedTransaction[];
  budgets: Record<string, import('./analytics').MonthlyBudgetConfig>;
  metadata: {
    totalRecords: number;
    accountList: string[];
    earliestDate: string;
    latestDate: string;
  };
}
