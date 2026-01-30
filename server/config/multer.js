const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Guardar en la carpeta 'uploads'
    },
    filename: (req, file, cb) => {
        // Generar un nombre único: video-FECHA-NombreOriginal
        cb(null, `video-${Date.now()}-${file.originalname}`);
    }
});

// Filtro para aceptar solo videos
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo no es un video válido'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;