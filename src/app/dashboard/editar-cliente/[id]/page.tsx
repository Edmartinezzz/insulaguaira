'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiUser, FiPhone, FiDroplet, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiTag, FiDollarSign, FiShield, FiSave, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BackButton from '@/components/ui/BackButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import { CATEGORIES, getSubcategories, hasSubcategories } from '@/config/categories';
import api from '@/lib/api';

export default function EditarCliente() {
  const router = useRouter();
  const params = useParams();
  const clienteId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    litros_mes_gasolina: '',
    litros_mes_gasoil: '',
    categoria: 'Gobernación',
    subcategoria: '',
    exonerado: false,
    huella: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSubcategory, setShowSubcategory] = useState(true);

  // Cargar datos del cliente
  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoadingData(true);
        const response = await api.get(`/api/clientes/${clienteId}`);
        const cliente = response.data;
        
        setFormData({
          nombre: cliente.nombre || '',
          cedula: cliente.cedula || '',
          telefono: cliente.telefono || '',
          litros_mes_gasolina: cliente.litros_mes_gasolina?.toString() || cliente.litros_mes?.toString() || '0',
          litros_mes_gasoil: cliente.litros_mes_gasoil?.toString() || '0',
          categoria: cliente.categoria || 'Gobernación',
          subcategoria: cliente.subcategoria || '',
          exonerado: cliente.exonerado || false,
          huella: cliente.huella || false,
        });
        
        setShowSubcategory(hasSubcategories(cliente.categoria || 'Gobernación'));
      } catch (error: any) {
        console.error('Error al cargar cliente:', error);
        toast.error('Error al cargar los datos del cliente');
        router.push('/clientes');
      } finally {
        setLoadingData(false);
      }
    };

    if (clienteId) {
      fetchCliente();
    }
  }, [clienteId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (name === 'categoria') {
      const hasSub = hasSubcategories(value);
      setShowSubcategory(hasSub);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subcategoria: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
    
    if (touched[name] && type !== 'checkbox') {
      validateField(name, value);
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const value = formData[fieldName as keyof typeof formData];
    if (typeof value === 'string') {
      validateField(fieldName, value);
    }
  };

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        }
        break;
      case 'cedula':
        const cedulaRegex = /^[0-9]{7,8}$/;
        if (!value.trim()) {
          error = 'La cédula es obligatoria';
        } else if (!cedulaRegex.test(value)) {
          error = 'La cédula debe tener 7 u 8 dígitos';
        }
        break;
      case 'telefono':
        const telefonoRegex = /^[0-9]{10,11}$/;
        if (!value.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!telefonoRegex.test(value)) {
          error = 'El teléfono debe tener 10 u 11 dígitos';
        }
        break;
      case 'litros_mes_gasolina':
        const litrosGasolina = parseFloat(value);
        if (!value.trim()) {
          error = 'Los litros de gasolina son obligatorios';
        } else if (isNaN(litrosGasolina) || litrosGasolina < 0) {
          error = 'Debe ser un número mayor o igual a 0';
        }
        break;
      case 'litros_mes_gasoil':
        const litrosGasoil = parseFloat(value);
        if (!value.trim()) {
          error = 'Los litros de gasoil son obligatorios';
        } else if (isNaN(litrosGasoil) || litrosGasoil < 0) {
          error = 'Debe ser un número mayor o igual a 0';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es obligatoria';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!formData.litros_mes_gasolina.trim()) newErrors.litros_mes_gasolina = 'Los litros de gasolina son obligatorios';
    if (!formData.litros_mes_gasoil.trim()) newErrors.litros_mes_gasoil = 'Los litros de gasoil son obligatorios';
    
    // Validación adicional: al menos uno debe tener litros
    const gasolinaLitros = Number(formData.litros_mes_gasolina) || 0;
    const gasoilLitros = Number(formData.litros_mes_gasoil) || 0;
    
    if (gasolinaLitros === 0 && gasoilLitros === 0) {
      newErrors.litros_mes_gasolina = 'Debe asignar litros a al menos un tipo de combustible';
      newErrors.litros_mes_gasoil = 'Debe asignar litros a al menos un tipo de combustible';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    
    try {
      await api.put(`/api/clientes/${clienteId}`, {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono,
        litros_mes_gasolina: Number(formData.litros_mes_gasolina),
        litros_mes_gasoil: Number(formData.litros_mes_gasoil),
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || null,
        exonerado: formData.exonerado,
        huella: formData.huella,
      });

      toast.success('Cliente actualizado exitosamente');
      
      setTimeout(() => {
        router.push('/clientes');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar el cliente');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <LoadingSpinner size="lg" color="red" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton />
          
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Editar Cliente
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Modifique los datos del cliente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 transition-colors duration-300">
            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    onBlur={() => handleBlur('nombre')}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.nombre && touched.nombre
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500'
                    } rounded-lg shadow-sm transition-colors duration-200 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                  {!errors.nombre && touched.nombre && formData.nombre && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {errors.nombre && touched.nombre && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.nombre && touched.nombre && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                )}
              </div>

              {/* Cédula */}
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cédula *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cedula"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    onBlur={() => handleBlur('cedula')}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.cedula && touched.cedula
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500'
                    } rounded-lg shadow-sm transition-colors duration-200 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
                    placeholder="Ej: 12345678"
                    required
                  />
                  {!errors.cedula && touched.cedula && formData.cedula && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {errors.cedula && touched.cedula && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.cedula && touched.cedula && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.cedula}</p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Ingrese solo números (7 u 8 dígitos)
                </p>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Teléfono *
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
                    onBlur={() => handleBlur('telefono')}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.telefono && touched.telefono
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500'
                    } rounded-lg shadow-sm transition-colors duration-200 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
                    placeholder="Ej: 04121234567"
                    required
                  />
                  {!errors.telefono && touched.telefono && formData.telefono && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {errors.telefono && touched.telefono && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.telefono && touched.telefono && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.telefono}</p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Ingrese solo números (10 u 11 dígitos)
                </p>
              </div>

              {/* Sección de Litros por Tipo de Combustible */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiDroplet className="h-5 w-5 text-blue-600" />
                  Asignación de Combustible Mensual
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Litros de Gasolina */}
                  <div>
                    <label htmlFor="litros_mes_gasolina" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Litros de Gasolina *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDroplet className="h-5 w-5 text-blue-400" />
                      </div>
                      <input
                        type="number"
                        id="litros_mes_gasolina"
                        name="litros_mes_gasolina"
                        value={formData.litros_mes_gasolina}
                        onChange={handleChange}
                        onBlur={() => handleBlur('litros_mes_gasolina')}
                        step="0.01"
                        min="0"
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.litros_mes_gasolina && touched.litros_mes_gasolina
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg shadow-sm transition-colors duration-200 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
                        placeholder="Ej: 50.00"
                        required
                      />
                      {!errors.litros_mes_gasolina && touched.litros_mes_gasolina && formData.litros_mes_gasolina && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiCheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      {errors.litros_mes_gasolina && touched.litros_mes_gasolina && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiAlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.litros_mes_gasolina && touched.litros_mes_gasolina && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.litros_mes_gasolina}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Litros de gasolina mensuales
                    </p>
                  </div>

                  {/* Litros de Gasoil */}
                  <div>
                    <label htmlFor="litros_mes_gasoil" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Litros de Gasoil *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiTruck className="h-5 w-5 text-green-400" />
                      </div>
                      <input
                        type="number"
                        id="litros_mes_gasoil"
                        name="litros_mes_gasoil"
                        value={formData.litros_mes_gasoil}
                        onChange={handleChange}
                        onBlur={() => handleBlur('litros_mes_gasoil')}
                        step="0.01"
                        min="0"
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.litros_mes_gasoil && touched.litros_mes_gasoil
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500'
                        } rounded-lg shadow-sm transition-colors duration-200 dark:bg-gray-700 dark:text-white bg-white text-gray-900`}
                        placeholder="Ej: 50.00"
                        required
                      />
                      {!errors.litros_mes_gasoil && touched.litros_mes_gasoil && formData.litros_mes_gasoil && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiCheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      {errors.litros_mes_gasoil && touched.litros_mes_gasoil && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiAlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.litros_mes_gasoil && touched.litros_mes_gasoil && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.litros_mes_gasoil}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Litros de gasoil mensuales
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📝 <strong>Nota:</strong> Puede asignar 0 litros a cualquier tipo de combustible si el usuario no lo necesita.
                  </p>
                </div>
              </div>

              {/* Dependencia */}
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dependencia *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Seleccione la categoría del cliente
                </p>
              </div>

              {/* Sub dependencia */}
              {showSubcategory && (
                <div>
                  <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sub dependencia *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTag className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="subcategoria"
                      name="subcategoria"
                      value={formData.subcategoria}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                      required
                    >
                      <option value="">Seleccione una subcategoría</option>
                      {getSubcategories(formData.categoria).map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Especifique la subcategoría dentro de {formData.categoria}
                  </p>
                </div>
              )}

              {/* Sección de Método de Pago */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiDollarSign className="h-5 w-5 text-red-600" />
                  Método de Pago
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Checkbox Exonerado */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="exonerado"
                        name="exonerado"
                        type="checkbox"
                        checked={formData.exonerado}
                        onChange={handleChange}
                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="exonerado" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2">
                        <FiDollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Exonerado
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cliente exento de pago
                      </p>
                    </div>
                  </div>

                  {/* Checkbox Huella */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="huella"
                        name="huella"
                        type="checkbox"
                        checked={formData.huella}
                        onChange={handleChange}
                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="huella" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2">
                        <FiShield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Usa Huella
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pago mediante huella digital
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/clientes')}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-5 w-5" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
