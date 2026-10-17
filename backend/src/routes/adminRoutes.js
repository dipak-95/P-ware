const express = require('express');
const { getTraders, approveTrader, updateTraderStatus, getRetailerNetwork, getDashboardStats } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(requireRole(['admin']));

router.get('/dashboard-stats', getDashboardStats);
router.get('/traders', getTraders);
router.put('/traders/:id/approve', approveTrader);
router.put('/traders/:id/status', updateTraderStatus);
router.get('/retailers-network', getRetailerNetwork);

module.exports = router;
