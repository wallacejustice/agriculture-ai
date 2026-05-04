const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getLanguageDistribution,
  getCropAnalytics,
  getEngagementTimeline
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware'); // ✅ FIXED: Changed 'auth' to 'authMiddleware'

// ✅ Apply protect middleware to ALL analytics routes
router.use(protect);

router.get('/dashboard-stats', getDashboardStats);
router.get('/language-distribution', getLanguageDistribution);
router.get('/crop-analytics', getCropAnalytics);
router.get('/engagement-timeline', getEngagementTimeline);

module.exports = router;