import { type NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get('code');

  if (code && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    if (!searchParams.get('next')) {
      url.searchParams.set('next', '/app');
    }
    return NextResponse.redirect(url);
  }

  if (searchParams.get('error') && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|otf)$).*)',
  ],
};
