import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('trio_auth');
  const token = cookie?.value ?? null;

  const expected = process.env.AUTH_TOKEN;
  if (!expected || expected.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('⛔ Misconfiguration: AUTH_TOKEN is required', { status: 500 });
    }
  }

  if (!token || (expected && token !== expected)) {
    return new NextResponse('⛔ Authorization Required ', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/auth|.*\\.css$|.*\\.js$).*)'],
};