const Conversation = require('../models/Conversation');

exports.getDashboardStats = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      // ✅ FIX: Error responses MUST include "data" wrapper (frontend expects it)
      return res.status(401).json({ 
        success: false, 
        data: { message: 'Authentication required' }  // ← ADDED "data" wrapper
      });
    }

    const userId = req.user._id;
    
    const conversations = await Conversation.find({
      userId,
      isActive: true
    }).select('messages');
    
    let totalQuestions = 0;
    conversations.forEach(conv => {
      if (Array.isArray(conv.messages)) {
        totalQuestions += conv.messages.filter(msg => msg.role === 'user').length;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        conversations: conversations.length,
        questions: totalQuestions,
        voiceUsage: '30%',
        successRate: '95%'
      }
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    // ✅ FIX: Error responses MUST include "data" wrapper
    res.status(500).json({
      success: false,
      data: { message: 'Analytics service unavailable' }  // ← ADDED "data" wrapper
    });
  }
};

exports.getLanguageDistribution = (req, res) => 
  res.status(200).json({ 
    success: true, 
    data: { 
      distribution: [
        { language: 'English', code: 'en', count: 45, percentage: 45 },
        { language: 'Pidgin', code: 'pcm', count: 35, percentage: 35 },
        { language: 'Twi', code: 'tw', count: 15, percentage: 15 },
        { language: 'Yoruba', code: 'yo', count: 5, percentage: 5 }
      ] 
    } 
  });

exports.getCropAnalytics = (req, res) => 
  res.status(200).json({ 
    success: true, 
    data: { 
      analytics: [
        { crop: 'Maize', count: 24, percentage: 48 },
        { crop: 'Cassava', count: 15, percentage: 30 },
        { crop: 'Yam', count: 8, percentage: 16 },
        { crop: 'Rice', count: 3, percentage: 6 }
      ] 
    } 
  });

exports.getEngagementTimeline = (req, res) => {
  const timeline = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    timeline.push({ 
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      questions: Math.floor(Math.random() * 15) 
    });
  }
  res.status(200).json({ success: true, data: { timeline } });
};