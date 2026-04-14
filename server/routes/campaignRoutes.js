const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // Importar middlewares

// Rutas
// AHORA PROTEGIDA: Solo usuarios logueados que sean 'admin' pueden crear
router.post('/create', verifyToken, isAdmin, campaignController.createCampaign);

router.get('/', campaignController.getActiveCampaigns);    // Pública: Listar activas
router.get('/:id', campaignController.getCampaignDetails); // Pública: Ver ranking
router.post('/:id/join', campaignController.joinCampaign); // Pública (o requerir login si prefieres)

// Rutas de administración de campañas
router.put('/:id', verifyToken, isAdmin, campaignController.updateCampaign);    // Actualizar campaña
router.delete('/:id', verifyToken, isAdmin, campaignController.deleteCampaign); // Eliminar campaña

module.exports = router;
