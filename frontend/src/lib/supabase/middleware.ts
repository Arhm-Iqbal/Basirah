import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { safeAuthNextPath } from '@/lib/supabase/auth-path';
import { getSupabasePublicConfig } from '@/lib/supabase/config';

function isProtectedPath(path: string) {
  return path === '/app' || path.startsWith('/app/');
}

function redirectToLogin(
  request: NextRequest,
  response: NextResponse,
  reason?: 'auth_not_configured' | 'auth_unavailable',
) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (reason) loginUrl.searchParams.set('error', reason);

  const redirect = NextResponse.redirect(loginUrl);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const config = getSupabasePublicConfig();

  if (!config) {
    return isProtectedPath(path)
      ? redirectToLogin(request, response, 'auth_not_configured')
      : response;
  }

  try {
    const supabase = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Must stay getUser, not getSession: getSession trusts the cookie without revalidating.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtectedPath(path)) {
      return redirectToLogin(request, response);
    }

    if (user && (path === '/' || path === '/login' || path === '/signup')) {
      const destination =
        path === '/' ? '/app' : safeAuthNextPath(request.nextUrl.searchParams.get('next'));
      const redirect = NextResponse.redirect(new URL(destination, request.url));
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }

    return response;
  } catch (error) {
    console.error('Supabase auth middleware failed.', error);
    return isProtectedPath(path)
      ? redirectToLogin(request, response, 'auth_unavailable')
      : response;
  }
}
