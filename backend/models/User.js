// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Stores farmer accounts with multilingual preferences and agriculture profile
 */
const userSchema = new mongoose.Schema({
  // Basic authentication fields
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Never return password by default
  },

  // Language preferences for multilingual support
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: {
      values: ['en', 'pcm', 'gpe', 'wes', 'tw', 'yo', 'ha', 'ig', 'sw', 'am', 'zu'],
      message: '{VALUE} is not a supported language'
    },
    description: 'User\'s preferred language (en=English, pcm=Nigerian Pidgin, gpe=Ghanaian Pidgin, wes=Cameroonian Pidgin, tw=Twi, yo=Yoruba, ha=Hausa, ig=Igbo, sw=Swahili, am=Amharic, zu=Zulu)'
  },
  pidginVariant: {
    type: String,
    default: 'nigerian',
    enum: ['nigerian', 'ghanaian', 'cameroonian'],
    description: 'Specific Pidgin variant if preferredLanguage is pcm/gpe/wes'
  },

  // Voice settings for text-to-speech
  voiceSettings: {
    voiceType: {
      type: String,
      default: 'female',
      enum: ['male', 'female']
    },
    speakingRate: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
      description: 'Speech rate (0.5=slow, 1.0=normal, 2.0=fast)'
    }
  },

  // Agriculture profile
  region: {
    type: String,
    trim: true,
    description: 'Farmer\'s location (e.g., "Ashanti Region, Ghana")'
  },
  primaryCrops: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  farmingExperience: {
    type: Number,
    min: 0,
    description: 'Years of farming experience'
  },

  // Notification preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },

  // ✅ PASSWORD RESET FIELDS (NEW)
  resetPasswordToken: {
    type: String,
    select: false // Never return in queries by default
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true, // ✅ Automatically creates createdAt & updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ preferredLanguage: 1 });
userSchema.index({ region: 1 });
// ✅ Index for password reset token lookup (optional but recommended)
userSchema.index({ resetPasswordToken: 1 });

// Hash password before saving (Modern async pattern)
userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken; // ✅ Also exclude reset token
  delete user.resetPasswordExpire;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);