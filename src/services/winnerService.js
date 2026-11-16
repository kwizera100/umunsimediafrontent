import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

// Create axios instance with auth token
const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

const winnerService = {
  // Get all winner announcements
  getAllWinnerAnnouncements: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/rewards/winners');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current active winners (monthly and semester)
  getCurrentWinners: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/rewards/winners/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get winner announcement by ID
  getWinnerAnnouncementById: async (id) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/rewards/winners/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's winners
  getUserWinners: async (userId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/rewards/winners/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin functions (require authentication)
  createWinnerAnnouncement: async (announcementData) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/rewards/winners', announcementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateWinnerAnnouncement: async (id, announcementData) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put(`/rewards/winners/${id}`, announcementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteWinnerAnnouncement: async (id) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.delete(`/rewards/winners/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addWinner: async (announcementId, winnerData) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(`/rewards/winners/${announcementId}/add`, winnerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  removeWinner: async (winnerId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.delete(`/rewards/winners/remove/${winnerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  autoGenerateWinners: async (period, type = 'monthly', category) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/rewards/winners/auto-generate', { period, type, category });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default winnerService;

