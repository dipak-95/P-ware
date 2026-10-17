const express = require('express');
const {
  createInquiry,
  getAdminInquiries,
  getTraderInquiries,
  getRetailerInquiries,
  getAdminInquiryById,
} = require('../controllers/inquiryController');
const { protect, requireRole, isApproved } = require('../middleware/auth');

const router = express.Router();

// Apply auth protection
router.use(protect);

// Retailer endpoints
router.post('/create', requireRole(['retailer', 'trader']), isApproved, createInquiry);
router.get('/retailer', requireRole(['retailer']), isApproved, getRetailerInquiries);

// Trader endpoint
router.get('/trader', requireRole(['trader']), isApproved, getTraderInquiries);

// Admin endpoints
router.get('/admin', requireRole(['admin']), getAdminInquiries);
router.get('/admin/:id', requireRole(['admin']), getAdminInquiryById);

module.exports = router;
