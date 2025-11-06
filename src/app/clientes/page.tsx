'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { Cliente } from '@/types/cliente';

export default function ConsultaCliente() {
  const [telefono, setTelefono] = useState('');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const buscarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefono.trim()) {
      toast.error('Por favor ingrese un número de teléfono');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/clientes/telefono/${telefono}`);
      setCliente(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      toast.error('No se encontró ningún cliente con ese teléfono');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 mt-10">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <FiArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Consulta de Saldo</h1>
        </div>

        <form onSubmit={buscarCliente} className="space-y-6">
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Número de Teléfono
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
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Consultar Saldo'}
            </button>
          </div>
        </form>

        {cliente && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1 text-sm text-gray-900">{cliente.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1 text-sm text-gray-900">{cliente.telefono}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <p className="mt-1 text-sm text-gray-900">{cliente.direccion}</p>
                </div>
                <div className="col-span-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Litros Disponibles</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">
                      {cliente.litros_disponibles} L
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
