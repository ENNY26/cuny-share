import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token if available
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or your token storage method
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
// Note: We don't redirect here to preserve navigation history
// Individual components should handle 401 errors appropriately
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data but don't redirect - let components handle it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't use window.location.href as it causes full page reload
      // Components should handle navigation using React Router
    }
    return Promise.reject(error);
  }
);

// Conversations API
export const getConversations = () => instance.get('/api/conversations');
export const createConversation = (data) => instance.post('/api/conversations', data);
export const getConversation = (id) => instance.get(`/api/conversations/${id}`);

// Messages API
export const getMessages = (userId, textbookId) => 
  instance.get(`/api/messages?userId=${userId}&textbookId=${textbookId}`);
export const sendMessage = (data) => instance.post('/api/messages', data);
export const markAsRead = (messageIds) => 
  instance.patch('/api/messages/read', { messageIds });

export default instance;