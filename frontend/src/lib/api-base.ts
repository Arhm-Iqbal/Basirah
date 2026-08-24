const CONFIGURED = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '') ?? '';

// A request still open after this is stalled, not slow. Without it an unreachable backend
// never settles the promise, so whichever button started the call sits in its pending state
// until the tab is closed.
const REQUEST_TIMEOUT_MS = 20_000;

function isLoopback(value: string) {
  try {
    const { hostname } = new URL(value);
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}

// NEXT_PUBLIC_* is inlined at build time, so a developer's localhost value survives into a
// production bundle, where an https page blocks it as mixed content and every call fails.
// The Hono app is also mounted at /api by app/api/[...path]/route.ts, so same-origin is the
// correct default and a deployment needs no API host of its own.
export function apiBase(): string {
  if (!CONFIGURED) return '/api';
  if (
    isLoopback(CONFIGURED) &&
    typeof window !== 'undefined' &&
    !isLoopback(window.location.origin)
  )
    return '/api';
  return CONFIGURED;
}

export function apiUrl(path: string): string {
  return `${apiBase()}${path}`;
}

function timeoutSignal(): AbortSignal | undefined {
  return typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    : undefined;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(apiUrl(path), { ...init, signal: init.signal ?? timeoutSignal() });
  } catch (cause) {
    throw new Error('Could not reach the server. Check your connection and try again.', { cause });
  }
}
