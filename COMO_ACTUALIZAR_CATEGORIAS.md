# 📝 Cómo Actualizar las Categorías de Clientes

Este documento explica cómo agregar, modificar o eliminar categorías de clientes en el sistema.

---

## 🎯 Archivo de Configuración

Todas las categorías están centralizadas en un solo archivo:

**📁 Ubicación**: `/src/config/categories.ts`

---

## ✏️ Cómo Agregar una Nueva Categoría

### Paso 1: Editar el Array de Categorías

Abre el archivo `/src/config/categories.ts` y agrega tu nueva categoría al array `CATEGORIES`:

```typescript
export const CATEGORIES = [
  'Persona Natural',
  'Gobernación',
  'Alcaldía',
  'Empresa Privada',
  'Institución Pública',
  'Transporte Público',
  'Servicios Esenciales',
  'TU_NUEVA_CATEGORIA',  // ← Agregar aquí
  'Otro'
] as const;
```

### Paso 2: Configurar la Apariencia Visual

En el mismo archivo, agrega la configuración visual en el objeto `CATEGORY_CONFIG`:

```typescript
export const CATEGORY_CONFIG: Record<string, {...}> = {
  // ... otras categorías ...
  
  'TU_NUEVA_CATEGORIA': {
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    icon: 'FiStar',  // Nombre del icono de react-icons/fi
    label: 'Tu Nueva Categoría',
    description: 'Descripción de la categoría'
  },
  
  // ... otras categorías ...
};
```

### Paso 3: (Opcional) Agregar Nuevo Icono

Si usas un icono nuevo que no está en el componente `CategoryBadge`, agrégalo:

**📁 Archivo**: `/src/components/ui/CategoryBadge.tsx`

```typescript
// 1. Importar el icono
import { FiUser, FiUsers, ..., FiStar } from 'react-icons/fi';

// 2. Agregarlo al iconMap
const iconMap: Record<string, any> = {
  FiUser,
  FiUsers,
  // ... otros iconos ...
  FiStar,  // ← Agregar aquí
};
```

---

## 🎨 Colores Disponibles

Puedes usar cualquiera de estos colores de Tailwind:

| Color | Clase Base |
|-------|-----------|
| 🔵 Azul | `bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300` |
| 🟣 Morado | `bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300` |
| 🟢 Verde | `bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300` |
| 🟡 Amarillo | `bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300` |
| 🟠 Naranja | `bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300` |
| 🔴 Rojo | `bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300` |
| 🟤 Índigo | `bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300` |
| 🩵 Cyan | `bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300` |
| 🩷 Rosa | `bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300` |
| ⚫ Gris | `bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300` |

---

## 🎭 Iconos Disponibles

Iconos de `react-icons/fi` (Feather Icons) que puedes usar:

- `FiUser` - Usuario individual
- `FiUsers` - Grupo de usuarios
- `FiHome` - Casa/Edificio
- `FiBriefcase` - Maletín/Empresa
- `FiTruck` - Camión/Transporte
- `FiActivity` - Actividad/Servicios
- `FiTag` - Etiqueta genérica
- `FiStar` - Estrella
- `FiShield` - Escudo
- `FiAward` - Premio
- `FiHeart` - Corazón
- `FiFlag` - Bandera
- Y muchos más en: https://react-icons.github.io/react-icons/icons/fi/

---

## 🗑️ Cómo Eliminar una Categoría

### ⚠️ ADVERTENCIA
Eliminar una categoría puede causar problemas si hay clientes registrados con esa categoría.

### Pasos Recomendados:

1. **Verificar** que no haya clientes con esa categoría en la base de datos
2. **Eliminar** del array `CATEGORIES` en `/src/config/categories.ts`
3. **Eliminar** la configuración visual de `CATEGORY_CONFIG`
4. **Reiniciar** el servidor de desarrollo

---

## ✏️ Cómo Modificar una Categoría Existente

### Cambiar el Nombre:
```typescript
// ANTES
'Gobernación': {
  label: 'Gobernación',
  // ...
}

// DESPUÉS
'Gobernación': {
  label: 'Gobierno Regional',  // ← Solo cambiar el label
  // ...
}
```

### Cambiar el Color:
```typescript
'Gobernación': {
  color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',  // ← Nuevo color
  // ...
}
```

### Cambiar el Icono:
```typescript
'Gobernación': {
  icon: 'FiStar',  // ← Nuevo icono
  // ...
}
```

---

## 🔄 Dónde se Usan las Categorías

Las categorías se utilizan automáticamente en:

1. ✅ **Formulario de Registro** (`/dashboard/registrar-cliente`)
   - Selector dropdown con todas las categorías

2. ✅ **Consulta de Cliente** (`/clientes`)
   - Badge visual con color e icono

3. ✅ **Dashboard Principal** (`/dashboard`)
   - Filtro por categoría
   - Tabla de retiros con categoría del cliente

4. ✅ **Exportación CSV**
   - Incluye la categoría en los datos exportados

---

## 📋 Ejemplo Completo

Supongamos que quieres agregar la categoría "Ministerio":

### 1. Editar `/src/config/categories.ts`:

```typescript
export const CATEGORIES = [
  'Persona Natural',
  'Gobernación',
  'Alcaldía',
  'Ministerio',  // ← NUEVO
  'Empresa Privada',
  'Institución Pública',
  'Transporte Público',
  'Servicios Esenciales',
  'Otro'
] as const;

export const CATEGORY_CONFIG: Record<string, {...}> = {
  // ... otras categorías ...
  
  'Ministerio': {  // ← NUEVO
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: 'FiShield',
    label: 'Ministerio',
    description: 'Ministerios del gobierno nacional'
  },
  
  // ... otras categorías ...
};
```

### 2. Si usas un icono nuevo, editar `/src/components/ui/CategoryBadge.tsx`:

```typescript
import { FiUser, FiUsers, FiBriefcase, FiTruck, FiActivity, FiTag, FiHome, FiShield } from 'react-icons/fi';

const iconMap: Record<string, any> = {
  FiUser,
  FiUsers,
  FiBriefcase,
  FiTruck,
  FiActivity,
  FiTag,
  FiHome,
  FiShield,  // ← NUEVO
};
```

### 3. ¡Listo! 🎉

La nueva categoría aparecerá automáticamente en:
- El formulario de registro
- Los filtros del dashboard
- Los badges visuales
- Las exportaciones

---

## 🚀 Después de Hacer Cambios

1. **Guarda** todos los archivos
2. El servidor de desarrollo **recargará automáticamente**
3. **Refresca** el navegador (F5)
4. **Prueba** registrando un cliente con la nueva categoría

---

## ❓ Preguntas Frecuentes

### ¿Puedo tener más de 10 categorías?
Sí, no hay límite. El sistema se adapta automáticamente.

### ¿Los clientes existentes se verán afectados?
No, los clientes ya registrados mantendrán su categoría. Solo las nuevas categorías estarán disponibles para nuevos registros.

### ¿Puedo usar emojis en los nombres?
Sí, pero no es recomendado para mantener consistencia profesional.

### ¿Qué pasa si borro una categoría que está en uso?
Los clientes con esa categoría mostrarán "Otro" como fallback. Es mejor migrar los datos primero.

---

## 📞 Soporte

Si tienes problemas al actualizar las categorías, verifica:

1. ✅ Sintaxis correcta en el archivo TypeScript
2. ✅ Nombres de iconos correctos (deben existir en react-icons/fi)
3. ✅ Colores de Tailwind válidos
4. ✅ Servidor de desarrollo reiniciado

---

**Última actualización**: Noviembre 2025
