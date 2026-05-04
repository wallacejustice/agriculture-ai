// backend/controllers/authController.js
const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

/**
 * Authentication Controller - FULLY UPGRADED WITH EMAIL SUPPORT
 */

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send token response with user data - ✅ FIXED SYNTAX
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  
  const publicUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    pidginVariant: user.pidginVariant,
    region: user.region,
    primaryCrops: user.primaryCrops,
    voiceSettings: user.voiceSettings,
    notificationPreferences: user.notificationPreferences,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    isActive: user.isActive
  };

  // ✅ FIXED: Added 'data:' key before the object
  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: { user: publicUser }
  });
};

// Helper: Create notification (doesn't fail main operation)
const createNotification = async (userId, message, type = 'info') => {
  try {
    await Notification.create({
      userId,
      message,
      type,
      read: false,
      createdAt: new Date()
    });
    console.log(`✅ Notification created for user ${userId}`);
  } catch (error) {
    console.error('❌ Failed to create notification:', error.message);
  }
};

// @desc    Register a new user WITH welcome notification
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, preferredLanguage, pidginVariant, region, primaryCrops } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      preferredLanguage: preferredLanguage || 'en',
      pidginVariant: pidginVariant || 'nigerian',
      region,
      primaryCrops: primaryCrops || [],
      voiceSettings: { voiceType: 'female', speakingRate: 1.0 }
    });

    // ✅ Create welcome notification
    const welcomeMessage = `Welcome to AI for Agriculture, ${user.name}! 👋\n\nYour account is ready! Start exploring farming questions.`;
    await createNotification(user._id, welcomeMessage, 'success');

    sendTokenResponse(user, 201, res, 'User registered successfully');

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// @desc    Forgot password - send reset link WITH REAL EMAIL
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user (don't reveal if email exists for security)
    const user = await User.findOne({ email });
    
    if (!user) {
      // Always return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent'
      });
    }

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // ✅ Hash token and save to user
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save({ validateBeforeSave: false });

    // ✅ Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // ✅ Email content
    const message = `
      You are receiving this email because you requested a password reset for your AI for Agriculture account.
      
      Please click the link below to reset your password:
      
      ${resetUrl}
      
      If you did not request this, please ignore this email.
      
      This link expires in 10 minutes.
    `;

    // ✅ Send email using nodemailer utility
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - AI for Agriculture',
      message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2e7d32; text-align: center;">🌾 AI for Agriculture</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2e7d32;">
            <h3 style="color: #1e293b; margin-top: 0;">Password Reset Request</h3>
            <p style="color: #64748b; line-height: 1.6;">
              You requested a password reset for your AI for Agriculture account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="
                background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
                color: white;
                padding: 12px 32px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                font-weight: 600;
                box-shadow: 0 4px 14px rgba(46, 125, 50, 0.3);
              ">
                Reset Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 0.9rem; text-align: center;">
              <small>This link expires in 10 minutes. If you didn't request this, please ignore this email.</small>
            </p>
          </div>
          <p style="color: #64748b; font-size: 0.85rem; text-align: center; margin-top: 20px;">
            © 2026 AI for Agriculture • Crafted by Wallace Justice in Accra 🇬🇭
          </p>
        </div>
      `
    });

    console.log(`🔐 Password reset email sent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    // ✅ Clear reset fields on error to prevent stale tokens
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const publicUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      pidginVariant: user.pidginVariant,
      region: user.region,
      primaryCrops: user.primaryCrops,
      voiceSettings: user.voiceSettings,
      notificationPreferences: user.notificationPreferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      isActive: user.isActive
    };
    // ✅ FIXED: Added 'data:' key
    res.status(200).json({ success: true, data: { user: publicUser } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  try {
    const { preferredLanguage, pidginVariant, voiceSettings, notificationPreferences } = req.body;
    const updateFields = {};
    
    if (preferredLanguage) updateFields.preferredLanguage = preferredLanguage;
    if (pidginVariant) updateFields.pidginVariant = pidginVariant;
    if (voiceSettings) updateFields.voiceSettings = voiceSettings;
    if (notificationPreferences) updateFields.notificationPreferences = notificationPreferences;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updateFields }, { new: true, runValidators: true });
    
    const publicUser = {
      _id: user._id, name: user.name, email: user.email,
      preferredLanguage: user.preferredLanguage, pidginVariant: user.pidginVariant,
      region: user.region, primaryCrops: user.primaryCrops,
      voiceSettings: user.voiceSettings, notificationPreferences: user.notificationPreferences,
      lastLogin: user.lastLogin, createdAt: user.createdAt, isActive: user.isActive
    };

    // ✅ FIXED: Added 'data:' key
    res.status(200).json({ success: true, message: 'Preferences updated', data: { user: publicUser } });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};

// @desc    Update agriculture profile
// @route   PUT /api/auth/profile/agriculture
// @access  Private
const updateAgricultureProfile = async (req, res) => {
  try {
    const { region, primaryCrops, farmingExperience } = req.body;
    const updateFields = {};
    
    if (region) updateFields.region = region;
    if (primaryCrops) updateFields.primaryCrops = primaryCrops;
    if (farmingExperience !== undefined) updateFields.farmingExperience = farmingExperience;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updateFields }, { new: true, runValidators: true });
    
    const publicUser = {
      _id: user._id, name: user.name, email: user.email,
      preferredLanguage: user.preferredLanguage, pidginVariant: user.pidginVariant,
      region: user.region, primaryCrops: user.primaryCrops,
      voiceSettings: user.voiceSettings, notificationPreferences: user.notificationPreferences,
      lastLogin: user.lastLogin, createdAt: user.createdAt, isActive: user.isActive
    };

    // ✅ FIXED: Added 'data:' key
    res.status(200).json({ success: true, message: 'Profile updated', data: { user: publicUser } });
  } catch (error) {
    console.error('Update agriculture profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserPreferences,
  updateAgricultureProfile,
  forgotPassword
};