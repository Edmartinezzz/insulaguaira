'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';

export default function ClienteLogin() {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useClienteAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formato de cédula venezolana (7 u 8 dígitos)
    const cedulaRegex = /^[0-9]{7,8}$/;
    if (!cedulaRegex.test(cedula)) {
      setError('La cédula debe tener 7 u 8 dígitos numéricos');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(cedula);
      // Redirección manejada por el contexto después del login exitoso
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setError(error.message || 'Error al iniciar sesión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio
      </button>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingrese su número de cédula para acceder a su cuenta
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="cedula" className="sr-only">
                Número de cédula
              </label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Número de cédula (7 u 8 dígitos)"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                maxLength={8}
                pattern="\d{7,8}"
                title="Ingrese un número de cédula válido (7 u 8 dígitos)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <button 
              onClick={() => router.push('/registro')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
