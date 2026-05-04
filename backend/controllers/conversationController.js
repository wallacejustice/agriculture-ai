const Conversation = require('../models/Conversation');
const aiService = require('../services/aiService');

const addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, language = 'en' } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, data: { message: 'Message required' } });
    }

    if (!conversationId || conversationId === 'undefined') {
      return res.status(400).json({ success: false, data: { message: 'Invalid conversation ID' } });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ success: false, data: { message: 'Conversation not found' } });
    }

    // ✅ ADD USER MESSAGE
    conversation.messages.push({
      role: 'user',
      content: content.trim(),
      language: language,
      timestamp: new Date()
    });

    // ✅ GET LAST 3 USER MESSAGES FOR MEMORY (critical for "I'm back" detection)
    const lastMessages = conversation.messages
      .filter(msg => msg.role === 'user') // Only user messages (not AI responses)
      .slice(-3); // Last 3 messages

    // ✅ PASS MEMORY CONTEXT TO AI (cropType + lastMessages)
    const aiResponse = aiService.generateAgricultureResponse(
      content.trim(), 
      language,
      {
        cropType: conversation.agricultureContext?.cropType || 'maize',
        lastMessages: lastMessages // ✅ MEMORY ENABLED
      }
    );

    // ✅ ADD AI RESPONSE
    conversation.messages.push({
      role: 'ai',
      content: aiResponse,
      language: language,
      timestamp: new Date()
    });

    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversation: {
          _id: conversation._id,
          messages: conversation.messages.slice(-2)
        }
      }
    });

  } catch (error) {
    console.error('Message error:', error.message);
    res.status(500).json({ 
      success: false, 
      data: { message: 'Failed to send message' } 
    });
  }
};

const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      userId: req.user._id,
      title: 'New Chat',
      messages: [],
      agricultureContext: {
        cropType: 'maize',
        region: req.user.region || 'Ashanti',
        farmingExperience: 'beginner'
      },
      isActive: true
    });
    
    res.status(201).json({ 
      success: true, 
      data: { conversation } 
    });
  } catch (error) {
    console.error('Create error:', error.message);
    res.status(500).json({ 
      success: false, 
      data: { message: 'Failed to create conversation' } 
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user._id,
      isActive: true
    }).sort({ updatedAt: -1 });

    console.log(`✅ User ${req.user._id} has ${conversations.length} conversations`);
    
    res.status(200).json({ 
      success: true, 
      data: { conversations } 
    });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    res.status(500).json({ 
      success: false, 
      data: { message: 'Failed to load conversations' } 
    });
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: req.user._id,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        data: { message: 'Conversation not found' } 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { conversation } 
    });
  } catch (error) {
    console.error('Get conversation error:', error.message);
    res.status(500).json({ 
      success: false, 
      data: { message: 'Failed to load conversation' } 
    });
  }
};

const deleteConversation = async (req, res) => {
  try {
    await Conversation.updateOne(
      { _id: req.params.conversationId, userId: req.user._id },
      { isActive: false }
    );
    
    res.status(200).json({ 
      success: true, 
      data: { message: 'Conversation deleted successfully' } 
    });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ 
      success: false, 
      data: { message: 'Failed to delete conversation' } 
    });
  }
};

module.exports = {
  createConversation,
  addMessage,
  getConversations,
  getConversationById,
  deleteConversation
};