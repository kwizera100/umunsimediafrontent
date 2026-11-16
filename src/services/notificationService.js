import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

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

const notificationService = {
  // Get notifications for the current user
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/notifications', {
        params: { page, limit, unreadOnly }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error.response?.data || error.message;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error.response?.data || error.message;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default notificationService;
