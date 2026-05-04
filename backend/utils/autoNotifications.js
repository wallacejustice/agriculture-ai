const Notification = require('../models/Notification');

// ✅ Generate Welcome Notification on Registration
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

    await Notification.create({
      userId: userId,
      message: notificationText,
      type: 'success',
      read: false,
      createdAt: new Date()
    });

    console.log(`✅ Welcome notification created for user ${userName}`);
  } catch (error) {
    console.error('❌ Failed to create welcome notification:', error.message);
  }
}

// ✅ Generate Daily Summary Notification
async function generateDailySummary(userId, stats) {
  try {
    const notificationText = `
      🌾 Daily Summary for ${new Date().toLocaleDateString()}
      
      ✓ You asked ${stats.questions} questions today
      ✓ Your farmers' success rate: ${stats.successRate}%
      ✓ Keep learning more! 🚜
    `;

    await Notification.create({
      userId: userId,
      message: notificationText,
      type: 'success',
      read: false,
      createdAt: new Date()
    });

    console.log(`✅ Daily summary notification created for user ${userId}`);
  } catch (error) {
    console.error('❌ Failed to create daily summary:', error.message);
  }
}

module.exports = {
  generateWelcomeNotification,
  generateDailySummary
};