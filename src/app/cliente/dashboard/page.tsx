'use client';

import { useClienteAuth } from '@/contexts/ClienteAuthContext';
import { useRouter } from 'next/navigation';
import { FiDroplet, FiClock, FiCalendar, FiUser, FiLogOut, FiPlusCircle } from 'react-icons/fi';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function ClienteDashboard() {
  const { cliente, logout, updateCliente } = useClienteAuth();
  const router = useRouter();
  const [litros, setLitros] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRetirar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!litros || isNaN(Number(litros)) || Number(litros) <= 0) {
      toast.error('Por favor ingrese una cantidad válida');
      return;
    }

    const litrosNum = parseFloat(litros);
    
    if (litrosNum > (cliente?.litros_disponibles || 0)) {
      toast.error('No tiene suficientes litros disponibles');
      return;
    }

    try {
      setIsLoading(true);
      
      // Llamar a la API para registrar el retiro
      const response = await api.post('/retiros', {
        cliente_id: cliente?.id,
        litros: litrosNum
      });

      // Actualizar el estado local del cliente
      if (cliente) {
        const updatedCliente = {
          ...cliente,
          litros_disponibles: cliente.litros_disponibles - litrosNum
        };
        updateCliente(updatedCliente);
      }

      toast.success(`Retiro de ${litrosNum} litros realizado con éxito`);
      setLitros('');
    } catch (error: any) {
      console.error('Error al realizar el retiro:', error);
      toast.error(error.response?.data?.error || 'Error al realizar el retiro');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cliente) {
    return null; // El componente ClienteAuthChecker manejará la redirección
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenido, {cliente.nombre}</h1>
            <p className="text-gray-600">Gestiona tu consumo de gas</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/cliente/login');
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiLogOut className="mr-2" />
            Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <FiDroplet className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Litros Disponibles</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {cliente.litros_disponibles.toFixed(2)} <span className="text-lg">litros</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              de {cliente.litros_mes.toFixed(2)} litros mensuales
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <FiCalendar className="text-green-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Próxima Recarga</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">01 de cada mes</p>
            <p className="text-sm text-gray-500 mt-2">
              Tu asignación se renueva automáticamente
            </p>
          </div>
        </div>

        {/* Formulario de retiro */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Retirar Litros</h3>
          <form onSubmit={handleRetirar} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="litros" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de litros a retirar
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="litros"
                  name="litros"
                  step="0.1"
                  min="0.1"
                  max={cliente?.litros_disponibles || 0}
                  value={litros}
                  onChange={(e) => setLitros(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ej: 5.5"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">litros</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Disponibles: {cliente?.litros_disponibles.toFixed(2)} litros
              </p>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading || !litros || parseFloat(litros) <= 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading || !litros || parseFloat(litros) <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiPlusCircle className="mr-2" />
                {isLoading ? 'Procesando...' : 'Retirar'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2" />
              <span className="text-gray-700">
                <span className="font-medium">Nombre:</span> {cliente.nombre}
              </span>
            </div>
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2 opacity-0" />
              <span className="text-gray-700">
                <span className="font-medium">Cédula:</span> {cliente.cedula}
              </span>
            </div>
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2 opacity-0" />
              <span className="text-gray-700">
                <span className="font-medium">Categoría:</span> {cliente.categoria}
              </span>
            </div>
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2 opacity-0" />
              <span className="text-gray-700">
                <span className="font-medium">Teléfono:</span> {cliente.telefono}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Retiros</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Litros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  15/06/2023
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  10.5
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completado
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  01/06/2023
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8.0
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
