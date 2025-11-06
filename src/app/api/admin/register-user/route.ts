import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, phone, sector, litersBalance } = await req.json();

    // Verificar si el usuario ya existe
    const existingUser = await prisma.person.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este número de teléfono' },
        { status: 400 }
      );
    }

    // Crear el nuevo usuario
    const user = await prisma.person.create({
      data: {
        name,
        phone,
        sector: {
          connectOrCreate: {
            where: { name: sector },
            create: { name: sector }
          }
        },
        litersBalance: Number(litersBalance)
      },
      include: {
        sector: true
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
