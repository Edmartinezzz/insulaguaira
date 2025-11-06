'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiPhone, FiDroplet, FiArrowLeft, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';

export default function RegistrarCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    litros_mes: '',
    categoria: 'Persona Natural',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.telefono || !formData.litros_mes || !formData.categoria) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (isNaN(Number(formData.litros_mes)) || Number(formData.litros_mes) <= 0) {
      toast.error('La cantidad de litros debe ser un número mayor a cero');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/clientes', {
        nombre: formData.nombre,
        telefono: formData.telefono,
        litros_mes: Number(formData.litros_mes),
        categoria: formData.categoria,
      });

      toast.success('Cliente registrado exitosamente');
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        telefono: '',
        litros_mes: '',
        categoria: 'Persona Natural',
      });
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error al registrar cliente:', error);
      toast.error(error.message || 'Error al registrar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Volver al Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Registrar Nuevo Cliente
            </h1>
            <p className="text-gray-600 mb-6">
              Complete los datos del cliente para registrarlo en el sistema
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez García"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Número Telefónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: 5512345678"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Este será el nombre de usuario para que el cliente inicie sesión
                </p>
              </div>

              <div>
                <label htmlFor="litros_mes" className="block text-sm font-medium text-gray-700 mb-2">
                  Litros Mensuales *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDroplet className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="litros_mes"
                    name="litros_mes"
                    min="0"
                    step="0.01"
                    value={formData.litros_mes}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: 100"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Cantidad de litros que el cliente podrá retirar mensualmente
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
