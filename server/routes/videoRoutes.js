const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const upload = require('../config/multer');

router.post('/upload', upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), videoController.uploadVideo);
router.get('/', videoController.getAllVideos);
router.get('/top', videoController.getTopVideos);
router.get('/trending-hashtags', videoController.getTrendingHashtags);

// NUEVAS RUTAS
router.get('/:id', videoController.getVideoById);           // Ver video individual
router.post('/:id/like', videoController.likeVideo);        // Dar like
router.delete('/:id/like', videoController.unlikeVideo);    // Quitar like
router.post('/:id/toggle-like', videoController.toggleLike); // Toggle like
router.post('/:id/comment', videoController.commentVideo);   // Comentar
router.delete('/:id/comment/:commentId', videoController.deleteComment); // Eliminar comentario

module.exports = router;
