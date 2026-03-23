const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coinController');

// Get user's coin balance
router.get('/balance/:userId', coinController.getBalance);

// Get available coin packages
router.get('/packages', coinController.getPackages);

// Get transaction history
router.get('/transactions/:userId', coinController.getTransactions);

// Purchase coins
router.post('/purchase', coinController.purchaseCoins);

// Add free coins (admin/promotion)
router.post('/add-free', coinController.addFreeCoins);

module.exports = router;
