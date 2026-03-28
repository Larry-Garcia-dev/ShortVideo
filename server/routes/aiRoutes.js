const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const upload = require('../config/multer');
// const { verifyToken } = require('../middleware/authMiddleware'); // Opcional: para proteger la ruta

// POST /api/ai/upload-image - Subir imagen para IA
router.post('/upload-image', upload.single('ai_image'), aiController.uploadImage);

// POST /api/ai/upload-audio - Subir audio para IA
router.post('/upload-audio', upload.single('ai_audio'), aiController.uploadAudio);

// POST /api/ai/upload-trimmed-audio - Subir audio recortado (blob) para IA
router.post('/upload-trimmed-audio', upload.single('ai_audio'), aiController.uploadTrimmedAudio);

// POST /api/ai/generate - Iniciar generación de video
router.post('/generate', aiController.generateVideo);

// GET /api/ai/task/:taskId - Consultar estado de tarea
router.get('/task/:taskId', aiController.getTaskStatus);

module.exports = router;
