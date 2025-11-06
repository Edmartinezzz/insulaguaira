import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const inventories = await (prisma as any).fuelInventory.findMany({ include: { sector: true } });
  return NextResponse.json(inventories);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, litersAvailable } = body;
  if (!id || typeof litersAvailable !== 'number') {
    return NextResponse.json({ error: 'id y litersAvailable requeridos' }, { status: 400 });
  }

  const updated = await (prisma as any).fuelInventory.update({ where: { id }, data: { litersAvailable } });
  return NextResponse.json(updated);
}
