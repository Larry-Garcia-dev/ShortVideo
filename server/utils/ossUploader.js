const client = require('../config/ossConfig');
const fs = require('fs');

/**
 * Sube un archivo local a Alibaba Cloud OSS y lo elimina del servidor local
 * @param {string} localPath - Ruta local del archivo (ej. uploads/vid-123.mp4)
 * @param {string} destFileName - Nombre y ruta destino en OSS (ej. videos/vid-123.mp4)
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {Promise<string>} - Ruta relativa guardada en OSS
 */
async function uploadToOSS(localPath, destFileName, mimeType) {
  try {
    const isVideo = mimeType ? mimeType.startsWith('video/') : destFileName.match(/\.(mp4|mov|avi|webm)$/i);
    let result;

    if (isVideo) {
      // Para videos: usamos carga multiparte (ideal para archivos grandes)
      result = await client.multipartUpload(destFileName, localPath, {
        progress: (p) => {
          console.log(`[OSS] Subiendo ${destFileName}: ${(p * 100).toFixed(2)}%`);
        },
        meta: { project: 'hurammy-shortvideo' },
        mime: mimeType
      });
    } else {
      // Para imágenes y otros archivos: carga normal (más rápida para archivos pequeños)
      result = await client.put(destFileName, localPath);
    }

    // Una vez subido con éxito, eliminamos el archivo local para limpiar el ECS
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    return destFileName;
  } catch (error) {
    console.error(`[OSS] Error al subir el archivo ${destFileName}:`, error);
    // Intentar limpiar el archivo local incluso si falla la subida
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    throw error;
  }
}

module.exports = { uploadToOSS };