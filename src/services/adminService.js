import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

// Create axios instance with authentication
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
});

// Add auth header to all requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API methods
export const adminService = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await adminApi.get('/stats');
    return response.data;
  },

  // User management
  getAllUsers: async (params = {}) => {
    const response = await adminApi.get('/users', { params });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await adminApi.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  resendVerificationEmail: async (userId) => {
    const response = await adminApi.post(`/users/${userId}/resend-verification`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await adminApi.delete(`/users/${userId}`);
    return response.data;
  },

  // Chat management
  getAllChats: async (params = {}) => {
    const response = await adminApi.get('/chats', { params });
    return response.data;
  },

  getChatStats: async () => {
    const response = await adminApi.get('/chats/stats');
    return response.data;
  },

  // Analytics
  getAnalytics: async (params = {}) => {
    const response = await adminApi.get('/analytics', { params });
    return response.data;
  },

  getUserGrowthData: async (params = {}) => {
    const response = await adminApi.get('/analytics/user-growth', { params });
    return response.data;
  },

  // Club management
  getAllClubs: async (params = {}) => {
    const response = await adminApi.get('/clubs', { params });
    return response.data;
  },

  toggleClubStatus: async (clubId) => {
    const response = await adminApi.put(`/clubs/${clubId}/toggle-status`);
    return response.data;
  },

  // Article management
  getAllArticles: async (params = {}) => {
    const response = await adminApi.get('/articles', { params });
    return response.data;
  },

  deleteArticle: async (articleId) => {
    const response = await adminApi.delete(`/articles/${articleId}`);
    return response.data;
  },

  // Subscription and payment management
  getSubscribers: async (params = {}) => {
    const response = await adminApi.get('/subscribers', { params });
    return response.data;
  },

  getBoostUsers: async (params = {}) => {
    const response = await adminApi.get('/boost-users', { params });
    return response.data;
  },

  // Post management
  getAllPosts: async (params = {}) => {
    const response = await adminApi.get('/posts', { params });
    return response.data;
  },

  getPostDetails: async (postId) => {
    const response = await adminApi.get(`/posts/${postId}/details`);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await adminApi.delete(`/posts/${postId}`);
    return response.data;
  },

  // Activity logs
  getRecentActivity: async (params = {}) => {
    const response = await adminApi.get('/activity', { params });
    return response.data;
  },

  // Analytics
  getAnalytics: async (timeframe = '30d') => {
    const response = await adminApi.get('/analytics', { params: { timeframe } });
    return response.data;
  },

  // Student verification
  getStudentVerifications: async () => {
    const response = await adminApi.get('/students/verifications');
    return response.data;
  },

  approveStudentVerification: async (studentId) => {
    const response = await adminApi.put(`/students/${studentId}/approve`);
    return response.data;
  },

  rejectStudentVerification: async (studentId, reason) => {
    const response = await adminApi.put(`/students/${studentId}/reject`, { reason });
    return response.data;
  },

  // Utility to promote user to admin (for development)
  promoteToAdmin: async (email) => {
    const userApi = axios.create({
      baseURL: `${API_BASE_URL}/users`,
    });
    const response = await userApi.post('/promote-admin', { email });
    return response.data;
  },

  // Article Categories
  initializeCategories: async () => {
    // Use rewards endpoint for categories
    const response = await axios.post(
      `${API_BASE_URL}/rewards/categories/initialize`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  getAllCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/rewards/categories`);
    return response.data;
  },

  // PWA installations
  getInstallations: async () => {
    const response = await adminApi.get('/installations');
    return response.data;
  },

  // Email all registered users
  emailAllUsers: async (subject, message) => {
    const response = await adminApi.post('/email-all', { subject, message });
    return response.data;
  },
};

export default adminService;