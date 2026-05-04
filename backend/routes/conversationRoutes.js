// backend/routes/conversationRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createConversation,
  addMessage,
  getConversations,
  getConversationById,
  deleteConversation
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

// ✅ Apply auth middleware to ALL routes
router.use(protect);

// Route definitions - ✅ NOTE: ':conversationId' matches controller expectation
router.post('/', createConversation);                           // POST /api/conversations
router.get('/', getConversations);                              // GET /api/conversations
router.get('/:conversationId', getConversationById);            // ✅ GET /api/conversations/:conversationId
router.post('/:conversationId/messages', addMessage);           // POST /api/conversations/:conversationId/messages
router.delete('/:conversationId', deleteConversation);          // DELETE /api/conversations/:conversationId

module.exports = router;