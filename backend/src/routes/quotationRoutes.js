const express = require('express');
const { createQuotation, getTraderQuotations, downloadQuotationPDF } = require('../controllers/quotationController');
const { protect, requireRole, isApproved } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/admin/create', requireRole(['admin']), createQuotation);
router.get('/trader', requireRole(['trader']), isApproved, getTraderQuotations);
router.get('/:quoteId/download', downloadQuotationPDF);

module.exports = router;
