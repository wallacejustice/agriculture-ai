// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserPreferences,
  updateAgricultureProfile,
  forgotPassword  // ✅ NEW IMPORT
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);  // ✅ NEW ROUTE

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/preferences', protect, updateUserPreferences);
router.put('/profile/agriculture', protect, updateAgricultureProfile);

module.exports = router;