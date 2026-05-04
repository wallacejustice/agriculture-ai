import axios from 'axios';

// ✅ FIXED: Default to localhost for local development
// When deployed to Vercel, set REACT_APP_API_URL in Vercel dashboard to production URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    
    if (!error.response) {
      return Promise.reject({ message: 'Network error. Please check your internet connection.' });
    }

    if (error.response.status === 401) {
      console.warn('⚠️ 401 Unauthorized on:', error.config?.url);
    }

    const message = error.response.data?.message || 
                    error.response.data?.error ||
                    error.response.statusText || 
                    'An error occurred';

    return Promise.reject({ message, status: error.response.status });
  }
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    return res.data;
  },
};

export const logout = () => {
  console.log('🚪 User logged out - clearing storage');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default api;