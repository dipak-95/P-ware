const path = require('path');
const fs = require('fs');
const Quotation = require('../models/Quotation');
const Inquiry = require('../models/Inquiry');
const TraderProfile = require('../models/TraderProfile');
const Product = require('../models/Product');
const generateQuotationPDF = require('../utils/pdfGenerator');

// @desc    Create a quotation for a retailer's inquiry
// @route   POST /api/admin/quotations/create
// @access  Private (Admin only)
const createQuotation = async (req, res) => {
  const { inquiryId, rates } = req.body; // rates is an array: [{ productId, rate }]

  if (!inquiryId || !rates || !Array.isArray(rates) || rates.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Inquiry ID and item rates are required' });
  }

  try {
    // 1. Fetch Inquiry
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ status: 'error', message: 'Inquiry not found' });
    }

    if (inquiry.status === 'quotation_generated') {
      return res.status(400).json({ status: 'error', message: 'Quotation has already been generated for this inquiry' });
    }

    // 2. Fetch Trader Profile
    const traderProfile = await TraderProfile.findOne({ userId: inquiry.traderId });
    if (!traderProfile) {
      return res.status(404).json({ status: 'error', message: 'Trader profile details not found' });
    }

    // 3. Map rates to products and calculate subtotal
    let subTotal = 0;
    const ratesMapping = [];
    const itemsDetails = [];

    for (const item of inquiry.items) {
      const rateInfo = rates.find((r) => r.productId.toString() === item.productId.toString());
      if (!rateInfo || typeof rateInfo.rate !== 'number' || rateInfo.rate < 0) {
        return res.status(400).json({
          status: 'error',
          message: `Valid rate is required for product ID: ${item.productId}`,
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ status: 'error', message: 'Product associated with inquiry not found' });
      }

      const totalItemAmount = rateInfo.rate * item.quantity;
      subTotal += totalItemAmount;

      ratesMapping.push({
        productId: item.productId,
        quantity: item.quantity,
        rate: rateInfo.rate,
      });

      // Spec summary helper (dimension, mounting)
      const specSummary = product.specifications.get('Dimensions') || product.specifications.get('Material') || '';

      itemsDetails.push({
        name: product.name,
        code: product.code,
        specSummary,
        quantity: item.quantity,
        rate: rateInfo.rate,
        total: totalItemAmount,
      });
    }

    const gstAmount = subTotal * 0.18; // 18% GST standard
    const totalAmount = subTotal + gstAmount;

    // 4. Quotation Number generation (QTE-{inquiryNumber})
    const quotationNumber = `QTE-${inquiry.inquiryNumber}`;

    // PDF filename path
    const pdfFilename = `${quotationNumber}.pdf`;
    const relativePdfPath = path.join('storage', 'quotes', pdfFilename);
    const absolutePdfPath = path.join(__dirname, '..', '..', relativePdfPath);

    // 5. Create Quotation object
    const quotation = new Quotation({
      inquiryId: inquiry._id,
      quotationNumber,
      traderId: inquiry.traderId,
      rates: ratesMapping,
      subTotal,
      gstAmount,
      totalAmount,
      pdfPath: relativePdfPath,
    });

    // 6. Generate the PDF file
    await generateQuotationPDF(quotation, traderProfile, itemsDetails, absolutePdfPath);

    // 7. Save Quotation and Update Inquiry Status
    await quotation.save();
    inquiry.status = 'quotation_generated';
    await inquiry.save();

    // Trigger Notifications
    const { createNotificationHelper } = require('./notificationController');
    // Notify Trader
    await createNotificationHelper(
      inquiry.traderId,
      'New Quotation',
      `Quotation ${quotationNumber} generated for Inquiry #${inquiry.inquiryNumber}.`
    );
    // Notify Retailer
    await createNotificationHelper(
      inquiry.retailerId,
      'Quotation Generated',
      `Quotation for your Inquiry #${inquiry.inquiryNumber} has been generated.`
    );

    res.status(201).json({
      status: 'success',
      message: 'Quotation and PDF generated successfully',
      data: quotation,
    });
  } catch (error) {
    console.error('Quotation Generation Error:', error);
    res.status(500).json({ status: 'error', message: 'Quotation generation failed' });
  }
};

// @desc    Get Quotations for Trader
// @route   GET /api/trader/quotations
// @access  Private (Trader only)
const getTraderQuotations = async (req, res) => {
  const traderUserId = req.user._id;

  try {
    const quotations = await Quotation.find({ traderId: traderUserId })
      .populate({
        path: 'inquiryId',
        select: 'inquiryNumber createdAt',
      })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: quotations,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve quotations' });
  }
};

// @desc    Download Quotation PDF (Strict Role-Based verification)
// @route   GET /api/quotes/:quoteId/download
// @access  Private (Admin & Trader only)
const downloadQuotationPDF = async (req, res) => {
  const quoteId = req.params.quoteId;
  const user = req.user;

  // 1. Role-based access validation (Checked first to prevent ID enumeration)
  if (user.role === 'retailer') {
    return res.status(403).json({
      status: 'error',
      message: 'Access Denied. Retailers are restricted from accessing pricing and Quotation PDFs.',
    });
  }

  try {
    const quotation = await Quotation.findById(quoteId);
    if (!quotation) {
      return res.status(404).json({ status: 'error', message: 'Quotation record not found' });
    }

    // If user is trader, check ownership
    if (user.role === 'trader' && quotation.traderId.toString() !== user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access Denied. You are not authorized to access this quotation.',
      });
    }

    const absolutePdfPath = path.join(__dirname, '..', '..', quotation.pdfPath);

    if (!fs.existsSync(absolutePdfPath)) {
      return res.status(404).json({ status: 'error', message: 'PDF file not found on server storage.' });
    }

    // Stream download headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${quotation.quotationNumber}.pdf"`);

    const fileStream = fs.createReadStream(absolutePdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('PDF Streaming Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to stream PDF file' });
  }
};

module.exports = {
  createQuotation,
  getTraderQuotations,
  downloadQuotationPDF,
};
