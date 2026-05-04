const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

// Protect routes - Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  let token;

  try {
    // 1. Get token from Authorization header (Bearer scheme)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.'
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 5. Check if user is still active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    // 6. Attach user to request object
    req.user = user;
    req.userId = decoded.userId; // ✅ ADD THIS FOR CONSISTENCY
    next();

  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }

    // Handle MongoDB errors
    if (error.codeName === 'NoSuchKey' || error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Database error occurred.'
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
};

// Optional: Restrict access to specific roles (future use)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Helper: Get unread notification count (for dashboard badge)
const getUnreadNotificationCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: userId,
      read: false 
    });
    return count;
  } catch (error) {
    console.error('Notification count error:', error);
    return 0;
  }
};

module.exports = { 
  protect, 
  restrictTo, 
  getUnreadNotificationCount 
};