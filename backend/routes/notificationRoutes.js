const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

/**
 * @desc    Get user's notifications
 * @route   GET /api/user/notifications
 * @access  Private
 */
router.get('/notifications', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    const notifications = await Notification.find({ 
      userId: userId
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    // Format time ago helper
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " year ago";
      
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " months ago";
      
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " days ago";
      
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " hours ago";
      
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutes ago";
      
      return Math.floor(seconds) + " seconds ago";
    };
    
    res.json({
      success: true,
      notifications: notifications.map(notif => ({
        id: notif._id,
        title: notif.title || 'Notification',
        message: notif.message,
        type: notif.type || 'info',
        read: notif.read,
        time: formatTimeAgo(notif.createdAt),
        createdAt: notif.createdAt
      }))
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/user/notifications/:id/read
 * @access  Private
 */
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/user/notifications/count
 * @access  Private
 */
router.get('/notifications/count', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const count = await Notification.countDocuments({ 
      userId: userId,
      read: false
    });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Count notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification count'
    });
  }
});

module.exports = router;