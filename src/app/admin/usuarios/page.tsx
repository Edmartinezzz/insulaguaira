'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiUser, FiPhone, FiTruck, FiDroplet, FiCalendar, FiFileText, FiX, FiSearch, FiFilter, FiRefreshCw, FiEye } from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';

export default function UsuariosAdmin() {
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [ticketsUsuario, setTicketsUsuario] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Obtener lista de usuarios
  const { data: usuarios = [], isLoading, refetch } = useQuery({
    queryKey: ['usuarios-admin'],
    queryFn: async () => {
      const { data } = await api.get('/api/clientes/lista');
      return data;
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  // Función para ver tickets de un usuario
  const handleVerTickets = async (usuario: any) => {
    try {
      setLoadingTickets(true);
      setSelectedUsuario(usuario);
      setShowTicketsModal(true);
      
      const { data } = await api.get(`/api/clientes/${usuario.id}/tickets`);
      setTicketsUsuario(data);
    } catch (error: any) {
      console.error('Error al obtener tickets:', error);
      toast.error('Error al cargar los tickets del usuario');
    } finally {
      setLoadingTickets(false);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario: any) => {
    const matchNombre = usuario.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                       usuario.cedula.includes(filtroNombre);
    const matchCategoria = filtroCategoria === '' || usuario.categoria === filtroCategoria;
    return matchNombre && matchCategoria;
  });

  // Obtener categorías únicas
  const categorias = [...new Set(usuarios.map((u: any) => u.categoria))] as string[];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Lista de Usuarios Registrados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gestiona todos los usuarios del sistema con información completa
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar por nombre o cédula
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre o cédula..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria: string) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltroNombre('');
                  setFiltroCategoria('');
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
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FiUser className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usuariosFiltrados.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FiDroplet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Litros/Mes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usuariosFiltrados.reduce((sum: number, u: any) => sum + u.litros_mes, 0).toFixed(0)}L
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <FiFileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Retiros</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usuariosFiltrados.reduce((sum: number, u: any) => sum + u.total_retiros, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FiDroplet className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Litros Retirados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usuariosFiltrados.reduce((sum: number, u: any) => sum + u.total_litros_retirados, 0).toFixed(0)}L
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Usuarios ({usuariosFiltrados.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner text="Cargando usuarios..." />
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FiUser className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No hay usuarios</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  No se encontraron usuarios con los filtros aplicados
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Combustible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Retiros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {usuariosFiltrados.map((usuario: any) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {usuario.nombre}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              C.I: {usuario.cedula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center mb-1">
                            <FiPhone className="h-4 w-4 mr-2 text-gray-400" />
                            {usuario.telefono}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {usuario.categoria}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <FiTruck className="h-4 w-4 mr-2 text-gray-400" />
                          {usuario.placa}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">{usuario.litros_mes.toFixed(1)} L/mes</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Disponible: {usuario.litros_disponibles.toFixed(1)} L
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">{usuario.total_retiros} retiros</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {usuario.total_litros_retirados.toFixed(1)} L total
                          </div>
                          {usuario.ultimo_retiro && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              Último: {format(new Date(usuario.ultimo_retiro), 'dd/MM/yyyy', { locale: es })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleVerTickets(usuario)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <FiEye className="mr-2 h-4 w-4" />
                          Ver Tickets
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Tickets */}
      {showTicketsModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
              <button
                onClick={() => {
                  setShowTicketsModal(false);
                  setSelectedUsuario(null);
                  setTicketsUsuario([]);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <FiFileText className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Tickets de Retiro</h2>
                  <p className="text-blue-100">
                    {selectedUsuario.nombre} - C.I: {selectedUsuario.cedula}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingTickets ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner text="Cargando tickets..." />
                </div>
              ) : ticketsUsuario.length === 0 ? (
                <div className="text-center py-12">
                  <FiFileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No hay tickets</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Este usuario no ha realizado retiros aún
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketsUsuario.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {ticket.codigo_ticket?.toString().padStart(3, '0') || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {ticket.litros.toFixed(2)} L de {ticket.tipo_combustible === 'gasoil' ? 'Gasoil' : 'Gasolina'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(ticket.fecha), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.tipo_combustible === 'gasoil'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                        }`}>
                          {ticket.tipo_combustible === 'gasoil' ? 'Gasoil' : 'Gasolina'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total de tickets: {ticketsUsuario.length}
                </p>
                <button
                  onClick={() => {
                    setShowTicketsModal(false);
                    setSelectedUsuario(null);
                    setTicketsUsuario([]);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
