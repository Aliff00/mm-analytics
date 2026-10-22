/**
 * Currency formatting and sanitization utilities
 */

export function formatCurrency(amount: number, currency: string = 'MYR'): string {
  const formatted = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const prefix = currency === 'MYR' ? 'RM ' : `${currency} `;
  return `${amount < 0 ? '-' : ''}${prefix}${formatted}`;
}

export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `RM ${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `RM ${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
}

/**
 * Resilient amount parser.
 * Handles strings like "RM 1,234.50", "-1,200", "50.00", etc.
 */
export function parseRawAmount(raw: unknown): number {
  if (typeof raw === 'number') {
    return Math.abs(raw);
  }
  if (typeof raw === 'string') {
    // Strip everything except numbers, dots, and minus signs
    const sanitized = raw.replace(/[^0-9.-]/g, '');
    const num = parseFloat(sanitized);
    return isNaN(num) ? 0 : Math.abs(num);
  }
  return 0;
}

