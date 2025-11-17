import { NextResponse } from 'next/server';

// Nota: las estadísticas reales se sirven desde el backend Express en /api/estadisticas.
// Este handler existe solo para evitar errores en tiempo de build/ejecución en Vercel
// y devuelve un mensaje informativo si alguien lo invoca directamente en el frontend.

export async function GET() {
  return NextResponse.json(
    {
      error:
        'Este endpoint de Next.js no está activo. Las estadísticas del dashboard se obtienen directamente del backend Express (ruta /api/estadisticas).',
    },
    { status: 503 }
  );
}
