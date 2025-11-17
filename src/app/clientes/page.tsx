'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiArrowLeft, FiUser, FiPhone, FiMapPin, FiDroplet, FiCalendar, FiDollarSign, FiShield, FiEdit } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BackButton from '@/components/ui/BackButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import CategoryBadge from '@/components/ui/CategoryBadge';
import api from '@/lib/api';
import { Cliente } from '@/types/cliente';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ConsultaCliente() {
  const [telefono, setTelefono] = useState('');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  const buscarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefono.trim()) {
      toast.error('Por favor ingrese un número de teléfono');
      return;
    }

    try {
      setLoading(true);
      setNotFound(false);
      setCliente(null);
      const response = await api.get(`/api/clientes/telefono/${telefono}`);
      setCliente(response.data);
      setNotFound(false);
      setLoading(false);
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      setCliente(null);
      setNotFound(true);
      toast.error('No se encontró ningún cliente con ese teléfono');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden md:max-w-3xl p-6 md:p-8 mt-10 transition-colors duration-300 animate-fade-in-up">
        <div className="flex items-center mb-6">
          <BackButton onClick={() => router.back()} className="mr-2" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-red-800 dark:text-red-400">Consulta de Usuario</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Busca por teléfono para ver el saldo disponible</p>
          </div>
        </div>

        <form onSubmit={buscarCliente} className="space-y-6">
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="telefono"
                id="telefono"
                className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-4 py-3 text-base border-gray-300 dark:border-gray-600 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm"
                placeholder="Ej: 5512345678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Ingrese el número de teléfono del cliente
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !telefono.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="red" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <FiSearch className="h-5 w-5" />
                  <span>Consultar Usuario</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Mensaje cuando no se encuentra el cliente */}
        {notFound && !loading && (
          <div className="mt-8 animate-fade-in">
            <Alert
              type="error"
              title="Usuario No Encontrado"
              message={`No existe un usuario registrado con el número de teléfono "${telefono}". Verifique el número e intente nuevamente.`}
            />
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Sugerencias:</strong>
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                <li>Verifique que el número de teléfono sea correcto</li>
                <li>Asegúrese de que el cliente esté registrado en el sistema</li>
                <li>Si es un cliente nuevo, debe registrarlo primero</li>
              </ul>
            </div>
          </div>
        )}

        {cliente && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Información del Cliente</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/dashboard/editar-cliente/${cliente.id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all duration-200 font-medium text-sm"
                >
                  <FiEdit className="h-4 w-4" />
                  Editar Cliente
                </button>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Cliente Activo
                </span>
              </div>
            </div>
            
            {/* Tarjeta destacada de litros disponibles */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-700 dark:to-red-800 p-6 rounded-xl shadow-lg mb-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/90">Litros Disponibles</h3>
                <FiDroplet className="h-8 w-8 text-white/80" />
              </div>
              <p className="text-5xl font-bold mb-2">
                {cliente.litros_disponibles.toFixed(2)}
              </p>
              <p className="text-white/90 text-sm">
                de {cliente.litros_mes.toFixed(2)} litros mensuales
              </p>
              <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${(cliente.litros_disponibles / cliente.litros_mes) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Detalles del cliente */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4 transition-colors duration-300">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <FiUser className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nombre Completo</p>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{cliente.nombre}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiPhone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</p>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{cliente.telefono}</p>
                </div>
              </div>

              {cliente.direccion && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FiMapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dirección</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-gray-100">{cliente.direccion}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiCalendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Dependencia</p>
                  {cliente.categoria ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Dependencia Principal:</p>
                        <CategoryBadge category={cliente.categoria} size="md" />
                      </div>
                      {cliente.subcategoria && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Sub dependencia:</p>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                            {cliente.subcategoria}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">Sin categoría asignada</p>
                  )}
                </div>
              </div>

              {/* Método de Pago */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <FiDollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Método de Pago</p>
                  {(cliente.exonerado || cliente.huella) ? (
                    <div className="flex flex-wrap gap-2">
                      {cliente.exonerado && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 shadow-sm">
                          <FiDollarSign className="h-4 w-4" />
                          Exonerado
                        </span>
                      )}
                      {cliente.huella && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                          <FiShield className="h-4 w-4" />
                          Usa Huella
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pago Regular</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alerta si quedan pocos litros */}
            {cliente.litros_disponibles < cliente.litros_mes * 0.2 && (
              <Alert
                type="warning"
                title="Saldo Bajo"
                message={`El cliente tiene menos del 20% de su cuota mensual disponible. Considere notificarle sobre la próxima recarga.`}
                className="mt-4"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
