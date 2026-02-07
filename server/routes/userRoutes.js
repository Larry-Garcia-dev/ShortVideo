const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Idioma
router.put('/language', userController.updateLanguage);

// Creadores populares
router.get('/top-creators', userController.getTopCreators);

// Follow / Unfollow
router.post('/follow', userController.followUser);
router.post('/unfollow', userController.unfollowUser);
router.post('/toggle-follow', userController.toggleFollow);

// Follower count
router.get('/:id/followers', userController.getFollowerCount);

module.exports = router;
