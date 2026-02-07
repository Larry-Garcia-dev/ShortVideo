const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
['uploads', 'uploads/thumbnails'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'thumbnail') {
            cb(null, 'uploads/thumbnails/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const baseName = req.body.title 
            ? req.body.title 
            : path.parse(file.originalname).name;

        const cleanName = baseName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);

        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'thumbnail' ? 'thumb' : 'vid';
        cb(null, `${prefix}-${Date.now()}-${cleanName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
        const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedImages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Thumbnail: solo JPG, PNG, WEBP, GIF.'), false);
        }
    } else {
        const allowedVideos = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
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
    limits: { fileSize: 500 * 1024 * 1024 }
});

module.exports = upload;
