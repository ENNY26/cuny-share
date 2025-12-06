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
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
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