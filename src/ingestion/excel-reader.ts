import * as XLSX from 'xlsx';
import { RawImportRow } from '@/core/types/ledger';

export interface ParsedSheetData {
  sheetName: string;
  rows: RawImportRow[];
  totalRows: number;
}

/**
 * Reads an Excel file buffer and extracts rows from the active sheet.
 */
export async function readExcelFile(file: File): Promise<ParsedSheetData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: false, // Keep serial numbers to allow resilient custom date conversion
    dense: false,
  });

  if (!workbook.SheetNames.length) {
    throw new Error('The uploaded Excel file contains no worksheets.');
  }

  // Target the first sheet, or one named "Data", "Export", "Money Manager"
  const preferredNames = ['data', 'export', 'money manager', 'transactions'];
  let targetSheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    if (preferredNames.includes(name.toLowerCase())) {
      targetSheetName = name;
      break;
    }
  }

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${targetSheetName}" could not be read.`);
  }

  // Parse as JSON with raw values preserved
  const rawRows = XLSX.utils.sheet_to_json<RawImportRow>(worksheet, {
    defval: '',
    raw: true,
  });

  return {
    sheetName: targetSheetName,
    rows: rawRows,
    totalRows: rawRows.length,
  };
}
