/**
 * Resilient date parser and formatter for iOS Money Manager data
 */

export interface ParsedDate {
  dateStr: string;   // 'YYYY-MM-DD'
  year: number;      // e.g. 2026
  month: number;     // 1 - 12
  day: number;       // 1 - 31
  timestamp: number; // Unix epoch ms
}

/**
 * Converts Excel Serial Number (e.g. 45210) to JavaScript Date (UTC)
 */
export function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  const totalSeconds = Math.floor(86400 * fractionalDay);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const ms = (utcDays * 86400 + totalSeconds) * 1000;
  return new Date(ms);
}

/**
 * Parses raw input from Excel into canonical YYYY-MM-DD parts.
 * Avoids browser timezone shift traps.
 */
export function parseRawDate(raw: unknown): ParsedDate | null {
  if (raw == null || raw === '') return null;

  let jsDate: Date | null = null;

  if (typeof raw === 'number') {
    // Excel serial number
    if (raw > 20000 && raw < 80000) {
      jsDate = excelSerialToDate(raw);
      if (!isNaN(jsDate.getTime())) {
        return createParsedDate(
          jsDate.getUTCFullYear(),
          jsDate.getUTCMonth() + 1,
          jsDate.getUTCDate()
        );
      }
    }
  } else if (raw instanceof Date) {
    if (!isNaN(raw.getTime())) {
      jsDate = raw;
    }
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();

    // Check for DD/MM/YYYY or DD-MM-YYYY with optional time
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10);
      const year = parseInt(ddmmyyyyMatch[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return createParsedDate(year, month, day);
      }
    }

    // Check for YYYY/MM/DD or YYYY-MM-DD with optional time
    const yyyymmddMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (yyyymmddMatch) {
      const year = parseInt(yyyymmddMatch[1], 10);
      const month = parseInt(yyyymmddMatch[2], 10);
      const day = parseInt(yyyymmddMatch[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return createParsedDate(year, month, day);
      }
    }

    // Fallback standard parse
    const parsedTimestamp = Date.parse(trimmed);
    if (!isNaN(parsedTimestamp)) {
      jsDate = new Date(parsedTimestamp);
    }
  }

  if (jsDate && !isNaN(jsDate.getTime())) {
    return createParsedDate(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate()
    );
  }

  return null;
}

function createParsedDate(year: number, month: number, day: number): ParsedDate {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const dateStr = `${year}-${m}-${d}`;
  // Use UTC midnight for deterministic timestamp
  const timestamp = Date.UTC(year, month - 1, day);

  return {
    dateStr,
    year,
    month,
    day,
    timestamp,
  };
}

/**
 * Returns total days in a month (e.g. Feb 2024 = 29, Feb 2025 = 28)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Formats YYYY-MM to human readable (e.g. "October 2023")
 */
export function formatMonthName(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return yearMonth;

  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns current month string in 'YYYY-MM' format
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

