const isProd = import.meta.env.MODE === 'production';

// URL base para el backend (API)
export const BASE_URL = isProd ? 'https://hurammy.com' : 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;

// ==========================================
// 🚀 CONFIGURACIÓN DE ALIBABA CLOUD CDN
// ==========================================

// Reemplaza esto con el dominio CDN real que configuraste en Alibaba
export const CDN_DOMAIN = 'https://hurammy.com';

/**
 * Genera la URL completa para imágenes y videos.
 * Maneja rutas externas, rutas antiguas locales y las nuevas rutas del CDN.
 * * @param {string} path - Ruta del archivo en la BD (ej. 'videos/vid-123.mp4')
 * @returns {string} - URL lista para usar en <video src={...}> o <img src={...}>
 */
export const getMediaUrl = (path) => {
    if (!path) return '';

    // 1. Si es una URL externa o ya viene completa (http:// o https://)
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // 2. Si tienes archivos antiguos locales (opcional)
    // Si decides que los archivos viejos sigan cargando desde tu servidor:
    // if (path.includes('uploads/')) {
    //     return `${BASE_URL}/${path.startsWith('/') ? path.substring(1) : path}`;
    // }

    // 3. Para los archivos nuevos en OSS, unimos el CDN con la ruta
    // Quitamos el slash '/' inicial si por error se guardó como '/videos/...'
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    return `${CDN_DOMAIN}/${cleanPath}`;
};