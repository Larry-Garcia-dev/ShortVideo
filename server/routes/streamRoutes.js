const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');

// Get all live streams
router.get('/live', streamController.getLiveStreams);

// Get available gifts
router.get('/gifts', streamController.getGifts);

// Get stream by ID
router.get('/:id', streamController.getStreamById);

// Get user's stream history
router.get('/user/:userId', streamController.getUserStreams);

// Start a new stream
router.post('/start', streamController.startStream);

// End a stream
router.post('/:id/end', streamController.endStream);

// Update viewer count (join/leave)
router.post('/:id/viewers', streamController.updateViewerCount);

// Send a gift
router.post('/gift', streamController.sendGift);

module.exports = router;
