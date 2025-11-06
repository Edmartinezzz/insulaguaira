import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Añadir el token a las solicitudes
api.interceptors.request.use((config) => {
  // Intentar obtener el token de administrador primero
  let token = localStorage.getItem('token');
  
  // Si no hay token de administrador, intentar con el token de cliente
  if (!token) {
    token = localStorage.getItem('clienteToken');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Manejar errores de red
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en la petición:', error);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Error de conexión con el servidor:', error.message);
      throw new Error('No se pudo conectar al servidor. Por favor, verifica que el servidor esté en ejecución en http://127.0.0.1:5000');
    }
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error en la respuesta del servidor:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // No autorizado - token inválido o expirado
        const isCliente = localStorage.getItem('clienteToken');
        
        if (isCliente) {
          // Si es un cliente, redirigir al login de cliente
          localStorage.removeItem('clienteToken');
          localStorage.removeItem('clienteData');
          window.location.href = '/cliente/login';
        } else {
          // Si es un administrador, redirigir al login de administrador
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      throw new Error(error.response.data.error || 'Error en la solicitud');
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se recibió respuesta del servidor. Verifica tu conexión a internet.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
