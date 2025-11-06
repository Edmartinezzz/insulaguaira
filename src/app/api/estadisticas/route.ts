import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const clientesCount = await db.get<{ total: number }>(
      'SELECT COUNT(*) as total FROM clientes WHERE activo = 1'
    );

    const litrosEntregados = await db.get<{ total: number }>(
      `SELECT COALESCE(SUM(litros), 0) as total
       FROM retiros r
       JOIN clientes c ON r.cliente_id = c.id
       WHERE c.activo = 1`
    );

    const proximosVencimientos = await db.get<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM clientes
       WHERE activo = 1
       AND (litros_disponibles / NULLIF(litros_mes, 0)) < 0.2`
    );

    return NextResponse.json({
      totalClientes: clientesCount?.total || 0,
      totalLitrosEntregados: litrosEntregados?.total || 0,
      proximosVencimientos: proximosVencimientos?.total || 0,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
