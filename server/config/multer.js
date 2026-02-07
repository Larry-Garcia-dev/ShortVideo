const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Sanitización del nombre de archivo
        const baseName = req.body.title 
            ? req.body.title 
            : path.parse(file.originalname).name;

        const cleanName = baseName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-') // Solo letras y números
            .replace(/-+/g, '-') // Eliminar guiones repetidos
            .substring(0, 30);

        const ext = path.extname(file.originalname);
        // Timestamp único + nombre limpio
        cb(null, `vid-${Date.now()}-${cleanName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Validar tipo MIME estricto
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Solo MP4, MOV, AVI, WEBM.'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // Límite opcional de 500MB
});

module.exports = upload;