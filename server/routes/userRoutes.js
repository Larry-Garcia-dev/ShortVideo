const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para actualizar idioma
router.put('/language', userController.updateLanguage);

module.exports = router;