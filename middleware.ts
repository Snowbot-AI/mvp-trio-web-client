import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('trio_auth');
  const token = cookie?.value ?? null;

  const expected = process.env.AUTH_TOKEN;
  if (!expected || expected.length < 16) {
    // Do not leak configuration details
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!token || token !== expected) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/auth|.*\\.css$|.*\\.js$).*)'],
};