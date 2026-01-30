const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const upload = require('../config/multer');

router.post('/upload', upload.single('videoFile'), videoController.uploadVideo);
router.get('/', videoController.getAllVideos);

// NUEVAS RUTAS
router.get('/:id', videoController.getVideoById);       // Ver video individual
router.post('/:id/like', videoController.likeVideo);    // Dar like
router.post('/:id/comment', videoController.commentVideo); // Comentar

module.exports = router;