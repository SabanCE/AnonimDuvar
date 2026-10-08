import axios from 'axios';

// Vite proxy /api to backend in dev, or relative in production
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
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
