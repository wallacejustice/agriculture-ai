const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { 
    type: String,
    default: ''
  },
  message: { 
    type: String,
    required: true,
    maxlength: 500
  },
  type: { 
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  read: { 
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date,
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);