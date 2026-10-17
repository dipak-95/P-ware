const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const TraderProfile = require('../models/TraderProfile');
const RetailerProfile = require('../models/RetailerProfile');
const { generateToken } = require('../utils/jwt');

// Initialize Google client if client id is provided
const client = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

// ─── Helper ────────────────────────────────────────────────────────────────
const buildUserResponse = async (user) => {
  let profile = null;
  if (user.onboardingComplete) {
    if (user.role === 'trader') {
      profile = await TraderProfile.findOne({ userId: user._id });
    } else if (user.role === 'retailer') {
      profile = await RetailerProfile.findOne({ userId: user._id });
    }
  }
  return {
    token: generateToken({ id: user._id, role: user.role }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      onboardingComplete: user.onboardingComplete,
    },
    profile,
  };
};

// ─── REGISTER ──────────────────────────────────────────────────────────────
// @desc    Register a new user with email + password
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
  }

  try {
    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'An account with this email already exists. Please sign in.' });
    }

    // Check duplicate phone (if provided)
    if (phone) {
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) {
        return res.status(409).json({ status: 'error', message: 'An account with this phone number already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      role: 'retailer', // default until onboarding
      status: 'pending',
      onboardingComplete: false,
    });

    const payload = await buildUserResponse(user);

    return res.status(201).json({ status: 'success', ...payload });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ status: 'error', message: 'Registration failed due to server error' });
  }
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────
// @desc    Login with email or phone + password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { identifier, password } = req.body; // identifier = email OR phone

  if (!identifier || !password) {
    return res.status(400).json({ status: 'error', message: 'Email/phone and password are required' });
  }

  try {
    // Find user by email or phone, explicitly selecting password
    const isEmail = identifier.includes('@');
    const query = isEmail
      ? { email: identifier.toLowerCase().trim() }
      : { phone: identifier.trim() };

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'No account found with this email or phone number' });
    }

    if (!user.password) {
      return res.status(401).json({ status: 'error', message: 'This account uses Google Sign-In. Please use Google to log in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Incorrect password. Please try again.' });
    }

    const payload = await buildUserResponse(user);
    return res.json({ status: 'success', ...payload });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Login failed due to server error' });
  }
};

// ─── GOOGLE LOGIN (existing, keep for admin mock) ──────────────────────────
// @desc    Google Sign-In / Registration
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res) => {
  const { idToken, email: devEmail, name: devName } = req.body;

  let email;
  let googleId;
  let name;

  if (idToken && idToken.startsWith('mock_')) {
    email = devEmail || `${idToken.split('_')[1]}@example.com`;
    googleId = idToken;
    name = devName || idToken.split('_')[1];
  } else {
    if (!client) {
      return res.status(500).json({ status: 'error', message: 'Google OAuth Client ID is not configured on the server.' });
    }
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      email = payload.email;
      googleId = payload.sub;
      name = payload.name;
    } catch (error) {
      return res.status(400).json({ status: 'error', message: 'Invalid Google ID Token.' });
    }
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      const payload = await buildUserResponse(user);
      return res.json({ status: 'success', ...payload });
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        role: 'retailer',
        status: 'pending',
        onboardingComplete: false,
      });
      const payload = await buildUserResponse(user);
      return res.status(201).json({ status: 'success', ...payload });
    }
  } catch (error) {
    console.error('Database login error:', error);
    res.status(500).json({ status: 'error', message: 'Authentication failed due to server error' });
  }
};

// ─── ONBOARDING ────────────────────────────────────────────────────────────
// @desc    Complete onboarding process (set profile info)
// @route   POST /api/auth/onboarding
// @access  Private
const completeOnboarding = async (req, res) => {
  const { role, companyName, ownerName, phone, street, city, state, pincode, gstNumber, mappedTraderCode } = req.body;
  const userId = req.user._id;

  if (!['trader', 'retailer'].includes(role)) {
    return res.status(400).json({ status: 'error', message: 'Invalid role selection' });
  }

  try {
    const existingUser = await User.findById(userId);
    if (existingUser.onboardingComplete) {
      return res.status(400).json({ status: 'error', message: 'Onboarding already completed' });
    }

    if (phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: userId } });
      if (phoneExists) {
        return res.status(400).json({ status: 'error', message: 'Phone number already registered to another account' });
      }
      existingUser.phone = phone;
    }

    existingUser.role = role;

    let profile = null;

    if (role === 'trader') {
      if (!gstNumber) {
        return res.status(400).json({ status: 'error', message: 'GST Number is required for Trader onboarding' });
      }
      existingUser.status = 'pending';
      profile = await TraderProfile.create({
        userId,
        companyName,
        ownerName,
        gstNumber,
        address: { street, city, state, pincode },
      });
    } else if (role === 'retailer') {
      if (!mappedTraderCode) {
        return res.status(400).json({ status: 'error', message: 'Trader Referral Code is required to link accounts' });
      }
      const traderProfile = await TraderProfile.findOne({ traderCode: mappedTraderCode.trim() });
      if (!traderProfile) {
        return res.status(400).json({ status: 'error', message: `Invalid Trader Code: ${mappedTraderCode}` });
      }
      const traderUser = await User.findById(traderProfile.userId);
      if (!traderUser || traderUser.status !== 'approved') {
        return res.status(400).json({ status: 'error', message: 'Trader is not approved or active' });
      }
      existingUser.status = 'approved';
      profile = await RetailerProfile.create({
        userId,
        companyName,
        ownerName,
        address: { street, city, state, pincode },
        mappedTraderId: traderUser._id,
      });
    }

    existingUser.onboardingComplete = true;
    await existingUser.save();

    const token = generateToken({ id: existingUser._id, role: existingUser.role });

    res.status(200).json({
      status: 'success',
      message: 'Onboarding completed successfully',
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        onboardingComplete: existingUser.onboardingComplete,
      },
      profile,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during onboarding completion' });
  }
};

// ─── GET ME ────────────────────────────────────────────────────────────────
// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.onboardingComplete) {
      if (user.role === 'trader') {
        profile = await TraderProfile.findOne({ userId: user._id });
      } else if (user.role === 'retailer') {
        profile = await RetailerProfile.findOne({ userId: user._id }).populate('mappedTraderId', 'email phone');
      }
    }
    res.json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        onboardingComplete: user.onboardingComplete,
      },
      profile,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error fetching profile details' });
  }
};

// ─── TRADER RETAILERS ──────────────────────────────────────────────────────
// @desc    Get all Retailers mapped under Trader
// @route   GET /api/auth/retailers
// @access  Private (Trader only)
const getTraderRetailers = async (req, res) => {
  const traderUserId = req.user._id;
  try {
    const retailers = await RetailerProfile.find({ mappedTraderId: traderUserId })
      .populate('userId', 'email phone status onboardingComplete');
    res.json({ status: 'success', data: retailers });
  } catch (error) {
    console.error('Get Trader Retailers Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve retailer list' });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  completeOnboarding,
  getMe,
  getTraderRetailers,
};
