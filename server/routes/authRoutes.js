const express = require('express');
const router = express.Router(); // <--- AQUÍ SÍ DEFINIMOS ROUTER
const authController = require('../controllers/authController');

// Definir endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;