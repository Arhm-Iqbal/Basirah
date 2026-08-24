export function safeAuthNextPath(path: string | null) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/app';

  try {
    const base = new URL('https://basirah.invalid');
    const destination = new URL(path, base);
    if (destination.origin !== base.origin) return '/app';

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return '/app';
  }
}
