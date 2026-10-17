const Inquiry = require('../models/Inquiry');
const RetailerProfile = require('../models/RetailerProfile');
const TraderProfile = require('../models/TraderProfile');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create a new inquiry request
// @route   POST /api/inquiries/create
// @access  Private (Retailer or Trader)
const createInquiry = async (req, res) => {
  const { items } = req.body; // Array of { productId, quantity }
  const userId = req.user._id;
  const userRole = req.user.role;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Inquiry cart items are required' });
  }

  try {
    let retailerId, traderId;

    if (userRole === 'retailer') {
      // Retailer flow: find their mapped trader
      const retailerProfile = await RetailerProfile.findOne({ userId });
      if (!retailerProfile) {
        return res.status(404).json({ status: 'error', message: 'Retailer profile not found. Complete onboarding first.' });
      }
      retailerId = userId;
      traderId = retailerProfile.mappedTraderId;
    } else if (userRole === 'trader') {
      // Trader flow: trader is creating inquiry directly (they are the trader themselves)
      retailerId = userId; // Trader acts as the source
      traderId = userId;   // Trader is self-mapped
    }

    // Validate all products exist
    const validatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ status: 'error', message: `Product not found: ${item.productId}` });
      }
      
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ status: 'error', message: 'Quantity must be a positive number' });
      }

      validatedItems.push({
        productId: item.productId,
        quantity,
      });
    }

    // Create Inquiry
    const inquiry = await Inquiry.create({
      retailerId,
      traderId,
      items: validatedItems,
      status: 'pending',
    });

    // Trigger Notifications
    const { createNotificationHelper } = require('./notificationController');
    if (userRole === 'retailer') {
      await createNotificationHelper(
        retailerId,
        'Inquiry Submitted',
        `Your inquiry #${inquiry.inquiryNumber} has been received.`
      );
      await createNotificationHelper(
        traderId,
        'New Inquiry Received',
        `Inquiry #${inquiry.inquiryNumber} has been submitted by a retailer in your network.`
      );
    } else {
      // Trader created inquiry directly
      await createNotificationHelper(
        traderId,
        'Inquiry Created',
        `Your direct inquiry #${inquiry.inquiryNumber} has been submitted to admin for pricing.`
      );
    }

    res.status(201).json({
      status: 'success',
      message: 'Inquiry submitted successfully',
      data: inquiry,
    });
  } catch (error) {
    console.error('Create Inquiry Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit inquiry' });
  }
};

// @desc    Get Inquiries for Admin (with Retailer Privacy Masking)
// @route   GET /api/admin/inquiries
// @access  Private (Admin only)
const getAdminInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate({
        path: 'items.productId',
        select: 'name code specifications',
      })
      .sort({ createdAt: -1 });

    // Populate Trader Profile info and hide Retailer information entirely
    const maskedInquiries = await Promise.all(
      inquiries.map(async (inquiry) => {
        const traderProfile = await TraderProfile.findOne({ userId: inquiry.traderId });
        
        return {
          id: inquiry._id,
          inquiryNumber: inquiry.inquiryNumber,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
          items: inquiry.items,
          source: 'Retailer Network',
          trader: traderProfile
            ? {
                companyName: traderProfile.companyName,
                traderCode: traderProfile.traderCode,
              }
            : null,
          // Notice: Retailer identification info is completely absent from this object.
        };
      })
    );

    res.json({
      status: 'success',
      data: maskedInquiries,
    });
  } catch (error) {
    console.error('Get Admin Inquiries Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch inquiries' });
  }
};

// @desc    Get Inquiries for Trader (only inquiries mapped to them)
// @route   GET /api/trader/inquiries
// @access  Private (Trader only)
const getTraderInquiries = async (req, res) => {
  const traderUserId = req.user._id;

  try {
    const inquiries = await Inquiry.find({ traderId: traderUserId })
      .populate({
        path: 'items.productId',
        select: 'name code specifications',
      })
      .sort({ createdAt: -1 });

    // Populate Retailer info for the Trader, since the retailer is in their network
    const detailedInquiries = await Promise.all(
      inquiries.map(async (inquiry) => {
        const retailerProfile = await RetailerProfile.findOne({ userId: inquiry.retailerId });
        
        return {
          id: inquiry._id,
          inquiryNumber: inquiry.inquiryNumber,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
          items: inquiry.items,
          retailer: retailerProfile
            ? {
                companyName: retailerProfile.companyName,
                ownerName: retailerProfile.ownerName,
              }
            : null,
        };
      })
    );

    res.json({
      status: 'success',
      data: detailedInquiries,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch inquiries' });
  }
};

// @desc    Get Retailer Inquiries (Retailer tracking their own inquiries)
// @route   GET /api/retailer/inquiries
// @access  Private (Retailer only)
const getRetailerInquiries = async (req, res) => {
  const retailerUserId = req.user._id;

  try {
    const inquiries = await Inquiry.find({ retailerId: retailerUserId })
      .populate({
        path: 'items.productId',
        select: 'name code specifications',
      })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch inquiries' });
  }
};

// @desc    Get single inquiry by id for Admin (masked retailer info)
// @route   GET /api/inquiries/admin/:id
// @access  Private (Admin only)
const getAdminInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate({
        path: 'items.productId',
        select: 'name code specifications',
      });

    if (!inquiry) {
      return res.status(404).json({ status: 'error', message: 'Inquiry not found' });
    }

    const traderProfile = await TraderProfile.findOne({ userId: inquiry.traderId });

    const maskedInquiry = {
      id: inquiry._id,
      inquiryNumber: inquiry.inquiryNumber,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
      items: inquiry.items,
      source: 'Retailer Network',
      trader: traderProfile
        ? {
            companyName: traderProfile.companyName,
            traderCode: traderProfile.traderCode,
            ownerName: traderProfile.ownerName,
            gstNumber: traderProfile.gstNumber,
            address: traderProfile.address,
          }
        : null,
    };

    res.json({
      status: 'success',
      data: maskedInquiry,
    });
  } catch (error) {
    console.error('Get Admin Inquiry By ID Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch inquiry details' });
  }
};

module.exports = {
  createInquiry,
  getAdminInquiries,
  getTraderInquiries,
  getRetailerInquiries,
  getAdminInquiryById,
};
