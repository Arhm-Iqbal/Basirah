const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

// Ambiguous glyphs (I/L/O/0/1/U) are excluded: this code gets read off a screen and
// typed back in by hand, often once, with no way to recover it if mistyped.
export function generateClaimCode(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return `${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;
}

export async function hashClaimCode(code: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code.trim().toUpperCase()),
  );
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
