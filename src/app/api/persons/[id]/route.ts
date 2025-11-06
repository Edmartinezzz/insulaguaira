import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  const person = await (prisma as any).person.findUnique({ where: { id }, include: { sector: true, vehicles: true } });
  if (!person) return NextResponse.json({ error: 'no encontrado' }, { status: 404 });
  return NextResponse.json(person);
}
