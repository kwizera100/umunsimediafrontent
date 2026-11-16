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

const settingsService = {
  // Get user settings
  getSettings: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (privacySettings) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/settings/privacy', privacySettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (notificationSettings) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/settings/notifications', notificationSettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update appearance settings
  updateAppearanceSettings: async (appearanceSettings) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/settings/appearance', appearanceSettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update account settings
  updateAccountSettings: async (accountSettings) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/settings/account', accountSettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download user data
  downloadUserData: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/data-export', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Deactivate account
  deactivateAccount: async (reason) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/users/deactivate', { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.delete('/users/account', { 
        data: { password } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default settingsService;
