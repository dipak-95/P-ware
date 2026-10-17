const User = require('../models/User');
const TraderProfile = require('../models/TraderProfile');
const RetailerProfile = require('../models/RetailerProfile');
const Inquiry = require('../models/Inquiry');

// Helper to generate unique trader code
const generateTraderCode = async () => {
  const latestTrader = await TraderProfile.findOne({ traderCode: { $regex: /^TRD-/ } }).sort({ traderCode: -1 });
  if (latestTrader && latestTrader.traderCode) {
    const numericPart = parseInt(latestTrader.traderCode.split('-')[1]);
    return `TRD-${numericPart + 1}`;
  }
  return 'TRD-1001';
};

// @desc    Get List of all Traders (Pending, Approved, Suspended)
// @route   GET /api/admin/traders
// @access  Private (Admin only)
const getTraders = async (req, res) => {
  try {
    const tradersProfiles = await TraderProfile.find().populate('userId', 'email phone status onboardingComplete');
    res.json({
      status: 'success',
      data: tradersProfiles,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch traders' });
  }
};

// @desc    Approve a Trader and generate code/referral link
// @route   PUT /api/admin/traders/:id/approve
// @access  Private (Admin only)
const approveTrader = async (req, res) => {
  const traderUserId = req.params.id;

  try {
    const user = await User.findById(traderUserId);
    if (!user || user.role !== 'trader') {
      return res.status(404).json({ status: 'error', message: 'Trader user not found' });
    }

    if (user.status === 'approved') {
      return res.status(400).json({ status: 'error', message: 'Trader is already approved' });
    }

    const profile = await TraderProfile.findOne({ userId: traderUserId });
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Trader profile details not found' });
    }

    // Generate Trader Code and Referral Link
    const traderCode = await generateTraderCode();
    const referralLink = `http://localhost:3000/register?ref=${traderCode}`;

    profile.traderCode = traderCode;
    profile.referralLink = referralLink;
    await profile.save();

    user.status = 'approved';
    await user.save();

    // Trigger notification to Trader
    const { createNotificationHelper } = require('./notificationController');
    await createNotificationHelper(
      user._id,
      'Trader Approved',
      `Your account has been approved. Your Trader Code is: ${traderCode}`
    );

    res.json({
      status: 'success',
      message: 'Trader approved successfully',
      trader: {
        id: user._id,
        email: user.email,
        status: user.status,
        traderCode,
        referralLink,
      },
    });
  } catch (error) {
    console.error('Approve Trader Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to approve trader' });
  }
};

// @desc    Suspend/Reject a Trader
// @route   PUT /api/admin/traders/:id/status
// @access  Private (Admin only)
const updateTraderStatus = async (req, res) => {
  const traderUserId = req.params.id;
  const { status } = req.body; // 'suspended', 'rejected', 'pending'

  if (!['suspended', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Invalid status value' });
  }

  try {
    const user = await User.findById(traderUserId);
    if (!user || user.role !== 'trader') {
      return res.status(404).json({ status: 'error', message: 'Trader user not found' });
    }

    user.status = status;
    await user.save();

    res.json({
      status: 'success',
      message: `Trader status updated to ${status} successfully`,
      data: {
        id: user._id,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update trader status' });
  }
};

// @desc    Get complete Retailer Network mapped under traders
// @route   GET /api/admin/retailers-network
// @access  Private (Admin only)
const getRetailerNetwork = async (req, res) => {
  try {
    // We want to list all approved Traders along with their list of mapped Retailers
    const traders = await TraderProfile.find().populate('userId', 'email phone status');
    
    const network = await Promise.all(
      traders.map(async (trader) => {
        const retailers = await RetailerProfile.find({ mappedTraderId: trader.userId })
          .populate('userId', 'email phone status');
        
        return {
          trader: {
            id: trader.userId._id,
            companyName: trader.companyName,
            traderCode: trader.traderCode,
            email: trader.userId.email,
            phone: trader.userId.phone,
            status: trader.userId.status,
          },
          retailersCount: retailers.length,
          retailers: retailers.map(r => ({
            id: r.userId._id,
            companyName: r.companyName,
            ownerName: r.ownerName,
            email: r.userId.email,
            phone: r.userId.phone,
          })),
        };
      })
    );

    res.json({
      status: 'success',
      data: network,
    });
  } catch (error) {
    console.error('Get Retailer Network Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch retailer network' });
  }
};

// @desc    Get dashboard metrics and statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Category = require('../models/Category');

    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalTraders = await User.countDocuments({ role: 'trader' });
    const totalRetailers = await User.countDocuments({ role: 'retailer' });
    const totalInquiries = await Inquiry.countDocuments();
    const pendingInquiries = await Inquiry.countDocuments({ status: 'pending' });

    res.json({
      status: 'success',
      data: {
        totalProducts,
        totalCategories,
        totalTraders,
        totalRetailers,
        totalInquiries,
        pendingInquiries,
      },
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve stats' });
  }
};

module.exports = {
  getTraders,
  approveTrader,
  updateTraderStatus,
  getRetailerNetwork,
  getDashboardStats,
};
