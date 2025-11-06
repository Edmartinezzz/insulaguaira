import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const persons = await (prisma as any).person.findMany({ include: { sector: true } });
  return NextResponse.json(persons);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, litersBalance } = body;
  if (!id || typeof litersBalance !== 'number') return NextResponse.json({ error: 'id y litersBalance requeridos' }, { status: 400 });

  const updated = await (prisma as any).person.update({ where: { id }, data: { litersBalance } });
  return NextResponse.json(updated);
}
