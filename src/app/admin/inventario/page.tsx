'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiDownload, FiAlertTriangle, FiDroplet } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

type Inventario = {
  id: number;
  litros_ingresados: number;
  litros_disponibles: number;
  fecha_ingreso: string;
  usuario_id: number;
  usuario_nombre?: string;
  observaciones?: string;
};

export default function InventarioPage() {
  const [inventario, setInventario] = useState<Inventario | null>(null);
  const [historial, setHistorial] = useState<Inventario[]>([]);
  const [litros, setLitros] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const cargarInventario = async () => {
    try {
      const [inventarioRes, historialRes] = await Promise.all([
        api.get('/inventario'),
        api.get('/inventario/historial')
      ]);
      
      setInventario(inventarioRes.data);
      setHistorial(historialRes.data);
    } catch (error) {
      console.error('Error al cargar el inventario:', error);
      toast.error('Error al cargar el inventario');
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!litros || isNaN(Number(litros)) || Number(litros) <= 0) {
      toast.error('Ingrese una cantidad válida de litros');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/inventario', {
        litros_ingresados: parseFloat(litros),
        observaciones
      });
      
      toast.success('Inventario actualizado correctamente');
      setLitros('');
      setObservaciones('');
      cargarInventario();
    } catch (error: any) {
      console.error('Error al actualizar inventario:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar el inventario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Inventario</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta de inventario actual */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Inventario Actual</h2>
            <div className="p-2 bg-blue-100 rounded-full">
              <FiDroplet className="text-blue-600 text-xl" />
            </div>
          </div>
          
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-gray-800">
              {inventario?.litros_disponibles?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-gray-500 mt-1">Litros disponibles</p>
          </div>
          
          {inventario?.litros_disponibles && inventario.litros_disponibles < 1000 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm flex items-start">
              <FiAlertTriangle className="mt-0.5 mr-2 flex-shrink-0" />
              <span>El inventario está por debajo del nivel recomendado. Considere hacer un nuevo ingreso.</span>
            </div>
          )}
        </div>

        {/* Formulario de ingreso de combustible */}
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Registrar Ingreso de Combustible</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="litros" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de litros
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="litros"
                  step="0.01"
                  min="0.01"
                  value={litros}
                  onChange={(e) => setLitros(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ej: 10000.00"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">litros</span>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones (Opcional)
              </label>
              <textarea
                id="observaciones"
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                placeholder="Ej: Carga de camión cisterna #1234"
                disabled={isLoading}
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !litros}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading || !litros ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiPlus className="mr-2" />
                {isLoading ? 'Registrando...' : 'Registrar Ingreso'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Historial de inventario */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Historial de Movimientos
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Registro de todos los ingresos y salidas de combustible.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Litros Ingresados
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Litros Disponibles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado por
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historial.length > 0 ? (
                historial.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.fecha_ingreso).toLocaleString('es-VE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.litros_ingresados.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.litros_disponibles.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.usuario_nombre || 'Sistema'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.observaciones || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay registros de inventario
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
