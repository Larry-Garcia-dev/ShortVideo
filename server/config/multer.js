const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
['uploads', 'uploads/thumbnails', 'uploads/avatars', 'uploads/ai-images', 'uploads/ai-audio'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'thumbnail') {
            cb(null, 'uploads/thumbnails/');
        } else if (file.fieldname === 'avatar') {
            cb(null, 'uploads/avatars/');
        } else if (file.fieldname === 'ai_image') {
            cb(null, 'uploads/ai-images/');
        } else if (file.fieldname === 'ai_audio') {
            cb(null, 'uploads/ai-audio/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Extraemos la extensión (.jpg, .mp3, .wav, etc.)

        // MODIFICACIÓN AQUÍ: Aplicamos la lógica si es imagen de IA O audio de IA
        if (file.fieldname === 'ai_image' || file.fieldname === 'ai_audio') {
            // Math.random().toString(36) genera letras minúsculas y números.
            // substring(2, 7) extrae exactamente 5 caracteres de esa cadena aleatoria.
            const randomName = Math.random().toString(36).substring(2, 7);
            return cb(null, `${randomName}${ext}`);
        }

        // Lógica original para los demás archivos (videos normales, thumbnails, etc.)
        const baseName = req.body.title 
            ? req.body.title 
            : path.parse(file.originalname).name;

        const cleanName = baseName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);

        const prefix = file.fieldname === 'thumbnail' ? 'thumb' : 'vid';
        cb(null, `${prefix}-${Date.now()}-${cleanName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar' || file.fieldname === 'ai_image') {
        const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']; //
        if (allowedImages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Image: solo JPG, PNG, WEBP, GIF.'), false);
        }
    } else if (file.fieldname === 'ai_audio') {
        const allowedAudio = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/ogg', 'audio/webm']; //
        if (allowedAudio.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Audio: solo MP3, WAV, OGG, WEBM.'), false);
        }
    } else {
        const allowedVideos = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']; //
        if (allowedVideos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Video: solo MP4, MOV, AVI, WEBM.'), false);
        }
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } //
});

module.exports = upload;