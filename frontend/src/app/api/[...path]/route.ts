import 'server-only';

import backend, { type Bindings } from '@basirah/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getBindings(origin: string): Bindings | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) return null;

  const configuredOrigins = process.env.ALLOWED_ORIGINS?.trim();

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ?? '',
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    ALLOWED_ORIGINS: configuredOrigins ? `${configuredOrigins},${origin}` : origin,
  };
}

async function handler(request: Request) {
  const url = new URL(request.url);
  const bindings = getBindings(url.origin);

  if (!bindings) {
    return Response.json(
      {
        error: {
          code: 'service_not_configured',
          message: 'The reporting service is not configured for this deployment.',
        },
      },
      { status: 503 },
    );
  }

  url.pathname = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
  const backendRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body,
    redirect: request.redirect,
  });

  return backend.fetch(backendRequest, bindings);
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
