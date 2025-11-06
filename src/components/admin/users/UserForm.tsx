'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { User, Phone, UserCog, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserFormData {
  name: string;
  phone: string;
  role: 'user' | 'admin';
  password: string;
}

export default function UserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    phone: '',
    role: 'user',
    password: '123456', // Contraseña por defecto
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Aquí irá la lógica para enviar los datos al servidor
      console.log('Datos del formulario:', formData);
      // Simulamos una petición
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Usuario creado exitosamente');
      
      // Limpiar el formulario después de enviar
      setFormData({
        name: '',
        phone: '',
        role: 'user',
        password: '123456',
      });
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      alert('Ocurrió un error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <UserCog className="w-5 h-5 mr-2 text-blue-600" />
        Registrar Nuevo Usuario
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej: +591 12345678"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="text"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            disabled
          />
          <p className="mt-1 text-xs text-gray-500">La contraseña se genera automáticamente</p>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className={cn(
              "w-full justify-center",
              isLoading && "opacity-75 cursor-not-allowed"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              'Guardando...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
