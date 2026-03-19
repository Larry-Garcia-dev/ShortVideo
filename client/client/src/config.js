// Vite detecta automáticamente si estamos en producción (Alibaba Cloud) o en local (tu PC)
const isProd = import.meta.env.MODE === 'production';

// URL base para cargar imágenes y videos
export const BASE_URL = isProd ? 'http://hurammy.com:5000' : 'http://localhost:5000';

// URL base para las peticiones a la API
export const API_URL = `${BASE_URL}/api`;