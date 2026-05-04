const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  translatedContent: {
    type: String,
    trim: true,
    description: 'English translation for AI processing'
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'pcm', 'gpe', 'wes', 'tw', 'yo', 'ha', 'ig', 'sw', 'am', 'zu'],
    description: 'Language code of the message'
  },
  voiceUrl: {
    type: String,
    description: 'URL to audio recording of this message'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation',
    trim: true,
    maxlength: 100
  },
  messages: [messageSchema],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  agricultureContext: {
    cropType: {
      type: String,
      lowercase: true,
      trim: true,
      enum: ['maize', 'cassava', 'yam', 'rice', 'plantain', 'cocoa', 'coffee', 'groundnut', 'other']
    },
    region: {
      type: String,
      trim: true
    },
    season: {
      type: String,
      enum: ['rainy', 'dry', 'harvest', 'planting'],
      trim: true
    }
  },
  detectedLanguage: {
    type: String,
    enum: ['en', 'pcm', 'gpe', 'wes', 'tw', 'yo', 'ha', 'ig', 'sw', 'am', 'zu'],
    description: 'Primary language detected in conversation'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ tags: 1 });
conversationSchema.index({ 'agricultureContext.cropType': 1 });

module.exports = mongoose.model('Conversation', conversationSchema);