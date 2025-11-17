// Configuración centralizada de dependencias de clientes
// IMPORTANTE: Actualiza este archivo cuando necesites modificar las dependencias

// Dependencias principales
export const MAIN_CATEGORIES = [
  'Gobernación',
  'Grupo Empresarial',
  'Alcaldía',
  'Categorias y Subcategorias',
  'Apoyos'
] as const;

// Sub dependencias por dependencia principal
export const SUBCATEGORIES: Record<string, string[]> = {
  'Gobernación': [
    'Secretarios',
    'Mequimp',
    'InfraLaGuaira',
    'InviLaGuaira',
    'Transuvar',
    'Paseo La Marina',
    'Seguridad Ciudad'
  ],
  'Grupo Empresarial': [
    'La Guaira Servicios, Viajes y turismo C.A',
    'Canteras y Minas CAMURI GRANDE VARGAS C.A',
    'Asfalto La Guaira C.A',
    'Concreto y Asfaltado de Vargas C.A (CONASFVAR)',
    'Corporacion Turistica Los Caracas C.A',
    'Empresa de distribucion de gas La Guaira C.A',
    'Canteras y Minas Naiguata C.A',
    'Construlaguira',
    'ADOQUINVAR',
    'Corporacion de reciclaje La Guaira C.A',
    'Corporacion pesquera La Guaireña C.A',
    'Empresa de transporte social urbano La Guaira C.A (TRANSLAGUAIRA)',
    'INSULAGUAIRA',
    'Otros'
  ],
  'Alcaldía': [
    'Corporacion',
    'Protecnia',
    'Policia Municipal',
    'Alcaldia Douglas',
    'A-Otros'
  ],
  'Categorias y Subcategorias': [
    'TransSucre',
    'Acuiferos',
    'Camara De Pan',
    'Bruno',
    'Roberto Gomez',
    'Trino',
    'T-Otros'
  ],
  'Apoyos': [
    'CRPM',
    'Fundalanavial',
    'Caruao',
    'SENIAT',
    'SOBERANIA ALIMENTARIA',
    'Alejandro Festejo',
    'V-Otros'
  ]
};

// Lista plana de todas las categorías (para compatibilidad)
export const CATEGORIES = MAIN_CATEGORIES;

export type Category = typeof CATEGORIES[number];

// Configuración visual de cada categoría
export const CATEGORY_CONFIG: Record<string, {
  color: string;
  icon: string;
  label: string;
  description?: string;
}> = {
  'Gobernación': {
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: 'FiHome',
    label: 'Gobernación',
    description: 'Entidad gubernamental estadal'
  },
  'Grupo Empresarial': {
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: 'FiBriefcase',
    label: 'Grupo Empresarial',
    description: 'Empresas del grupo empresarial'
  },
  'Alcaldía': {
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: 'FiHome',
    label: 'Alcaldía',
    description: 'Entidad gubernamental municipal'
  },
  'Categorias y Subcategorias': {
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    icon: 'FiTruck',
    label: 'Categorias y Subcategorias',
    description: 'Transporte y servicios diversos'
  },
  'Apoyos': {
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    icon: 'FiUsers',
    label: 'Apoyos',
    description: 'Organizaciones y entidades de apoyo'
  }
};

// Función helper para obtener la configuración de una categoría
export function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] || {
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    icon: 'FiTag',
    label: category,
    description: 'Categoría no definida'
  };
}

// Función helper para obtener todas las categorías como opciones de select
export function getCategoryOptions() {
  return CATEGORIES.map(cat => {
    const config = CATEGORY_CONFIG[cat];
    return {
      value: cat,
      label: config.label,
      color: config.color,
      icon: config.icon,
      description: config.description
    };
  });
}

// Función helper para obtener subcategorías de una categoría
export function getSubcategories(category: string): string[] {
  return SUBCATEGORIES[category] || [];
}

// Función helper para verificar si una categoría tiene subcategorías
export function hasSubcategories(category: string): boolean {
  return SUBCATEGORIES[category] && SUBCATEGORIES[category].length > 0;
}
