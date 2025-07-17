import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.headers.get('trio_auth');

  if (!token || token !== "UURNUzYkeVJuSlR5P0BwYWFwZ2ZxU3BwQWhoUiZiQkJTcmFoWEpFVA==") {
    return new NextResponse('⛔ Authorization Required ', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/auth|.*\\.css$|.*\\.js$).*)'],
};