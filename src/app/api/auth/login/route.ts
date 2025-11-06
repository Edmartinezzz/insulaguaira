import { NextRequest, NextResponse } from 'next/server';

// Importación condicional de Prisma para mejor manejo de errores
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | undefined;

try {
  // @ts-ignore - La importación dinámica puede fallar
  prisma = (await import('../../../../lib/prisma')).prisma;
} catch (error) {
  console.error('Error al importar Prisma:', error);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Solicitud de login recibida:', { body });
    
    const { type } = body;

    if (type === 'admin') {
      const password = body.password || '';
      
      // Validar contraseña
      if (password === '1230') {
        console.log('Autenticación exitosa para admin');
        const response = NextResponse.json({ 
          ok: true, 
          role: 'admin',
          user: {
            name: 'Administrador'
          }
        });
        
        // Configurar cookies de sesión
        response.cookies.set('role', 'admin', { 
          httpOnly: true, 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 1 semana
        });
        
        return response;
      }
      
      console.log('Contraseña incorrecta');
      return NextResponse.json(
        { ok: false, error: 'Contraseña incorrecta' }, 
        { status: 401 }
      );
    }

    if (type === 'person') {
      try {
        const phone = body.phone;
        if (!phone) {
          return NextResponse.json({ ok: false, error: 'Número de teléfono requerido' }, { status: 400 });
        }
        
        if (!prisma) {
          console.error('Prisma no está inicializado');
          return NextResponse.json({ ok: false, error: 'Error en el servidor' }, { status: 500 });
        }
        
        const person = await prisma.person.findUnique({ where: { phone } });
        if (!person) {
          return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 });
        }
        
        const response = NextResponse.json({ 
          ok: true, 
          role: 'person', 
          personId: person.id 
        });
        
        response.cookies.set('personId', person.id, { 
          httpOnly: true, 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        return response;
      } catch (error) {
        console.error('Error en autenticación de persona:', error);
        return NextResponse.json(
          { ok: false, error: 'Error en el servidor al autenticar' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: 'Tipo de autenticación no válido' }, 
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error en el endpoint de login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
