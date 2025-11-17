'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiPhone, FiDroplet, FiArrowLeft, FiUsers, FiCheckCircle, FiAlertCircle, FiTag, FiDollarSign, FiShield, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BackButton from '@/components/ui/BackButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import { CATEGORIES, getSubcategories, hasSubcategories } from '@/config/categories';
import api from '@/lib/api';

export default function RegistrarCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    rif: '',
    telefono: '',
    placa: '',
    litros_mes_gasolina: '',
    litros_mes_gasoil: '',
    categoria: 'Gobernación',
    subcategoria: '',
    exonerado: false,
    huella: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSubcategory, setShowSubcategory] = useState(true); // true porque Gobernación tiene subcategorías

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Determinar el valor según el tipo de input
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Si cambia la categoría, verificar si tiene subcategorías
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
    
    // Validar en tiempo real si el campo ya fue tocado (solo para campos de texto)
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

  const validateField = (name: string, value: string | boolean) => {
    let error = '';

    // Solo validar campos de tipo string
    if (typeof value !== 'string') {
      return true;
    }

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
        if (!value) {
          error = 'La cédula es obligatoria';
        } else if (!cedulaRegex.test(value)) {
          error = 'La cédula debe tener 7 u 8 dígitos';
        }
        break;
      case 'rif':
        const rifRegex = /^[JGVEP]-?[0-9]{8,9}$/i;
        if (value && !rifRegex.test(value)) {
          error = 'El RIF debe tener formato válido (ej: J-123456789 o J123456789)';
        }
        break;
      case 'telefono':
        if (!value) {
          error = 'El teléfono es obligatorio';
        } else if (value.length < 10) {
          error = 'El teléfono debe tener al menos 10 dígitos';
        }
        break;
      case 'litros_mes_gasolina':
        if (!value) {
          error = 'Los litros de gasolina son obligatorios';
        } else if (isNaN(Number(value)) || Number(value) < 0) {
          error = 'Debe ser un número mayor o igual a cero';
        }
        break;
      case 'litros_mes_gasoil':
        if (!value) {
          error = 'Los litros de gasoil son obligatorios';
        } else if (isNaN(Number(value)) || Number(value) < 0) {
          error = 'Debe ser un número mayor o igual a cero';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    // Validar todos los campos
    const validations = Object.keys(formData).map(key => 
      validateField(key, formData[key as keyof typeof formData])
    );

    // Validación adicional: al menos uno de los tipos de combustible debe tener litros
    const gasolinaLitros = Number(formData.litros_mes_gasolina) || 0;
    const gasoilLitros = Number(formData.litros_mes_gasoil) || 0;
    
    if (gasolinaLitros === 0 && gasoilLitros === 0) {
      toast.error('Debe asignar litros a al menos un tipo de combustible');
      return;
    }

    if (!validations.every(v => v)) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/api/clientes', {
        nombre: formData.nombre,
        cedula: formData.cedula,
        rif: formData.rif || null,
        telefono: formData.telefono,
        placa: formData.placa || null,
        litros_mes_gasolina: Number(formData.litros_mes_gasolina),
        litros_mes_gasoil: Number(formData.litros_mes_gasoil),
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || null,
        exonerado: formData.exonerado,
        huella: formData.huella,
      });

      toast.success('Usuario registrado exitosamente');
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        cedula: '',
        rif: '',
        telefono: '',
        placa: '',
        litros_mes_gasolina: '',
        litros_mes_gasoil: '',
        categoria: 'Gobernación',
        subcategoria: '',
        exonerado: false,
        huella: false,
      });
      setShowSubcategory(true);
      
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
      <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <BackButton href="/dashboard" label="Volver al Dashboard" className="mb-6" />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 transition-colors duration-300">
            <h1 className="text-2xl md:text-3xl font-bold text-red-800 dark:text-red-400">Registrar Usuario</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completa el formulario para agregar un nuevo usuario</p>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                      touched.nombre && errors.nombre
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : touched.nombre && !errors.nombre
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500'
                    }`}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                  {touched.nombre && !errors.nombre && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {touched.nombre && errors.nombre && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.nombre && errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cédula de Identidad *
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
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                      touched.cedula && errors.cedula
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : touched.cedula && !errors.cedula
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500'
                    }`}
                    placeholder="Ej: 12345678"
                    maxLength={8}
                    pattern="\d{7,8}"
                    title="Ingrese un número de cédula venezolano (7 u 8 dígitos)"
                    required
                  />
                  {touched.cedula && !errors.cedula && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {touched.cedula && errors.cedula && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.cedula && errors.cedula && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cedula}</p>
                )}
              </div>

              {/* Campo RIF */}
              <div>
                <label htmlFor="rif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RIF (Opcional - Para Empresas)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="rif"
                    name="rif"
                    value={formData.rif}
                    onChange={handleChange}
                    onBlur={() => handleBlur('rif')}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                      touched.rif && errors.rif
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : touched.rif && !errors.rif && formData.rif
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500'
                    }`}
                    placeholder="Ej: J-123456789 o J123456789"
                    maxLength={12}
                  />
                  {touched.rif && !errors.rif && formData.rif && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {touched.rif && errors.rif && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.rif && errors.rif && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rif}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Formato: J/G/V/E/P seguido de 8-9 dígitos (ej: J-123456789)
                </p>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    onBlur={() => handleBlur('telefono')}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                      touched.telefono && errors.telefono
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : touched.telefono && !errors.telefono
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500'
                    }`}
                    placeholder="Ej: 5512345678"
                    required
                  />
                  {touched.telefono && !errors.telefono && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {touched.telefono && errors.telefono && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.telefono && errors.telefono ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefono}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Este será el nombre de usuario para que el usuario inicie sesión
                  </p>
                )}
              </div>

              {/* Campo de Placa del Vehículo */}
              <div>
                <label htmlFor="placa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 dark:bg-gray-700 dark:text-white uppercase"
                    placeholder="Ej: ABC-123"
                    maxLength={10}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Opcional - Placa del vehículo del usuario
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
                        min="0"
                        step="0.01"
                        value={formData.litros_mes_gasolina}
                        onChange={handleChange}
                        onBlur={() => handleBlur('litros_mes_gasolina')}
                        className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                          touched.litros_mes_gasolina && errors.litros_mes_gasolina
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : touched.litros_mes_gasolina && !errors.litros_mes_gasolina
                            ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Ej: 50"
                        required
                      />
                      {touched.litros_mes_gasolina && !errors.litros_mes_gasolina && formData.litros_mes_gasolina && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiCheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      {touched.litros_mes_gasolina && errors.litros_mes_gasolina && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiAlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {touched.litros_mes_gasolina && errors.litros_mes_gasolina ? (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.litros_mes_gasolina}</p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Litros de gasolina mensuales
                      </p>
                    )}
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
                        min="0"
                        step="0.01"
                        value={formData.litros_mes_gasoil}
                        onChange={handleChange}
                        onBlur={() => handleBlur('litros_mes_gasoil')}
                        className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-700 dark:text-white ${
                          touched.litros_mes_gasoil && errors.litros_mes_gasoil
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : touched.litros_mes_gasoil && !errors.litros_mes_gasoil
                            ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500'
                        }`}
                        placeholder="Ej: 50"
                        required
                      />
                      {touched.litros_mes_gasoil && !errors.litros_mes_gasoil && formData.litros_mes_gasoil && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiCheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      {touched.litros_mes_gasoil && errors.litros_mes_gasoil && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FiAlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {touched.litros_mes_gasoil && errors.litros_mes_gasoil ? (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.litros_mes_gasoil}</p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Litros de gasoil mensuales
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📝 <strong>Nota:</strong> Puede asignar 0 litros a cualquier tipo de combustible si el usuario no lo necesita.
                  </p>
                </div>
              </div>

              {/* Campo de Dependencia */}
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
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Seleccione la categoría a la que pertenece el usuario
                </p>
              </div>

              {/* Campo de Sub dependencia (condicional) */}
              {showSubcategory && (
                <div className="animate-fade-in">
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
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="red" />
                      <span className="ml-2">Registrando...</span>
                    </span>
                  ) : (
                    'Registrar Cliente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
