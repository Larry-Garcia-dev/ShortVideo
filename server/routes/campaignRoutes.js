const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

// Rutas
router.post('/create', campaignController.createCampaign); // Solo admin debería usar esto
router.get('/', campaignController.getActiveCampaigns);    // Listar activas
router.get('/:id', campaignController.getCampaignDetails); // Ver ranking
router.post('/:id/join', campaignController.joinCampaign); // Inscribir video

module.exports = router;