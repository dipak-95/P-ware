const express = require('express');
const { register, login, googleLogin, completeOnboarding, getMe, getTraderRetailers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);           // NEW: email+password registration
router.post('/login', login);                 // NEW: email/phone+password login
router.post('/google-login', googleLogin);    // existing: admin mock + real Google OAuth
router.post('/onboarding', protect, completeOnboarding);
router.get('/me', protect, getMe);
router.get('/retailers', protect, getTraderRetailers);

module.exports = router;
