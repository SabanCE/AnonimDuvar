import axios from 'axios';

// Get or generate an anonymous author token for this browser
const getAuthorToken = () => {
  let token = localStorage.getItem('anonim_author_token');
  if (!token) {
    token = 'author-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
    localStorage.setItem('anonim_author_token', token);
  }
  return token;
};

// Use VITE_API_URL in production (e.g. Render), fallback to local /api proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Attach author token to all outgoing requests
api.interceptors.request.use((config) => {
  config.headers['x-author-token'] = getAuthorToken();
  return config;
});

// Posts API endpoints
export const postsApi = {
  // GET /api/posts (200 OK)
  async getPosts() {
    try {
      const response = await api.get('/posts');
      return {
        success: true,
        status: response.status,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Notlar yüklenirken bir sorun oluştu.'
      };
    }
  },

  // POST /api/posts (201 Created | 400 Bad Request | 429 Too Many Requests)
  async createPost(content, color, posX, posY, rotation) {
    try {
      const response = await api.post('/posts', { content, color, posX, posY, rotation });
      return {
        success: true,
        status: response.status,
        message: response.data.message || 'Notunuz başarıyla duvara yapıştırıldı!',
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Not eklenirken beklenmeyen bir hata oluştu.'
      };
    }
  },

  // DELETE /api/posts/:id (200 OK | 403 Forbidden | 404 Not Found)
  async deletePost(id) {
    try {
      const response = await api.delete(`/posts/${id}`);
      return {
        success: true,
        status: response.status,
        message: response.data.message || 'Not silindi.'
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Not silinirken hata oluştu.'
      };
    }
  },

  // POST /api/posts/:id/like (200 OK | 400 | 404 | 429)
  async likePost(id) {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return {
        success: true,
        status: response.status,
        message: response.data.message || 'Beğenildi!',
        likes: response.data.likes,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Beğeni eklenirken hata oluştu.'
      };
    }
  },

  // GET /api/health
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: null
      };
    }
  }
};

export default api;
