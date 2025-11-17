'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiCalendar, FiDroplet, FiUser, FiCheck, FiX, FiClock, FiFilter, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/lib/api';

export default function AgendamientosAdmin() {
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agendamientoSeleccionado, setAgendamientoSeleccionado] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener agendamientos con filtros
  const { data: agendamientos = [], isLoading, refetch } = useQuery({
    queryKey: ['agendamientos-admin', filtroFecha, filtroEstado],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filtroFecha) params.append('fecha', filtroFecha);
      if (filtroEstado) params.append('estado', filtroEstado);
      
      const { data } = await api.get(`/api/agendamientos?${params.toString()}`);
      return data;
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  // Procesar agendamiento
  const handleProcesarAgendamiento = async () => {
    if (!agendamientoSeleccionado) return;

    try {
      setIsProcessing(true);
      
      const response = await api.post(`/api/agendamientos/${agendamientoSeleccionado.id}/procesar`);
      
      toast.success(`Agendamiento procesado exitosamente. Ticket: ${response.data.codigo_ticket}`);
      setShowConfirmModal(false);
      setAgendamientoSeleccionado(null);
      refetch();
    } catch (error: any) {
      console.error('Error al procesar agendamiento:', error);
      const errorMessage = error.response?.data?.error || 'Error al procesar el agendamiento';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Obtener fecha de hoy para filtros
  const getFechaHoy = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Obtener fecha de mañana
  const getFechaManana = () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  };

  // Agrupar agendamientos por fecha
  const agendamientosPorFecha = agendamientos.reduce((acc: any, agendamiento: any) => {
    const fecha = agendamiento.fecha_agendada;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(agendamiento);
    return acc;
  }, {});

  const fechasOrdenadas = Object.keys(agendamientosPorFecha).sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Agendamientos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Administra los retiros agendados por los clientes
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha
              </label>
              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las fechas</option>
                <option value={getFechaHoy()}>Hoy</option>
                <option value={getFechaManana()}>Mañana</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha específica
              </label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="procesado">Procesado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltroFecha('');
                  setFiltroEstado('');
                }}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg transition-colors duration-200"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agendamientos.filter((a: any) => a.estado === 'pendiente').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Procesados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agendamientos.filter((a: any) => a.estado === 'procesado').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FiX className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agendamientos.filter((a: any) => a.estado === 'cancelado').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agendamientos.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de agendamientos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Agendamientos
            </h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner text="Cargando agendamientos..." />
              </div>
            ) : agendamientos.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No hay agendamientos</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Los agendamientos de los clientes aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {fechasOrdenadas.map((fecha) => (
                  <div key={fecha} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {format(new Date(fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agendamientosPorFecha[fecha].length} agendamiento{agendamientosPorFecha[fecha].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {agendamientosPorFecha[fecha].map((agendamiento: any) => (
                        <div key={agendamiento.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg ${
                                agendamiento.tipo_combustible === 'gasoil'
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : 'bg-green-100 dark:bg-green-900/30'
                              }`}>
                                <FiDroplet className={`h-5 w-5 ${
                                  agendamiento.tipo_combustible === 'gasoil'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`} />
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <FiUser className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {agendamiento.cliente_nombre}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ({agendamiento.cliente_cedula})
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {agendamiento.litros} L de {agendamiento.tipo_combustible === 'gasoil' ? 'Gasoil' : 'Gasolina'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {agendamiento.cliente_categoria} • Tel: {agendamiento.cliente_telefono}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                agendamiento.estado === 'pendiente'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                  : agendamiento.estado === 'procesado'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                              }`}>
                                {agendamiento.estado === 'pendiente' ? 'Pendiente' : 
                                 agendamiento.estado === 'procesado' ? 'Procesado' : 'Cancelado'}
                              </span>
                              
                              {agendamiento.estado === 'pendiente' && (
                                <button
                                  onClick={() => {
                                    setAgendamientoSeleccionado(agendamiento);
                                    setShowConfirmModal(true);
                                  }}
                                  className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
                                >
                                  <FiCheck className="mr-1 h-4 w-4" />
                                  Procesar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setAgendamientoSeleccionado(null);
        }}
        onConfirm={handleProcesarAgendamiento}
        title="Procesar Agendamiento"
        message={
          agendamientoSeleccionado
            ? `¿Está seguro de procesar el agendamiento de ${agendamientoSeleccionado.cliente_nombre} por ${agendamientoSeleccionado.litros} litros de ${agendamientoSeleccionado.tipo_combustible}?`
            : ''
        }
        confirmText="Sí, procesar"
        cancelText="Cancelar"
        type="warning"
        isLoading={isProcessing}
      />
    </div>
  );
}
