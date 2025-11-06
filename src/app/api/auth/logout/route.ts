import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  // clear cookies
  res.cookies.set('personId', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('role', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
