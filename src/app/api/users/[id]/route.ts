import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener un usuario por ID
async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(params.id) },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

// Actualizar un usuario
async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, phone, role } = await request.json();

    // Validar datos
    if (!name || !phone || !role) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(params.id) },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el teléfono ya está en uso por otro usuario
    const phoneInUse = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: Number(params.id) },
      },
    });

    if (phoneInUse) {
      return NextResponse.json(
        { error: 'El teléfono ya está en uso por otro usuario' },
        { status: 400 }
      );
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: Number(params.id) },
      data: {
        name,
        phone,
        role,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

// Eliminar un usuario
async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(params.id) },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: Number(params.id) },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}

export { GET, PUT, DELETE };
