import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: NextRequest) {
  const personId = req.cookies.get('personId')?.value;
  const role = req.cookies.get('role')?.value;

  if (role === 'admin') return NextResponse.json({ ok: true, role: 'admin' });
  if (personId) {
    const person = await (prisma as any).person.findUnique({ where: { id: personId }, include: { sector: true, vehicles: true } });
    if (!person) return NextResponse.json({ ok: false, error: 'Persona no encontrada' }, { status: 404 });
    return NextResponse.json({ ok: true, role: 'person', person });
  }

  return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
}
