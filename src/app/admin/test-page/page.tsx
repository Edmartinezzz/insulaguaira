'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BackButton from '@/components/ui/BackButton';

export default function TestPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <BackButton href="/dashboard" label="Volver al Dashboard" className="mb-6" />
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Página de Prueba</h1>
            <p className="text-gray-600">
              Esta es una página de prueba para verificar que las rutas funcionan correctamente.
            </p>
            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <p className="text-green-800">
                ✅ Si puedes ver esta página, las rutas están funcionando correctamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
