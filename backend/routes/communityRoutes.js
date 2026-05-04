const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createOrUpdateProfile,
  verifyAdvice,
  getNearbyFarmers,
  createSuccessStory,
  getSuccessStories,
  verifySuccessStory
} = require('../controllers/communityController');
const multer = require('multer');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

// Farmer profile routes
router.post('/profile', auth, createOrUpdateProfile);
router.get('/nearby-farmers', auth, getNearbyFarmers);

// Advice verification
router.post('/verify-advice', auth, verifyAdvice);

// Success stories
router.post('/success-stories', auth, upload.single('image'), createSuccessStory);
router.get('/success-stories', getSuccessStories);
router.post('/success-stories/:id/verify', auth, verifySuccessStory);

module.exports = router;