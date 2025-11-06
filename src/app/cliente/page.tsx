'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPhone, FiDroplet, FiClock, FiCalendar, FiUser, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  litros_mes: number;
  litros_disponibles: number;
}

interface Retiro {
  id: number;
  litros: number;
  fecha: string;
}

export default function ClienteDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [telefono, setTelefono] = useState('');
  const [clienteAutenticado, setClienteAutenticado] = useState<Cliente | null>(null);
  const [litrosRetiro, setLitrosRetiro] = useState('');
  const [loading, setLoading] = useState(false);

  // Obtener datos del cliente
  const { data: cliente, isLoading: loadingCliente } = useQuery({
    queryKey: ['cliente', telefono],
    queryFn: async () => {
      if (!telefono) return null;
      const { data } = await api.get(`/clientes/telefono/${telefono}`);
      return data;
    },
    enabled: !!clienteAutenticado,
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  // Obtener historial de retiros
  const { data: retiros = [], isLoading: loadingRetiros } = useQuery({
    queryKey: ['retiros', clienteAutenticado?.id],
    queryFn: async () => {
      if (!clienteAutenticado) return [];
      const { data } = await api.get(`/retiros/cliente/${clienteAutenticado.id}`);
      return data;
    },
    enabled: !!clienteAutenticado,
    refetchInterval: 5000,
  });

  // Mutación para registrar retiro
  const registrarRetiroMutation = useMutation({
    mutationFn: async (litros: number) => {
      const { data } = await api.post('/retiros', {
        cliente_id: clienteAutenticado?.id,
        litros,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Retiro registrado exitosamente');
      setLitrosRetiro('');
      queryClient.invalidateQueries({ queryKey: ['cliente', telefono] });
      queryClient.invalidateQueries({ queryKey: ['retiros', clienteAutenticado?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar el retiro');
    },
  });

  const handleBuscarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!telefono) {
      toast.error('Por favor ingresa tu número telefónico');
      return;
    }

    setLoading(true);
    
    try {
      const { data } = await api.get(`/clientes/telefono/${telefono}`);
      setClienteAutenticado(data);
      toast.success(`Bienvenido, ${data.nombre}`);
    } catch (error: any) {
      toast.error('Cliente no encontrado. Verifica tu número telefónico.');
      setClienteAutenticado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarRetiro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const litros = parseFloat(litrosRetiro);
    
    if (isNaN(litros) || litros <= 0) {
      toast.error('Ingresa una cantidad válida de litros');
      return;
    }

    if (cliente && litros > cliente.litros_disponibles) {
      toast.error(`No puedes retirar más de ${cliente.litros_disponibles} litros disponibles`);
      return;
    }

    registrarRetiroMutation.mutate(litros);
  };

  const handleCerrarSesion = () => {
    setClienteAutenticado(null);
    setTelefono('');
    setLitrosRetiro('');
  };

  // Vista de login
  if (!clienteAutenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <FiDroplet className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Portal del Cliente</h1>
            <p className="text-gray-600">Ingresa tu número telefónico para acceder</p>
          </div>

          <form onSubmit={handleBuscarCliente} className="space-y-6">
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                Número Telefónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Ej: 5512345678"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ¿Eres administrador? Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista del dashboard del cliente
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{cliente?.nombre || clienteAutenticado.nombre}</h1>
                <p className="text-gray-600">{clienteAutenticado.telefono}</p>
              </div>
            </div>
            <button
              onClick={handleCerrarSesion}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Litros disponibles */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Litros Disponibles</h3>
              <FiDroplet className="h-8 w-8" />
            </div>
            <p className="text-5xl font-bold mb-2">
              {loadingCliente ? '...' : (cliente?.litros_disponibles || 0).toFixed(2)}
            </p>
            <p className="text-blue-100">Litros</p>
          </div>

          {/* Cuota mensual */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cuota Mensual</h3>
              <FiCalendar className="h-8 w-8" />
            </div>
            <p className="text-5xl font-bold mb-2">
              {cliente?.litros_mes || clienteAutenticado.litros_mes}
            </p>
            <p className="text-green-100">Litros por mes</p>
          </div>
        </div>

        {/* Formulario de retiro */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Retiro</h2>
          <form onSubmit={handleRegistrarRetiro} className="space-y-4">
            <div>
              <label htmlFor="litrosRetiro" className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de Litros a Retirar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDroplet className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="litrosRetiro"
                  value={litrosRetiro}
                  onChange={(e) => setLitrosRetiro(e.target.value)}
                  min="0"
                  step="0.01"
                  max={cliente?.litros_disponibles || 0}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 50"
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Disponible: {(cliente?.litros_disponibles || 0).toFixed(2)} litros
              </p>
            </div>

            <button
              type="submit"
              disabled={registrarRetiroMutation.isPending || !litrosRetiro}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registrarRetiroMutation.isPending ? 'Registrando...' : 'Registrar Retiro'}
            </button>
          </form>
        </div>

        {/* Historial de retiros */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial de Retiros</h2>
          {loadingRetiros ? (
            <p className="text-center text-gray-500">Cargando historial...</p>
          ) : retiros.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay retiros registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Litros Retirados
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {retiros.map((retiro: Retiro) => (
                    <tr key={retiro.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiClock className="mr-2 text-gray-400" />
                          {new Date(retiro.fecha).toLocaleString('es-MX')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {retiro.litros.toFixed(2)} L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
