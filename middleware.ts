import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;

  if (!token) {
    return new NextResponse('⛔ Authorization Required', { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return new NextResponse('⛔ Authorization Required', { status: 401 });
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.css$|.*\\.js$).*)'],
};