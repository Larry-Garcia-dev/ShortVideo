// Archivo: server/config/multer.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Obtenemos el título del body (si llega antes que el archivo) 
        // o usamos el nombre original limpio
        const baseName = req.body.title 
            ? req.body.title 
            : file.originalname.split('.')[0];

        // 1. Convertir a minúsculas
        // 2. Reemplazar espacios y caracteres no deseados por guiones
        // 3. Recortar a 20 caracteres para que sea corto
        const cleanName = baseName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 20);

        const ext = path.extname(file.originalname);
        
        // Formato final: video-1738291-mi-titulo.mp4
        cb(null, `v-${Date.now()}-${cleanName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;