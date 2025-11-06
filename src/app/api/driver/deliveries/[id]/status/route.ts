import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await context.params;
    
    if (!status) {
      return NextResponse.json(
        { error: 'status requerido' },
        { status: 400 }
      );
    }

    const updated = await prisma.delivery.update({
      where: { id },
      data: { status }
    });

    if (status === 'ENTREGADO') {
      // cerrar pedido
      await prisma.order.update({
        where: { id: updated.orderId },
        data: { status: 'COMPLETADO' }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el estado de la entrega' },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: 'edge',
};


