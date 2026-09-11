import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api';

export const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const esEndpointAuth = url.includes('/auth/login') || url.includes('/auth/register');

    // Un 401 en el login/registro es un error de credenciales, no una
    // sesion expirada: se deja que el formulario muestre el mensaje.
    if (error.response?.status === 401 && !esEndpointAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Descarga un PDF verificando que la respuesta sea realmente un archivo.
export const descargarPDF = async (path, filename) => {
  const response = await api.get(path, { responseType: 'blob' });
  const contentType = response.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    throw new Error('No se pudo generar el PDF');
  }

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export default api;
