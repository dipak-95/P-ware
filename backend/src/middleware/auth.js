const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Verify token middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
      }

      req.user = await User.findById(decoded.id).select('-googleId');
      
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ status: 'error', message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Not authorized, no token provided' });
  }
};

// Check if user status is approved
const isApproved = (req, res, next) => {
  if (req.user && req.user.status === 'approved') {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: `Access denied. Your account is current status is: ${req.user ? req.user.status : 'unknown'}. Please wait for admin approval.`,
    });
  }
};

// Require specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not have permissions for this resource.',
      });
    }
  };
};

module.exports = {
  protect,
  isApproved,
  requireRole,
};
