import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('trio_auth');
  const token = cookie?.value ?? null;

  if (!token || token !== "UURNUzYkeVJuSlR5P0BwYWFwZ2ZxU3BwQWhoUiZiQkJTcmFoWEpFVA==") {
    return new NextResponse('⛔ Authorization Required ', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/auth|.*\\.css$|.*\\.js$).*)'],
};