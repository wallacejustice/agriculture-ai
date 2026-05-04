const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// ✅ Generate Daily Summary Notification
async function generateDailySummary(userId, stats) {
  try {
    const notificationText = `
      🌾 Daily Summary for ${new Date().toLocaleDateString()}
      
      ✓ You asked ${stats.questions} questions today
      ✓ Your farmers' success rate: ${stats.successRate}
      ✓ Keep learning more! 🚜
    `;

    const notification = await Notification.create({
      userId: userId,
      message: notificationText,
      type: 'success', // or 'info'
      read: false,
      createdAt: new Date()
    });

    console.log(`✅ Daily notification created for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Failed to create daily notification:', error);
    return null;
  }
}

// ✅ Generate Registration Welcome Notification
async function generateWelcomeNotification(userId, userName) {
  try {
    const notificationText = `
      Welcome to AI for Agriculture, ${userName}! 👋
      
      Your account is ready! Start exploring:
      • Ask farming questions in any language
      • Get voice assistance for field problems
      • Track your conversation analytics
      
      Happy farming! 🌾
    `;

    const notification = await Notification.create({
      userId: userId,
      message: notificationText,
      type: 'success',
      read: false,
      createdAt: new Date()
    });

    console.log(`✅ Welcome notification sent to ${userName}`);
    return notification;
  } catch (error) {
    console.error('❌ Failed to create welcome notification:', error);
    return null;
  }
}

module.exports = { generateDailySummary, generateWelcomeNotification };