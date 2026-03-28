const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
// const { verifyToken } = require('../middleware/authMiddleware'); // Opcional: para proteger la ruta

// POST /api/ai/generate
router.post('/generate', aiController.generateVideo);

// GET /api/ai/task/:taskId
router.get('/task/:taskId', aiController.getTaskStatus);

module.exports = router;