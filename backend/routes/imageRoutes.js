const express = require('express');
const multer = require('multer');
const imageService = require('../services/imageService');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (no disk writes)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// ✅ ANALYZE CROP IMAGE (protected route)
router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image provided' 
      });
    }

    // Analyze image with AI
    const analysis = await imageService.analyzeCropImage(req.file.buffer, req.body.language || 'en');
    
    res.status(200).json({
      success: true,
      data: {
        diagnosis: analysis.diagnosis,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence || 'high'
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze image. Please try again or describe your problem in words.' 
    });
  }
});

module.exports = router;