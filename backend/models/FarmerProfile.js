const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  region: { 
    type: String, 
    required: true,
    enum: ['Ashanti', 'Northern', 'Volta', 'Eastern', 'Western', 'Central', 'Greater Accra', 'Upper East', 'Upper West', 'North East', 'Savannah', 'Bono', 'Ahafo', 'Oti']
  },
  district: { type: String },
  crops: [{ 
    type: String,
    enum: ['maize', 'cassava', 'yam', 'rice', 'tomato', 'pepper', 'okra', 'plantain', 'cocoyam', 'other']
  }],
  experience: { 
    type: Number, 
    min: 0,
    max: 60,
    required: true
  },
  badges: [{
    type: String,
    enum: ['Maize Expert', 'Cassava Specialist', 'Pest Control Pro', 'Soil Health Guru', 'Seasonal Planner', 'Community Helper']
  }],
  verifiedAdvice: [{
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    messageId: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
  }],
  successStories: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SuccessStory' 
  }],
  locationSharing: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update timestamp
farmerProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);