'use client';

import { useState } from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiCreditCard, FiTruck, FiDroplet } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface SubclienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubclienteCreado: () => void;
  clientePadreId: number;
  litrosDisponiblesGasolina: number;
  litrosDisponiblesGasoil: number;
}

export default function SubclienteFormModal({ 
  isOpen, 
  onClose, 
  onSubclienteCreado,
  clientePadreId,
  litrosDisponiblesGasolina,
  litrosDisponiblesGasoil,
}: SubclienteFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    placa: '',
    email: '',
    litros_gasolina: '',
    litros_gasoil: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nombre = formData.nombre.trim();
    const cedula = formData.cedula.trim();
    const placa = formData.placa.trim();
    const litrosGasolinaStr = formData.litros_gasolina.trim();
    const litrosGasoilStr = formData.litros_gasoil.trim();

    if (!nombre || !cedula) {
      toast.error('Nombre y cédula son campos obligatorios');
      return;
    }

    const litrosGasolinaNum = litrosGasolinaStr ? parseFloat(litrosGasolinaStr) : 0;
    const litrosGasoilNum = litrosGasoilStr ? parseFloat(litrosGasoilStr) : 0;

    if (
      isNaN(litrosGasolinaNum) || litrosGasolinaNum < 0 ||
      isNaN(litrosGasoilNum) || litrosGasoilNum < 0
    ) {
      toast.error('Los litros deben ser números mayores o iguales a 0');
      return;
    }

    if (litrosGasolinaNum === 0 && litrosGasoilNum === 0) {
      toast.error('Debe asignar litros a al menos un tipo de combustible');
      return;
    }

    if (litrosGasolinaNum > litrosDisponiblesGasolina || litrosGasoilNum > litrosDisponiblesGasoil) {
      toast.error('Los litros asignados exceden los litros disponibles del cliente');
      return;
    }

    try {
      setIsLoading(true);

      // El backend espera la ruta /api/clientes/:id/subclientes
      await api.post(`/api/clientes/${clientePadreId}/subclientes`, {
        nombre,
        cedula,
        placa: placa || null,
        litros_mes_gasolina: litrosGasolinaNum,
        litros_mes_gasoil: litrosGasoilNum,
      });
      
      toast.success('Trabajador registrado exitosamente');
      onSubclienteCreado();
      onClose();
      // Reset form
      setFormData({
        nombre: '',
        cedula: '',
        telefono: '',
        placa: '',
        email: '',
        litros_gasolina: '',
        litros_gasoil: '',
      });
    } catch (error: any) {
      console.error('Error al registrar trabajador:', error);
      toast.error(error.response?.data?.error || 'Error al registrar trabajador');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Nuevo Trabajador</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo <span className="text-red-500">*</span>
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
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nombre del trabajador"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cédula <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Número de cédula"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
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
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Placa del Vehículo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiTruck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="placa"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
                  placeholder="Placa del vehículo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <FiDroplet className="h-4 w-4 text-blue-500" />
                Litros mensuales para este trabajador
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="litros_gasolina" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gasolina (máx. {litrosDisponiblesGasolina.toFixed(2)} L)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDroplet className="h-4 w-4 text-blue-400" />
                    </div>
                    <input
                      type="number"
                      id="litros_gasolina"
                      name="litros_gasolina"
                      min="0"
                      step="0.01"
                      value={formData.litros_gasolina}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ej: 50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="litros_gasoil" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gasoil (máx. {litrosDisponiblesGasoil.toFixed(2)} L)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTruck className="h-4 w-4 text-green-500" />
                    </div>
                    <input
                      type="number"
                      id="litros_gasoil"
                      name="litros_gasoil"
                      min="0"
                      step="0.01"
                      value={formData.litros_gasoil}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ej: 30"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Estos litros se descuentan de la reserva mensual de la dependencia.
              </p>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Registrar Trabajador'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
