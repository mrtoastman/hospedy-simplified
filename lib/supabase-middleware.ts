import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, public pages, and API routes
  if (
    pathname === '/' ||
    pathname.startsWith('/landing') ||
    pathname.startsWith('/demo') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Only run Supabase auth check for /dashboard and /auth routes
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Check env vars exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase env vars missing in middleware');
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as CookieOptions)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect /dashboard — redirect to login if not authenticated
    if (pathname.startsWith('/dashboard') && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If logged in user visits auth pages, redirect to dashboard
    if (pathname.startsWith('/auth/') && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch (error) {
    console.error('Middleware auth error:', error);
    // Don't block the request on auth failure
  }

  return supabaseResponse;
}
