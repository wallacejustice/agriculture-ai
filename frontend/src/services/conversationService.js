import api from './api';

const conversationService = {
  getConversations: async () => {
    const response = await api.get('/api/conversations');
    return response.data;
  },

  getConversation: async (id) => {
    const response = await api.get(`/api/conversations/${id}`);
    return response.data;
  },

  createConversation: async () => {
    const response = await api.post('/api/conversations');
    return response.data;
  },

  addMessage: async (id, content, lang) => {
    const validLanguages = ['en', 'pcm', 'tw', 'yo', 'ha', 'ig', 'sw'];
    const safeLanguage = validLanguages.includes(lang) ? lang : 'en';
    
    const response = await api.post(`/api/conversations/${id}/messages`, { content, language: safeLanguage });
    return response.data;
  },

  deleteConversation: async (id) => {
    const response = await api.delete(`/api/conversations/${id}`);
    return response.data;
  }
};

export default conversationService;