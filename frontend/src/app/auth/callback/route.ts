import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { safeAuthNextPath } from '@/lib/supabase/auth-path';

export const dynamic = 'force-dynamic';

function loginRedirect(origin: string, reason: string) {
  const url = new URL('/login', origin);
  url.searchParams.set('error', reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeAuthNextPath(searchParams.get('next'));
  const oauthError = searchParams.get('error');
  const description = searchParams.get('error_description') ?? '';

  const redirectTo = `${origin}${next}`;
  let response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.redirect(redirectTo);
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(redirectTo);
    }

    return loginRedirect(origin, 'auth_callback_failed');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(redirectTo);
  }

  if (oauthError || /state not found|expired/i.test(description)) {
    return loginRedirect(origin, 'auth_callback_failed');
  }

  return loginRedirect(origin, 'auth_callback_failed');
}
