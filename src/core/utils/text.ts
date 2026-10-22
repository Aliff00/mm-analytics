/**
 * Text & Emoji sanitization utilities
 */

// Modern Unicode regex with 'u' flag matching full emoji sequences with optional variation selectors and ZWJ
const EMOJI_REGEX = /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*/u;

export interface ExtractedCategory {
  cleanName: string;
  rawName: string;
  emoji?: string;
}

export function extractCategoryInfo(raw: string | undefined | null): ExtractedCategory {
  if (!raw || !raw.trim()) {
    return { cleanName: 'Uncategorized', rawName: 'Uncategorized' };
  }

  const trimmed = raw.trim();
  const match = trimmed.match(EMOJI_REGEX);

  if (match) {
    const emoji = match[1].trim();
    const cleanName = trimmed.replace(EMOJI_REGEX, '').trim() || trimmed;
    return {
      cleanName,
      rawName: trimmed,
      emoji: emoji || undefined,
    };
  }

  return {
    cleanName: trimmed,
    rawName: trimmed,
  };
}

export function sanitizeText(val: unknown): string {
  if (val == null) return '';
  return String(val).trim().replace(/\s+/g, ' ');
}

