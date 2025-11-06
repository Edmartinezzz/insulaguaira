'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ExclamationTriangleIcon, UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [esAdmin, setEsAdmin] = useState(true);
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuario || !contrasena) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(usuario, contrasena);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleClienteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Redirigir directamente a la página del cliente
    router.push('/cliente');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {esAdmin ? 'Iniciar sesión' : 'Consulta de Cliente'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {esAdmin 
              ? 'Ingrese sus credenciales de administrador' 
              : 'Ingrese su número de teléfono para ver su saldo'}
          </p>
        </div>

        {/* Selector de tipo de usuario */}
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setEsAdmin(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 ${
              esAdmin 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center">
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Administrador
            </div>
          </button>
          <button
            type="button"
            onClick={() => setEsAdmin(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 ${
              !esAdmin 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              Cliente
            </div>
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {esAdmin ? (
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="usuario" className="sr-only">
                  Usuario
                </label>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contrasena" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleClienteLogin}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="telefono" className="sr-only">
                  Teléfono
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+1</span>
                  </div>
                  <input
                    type="tel"
                    name="telefono"
                    id="telefono"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Ingrese su teléfono"
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Ver mi saldo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
