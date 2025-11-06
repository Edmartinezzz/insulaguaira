'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { FiTruck, FiPackage, FiUser, FiDollarSign, FiClock, FiCalendar, FiSearch, FiUserPlus, FiLogOut } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import axios from 'axios';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);


const opcionesGrafica = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const fechaActual = new Date();
  const fechaFormateada = format(fechaActual, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  // Obtener estadísticas (ejemplo con React Query)
  const { data: estadisticas, isLoading } = useQuery({
    queryKey: ['estadisticas'],
    queryFn: async () => {
      const { data } = await axios.get('/api/estadisticas');
      return data;
    },
    initialData: {
      totalClientes: 0,
      totalLitrosEntregados: 0,
      proximosVencimientos: 0,
    },
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  // Obtener últimos retiros en tiempo real
  const { data: ultimosRetiros = [], isLoading: loadingRetiros } = useQuery({
    queryKey: ['retiros'],
    queryFn: async () => {
      const { data } = await api.get('/retiros');
      return data;
    },
    refetchInterval: 3000, // Actualizar cada 3 segundos
  });

  // Obtener estadísticas de retiros para las gráficas
  const { data: statsRetiros } = useQuery({
    queryKey: ['estadisticasRetiros'],
    queryFn: async () => {
      const { data } = await api.get('/estadisticas/retiros');
      return data;
    },
    initialData: {
      litrosHoy: 0,
      litrosMes: 0,
      litrosAno: 0,
      clientesHoy: 0,
      litrosPorMes: [],
      retirosPorDia: []
    },
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  // Preparar datos para gráfica de retiros por día (últimos 7 días)
  const retirosPorDiaData = {
    labels: statsRetiros.retirosPorDia.map((item: any) => 
      format(new Date(item.dia + 'T00:00:00'), 'dd/MM', { locale: es })
    ),
    datasets: [
      {
        label: 'Litros retirados',
        data: statsRetiros.retirosPorDia.map((item: any) => item.total),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Preparar datos para gráfica de litros por mes (últimos 12 meses)
  const litrosPorMesData = {
    labels: statsRetiros.litrosPorMes.map((item: any) => {
      const [year, month] = item.mes.split('-');
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy', { locale: es });
    }),
    datasets: [
      {
        label: 'Litros retirados por mes',
        data: statsRetiros.litrosPorMes.map((item: any) => item.total),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Preparar datos para gráfica circular de resumen
  const resumenData = {
    labels: ['Hoy', 'Este Mes', 'Este Año'],
    datasets: [
      {
        data: [statsRetiros.litrosHoy, statsRetiros.litrosMes, statsRetiros.litrosAno],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Panel de Control</h1>
              <p className="text-gray-600">Bienvenido, {user?.nombre || 'Usuario'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/inventario')}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <FiPackage className="mr-2" />
                Inventario
              </button>
              <button
                onClick={() => router.push('/dashboard/registrar-cliente')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiUserPlus className="mr-2" />
                Registrar Cliente
              </button>
              <button
                onClick={() => router.push('/clientes')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSearch className="mr-2" />
                Consultar Cliente
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Cerrar Sesión"
              >
                <FiLogOut className="mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FiClock className="mr-1.5 h-5 w-5 text-gray-400" />
            <span>{format(fechaActual, 'HH:mm')} hrs</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Se eliminaron las tarjetas de resumen */}

          {/* Tarjetas adicionales de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-xl shadow p-6">
              <h3 className="text-sm font-semibold mb-2 text-blue-800">Litros Retirados Hoy</h3>
              <p className="text-4xl font-bold text-blue-600">{statsRetiros.litrosHoy.toFixed(2)} <span className="text-2xl">L</span></p>
              <p className="text-sm text-blue-500 mt-2">{statsRetiros.clientesHoy} clientes retiraron hoy</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow p-6">
              <h3 className="text-sm font-semibold mb-2 text-green-800">Litros Este Mes</h3>
              <p className="text-4xl font-bold text-green-600">{statsRetiros.litrosMes.toFixed(2)} <span className="text-2xl">L</span></p>
              <p className="text-sm text-green-500 mt-2">Acumulado mensual</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl shadow p-6">
              <h3 className="text-sm font-semibold mb-2 text-amber-800">Litros Este Año</h3>
              <p className="text-4xl font-bold text-amber-600">{statsRetiros.litrosAno.toFixed(2)} <span className="text-2xl">L</span></p>
              <p className="text-sm text-amber-500 mt-2">Acumulado anual</p>
            </div>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Retiros por Día (Últimos 7 días)</h3>
                <span className="text-xs text-gray-500">Actualización en tiempo real</span>
              </div>
              <div className="h-80">
                {statsRetiros.retirosPorDia.length > 0 ? (
                  <Bar options={opcionesGrafica} data={retirosPorDiaData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No hay datos disponibles
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Resumen de Litros</h3>
                <span className="text-xs text-gray-500">Hoy, Mes, Año</span>
              </div>
              <div className="h-80 flex items-center justify-center">
                {(statsRetiros.litrosHoy > 0 || statsRetiros.litrosMes > 0 || statsRetiros.litrosAno > 0) ? (
                  <Pie data={resumenData} options={opcionesGrafica} />
                ) : (
                  <div className="text-gray-400">No hay retiros registrados</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Litros Retirados por Mes</h3>
                <p className="text-sm text-gray-500 mt-1">Últimos 12 meses - Identifica los meses con más retiros</p>
              </div>
              <span className="text-xs text-gray-500">Actualización automática</span>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="h-80">
                {statsRetiros.litrosPorMes.length > 0 ? (
                  <Line options={opcionesGrafica} data={litrosPorMesData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No hay datos disponibles
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de últimos retiros */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Últimos Retiros de Combustible</h3>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-500">Actualización en tiempo real</span>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loadingRetiros ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : ultimosRetiros.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay retiros registrados
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Litros Retirados
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ultimosRetiros.slice(0, 10).map((retiro: any) => (
                      <tr key={retiro.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {retiro.cliente_nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {retiro.cliente_telefono}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-blue-600">{retiro.litros.toFixed(2)} L</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(retiro.fecha).toLocaleString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
