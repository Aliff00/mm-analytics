/**
 * Computes deterministic SHA-256 fingerprint for a Money Manager transaction.
 * Fallback to FNV-1a if crypto.subtle is unavailable in non-secure contexts.
 */

function fallbackHash(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export async function generateTransactionHash(parts: {
  date: string;
  account: string;
  type: string;
  amount: number;
  category: string;
  subcategory: string;
  note: string;
  discriminator?: number;
}): Promise<string> {
  const normalizedPayload = [
    parts.date.trim(),
    parts.account.trim().toLowerCase(),
    parts.type.trim().toLowerCase(),
    parts.amount.toFixed(2),
    parts.category.trim().toLowerCase(),
    parts.subcategory.trim().toLowerCase(),
    parts.note.trim().toLowerCase(),
    parts.discriminator ?? 0,
  ].join('|');

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(normalizedPayload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback if subtle digest fails
    }
  }

  return fallbackHash(normalizedPayload);
}

/**
 * Synchronous hash helper for instant operations
 */
export function generateTransactionHashSync(parts: {
  date: string;
  account: string;
  type: string;
  amount: number;
  category: string;
  subcategory: string;
  note: string;
  discriminator?: number;
}): string {
  const normalizedPayload = [
    parts.date.trim(),
    parts.account.trim().toLowerCase(),
    parts.type.trim().toLowerCase(),
    parts.amount.toFixed(2),
    parts.category.trim().toLowerCase(),
    parts.subcategory.trim().toLowerCase(),
    parts.note.trim().toLowerCase(),
    parts.discriminator ?? 0,
  ].join('|');

  return fallbackHash(normalizedPayload);
}
