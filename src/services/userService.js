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

const userService = {
  // Search users
  searchUsers: async (query, page = 1, limit = 10) => {
    const cleaned = (query || '').trim().replace(/^@+/, '').replace(/\s+/g, ' ');
    const words = cleaned.toLowerCase().split(' ').filter(Boolean);
    const empty = { success: true, data: { users: [] }, users: [] };
    if (cleaned.length < 2) return empty;
    try {
      const axiosInstance = createAxiosInstance();
      // Backend matches one field at a time, so search by the longest word
      // and filter by the full name client-side for multi-word queries.
      const term = words.length > 1 ? [...words].sort((a, b) => b.length - a.length)[0] : cleaned;
      const response = await axiosInstance.get(
        `/users?q=${encodeURIComponent(term)}&page=${page}&limit=${words.length > 1 ? Math.max(limit, 50) : limit}`
      );
      const data = response.data;
      if (words.length > 1) {
        const list = data?.data?.users || data?.users || [];
        const filtered = list
          .filter((u) => {
            const hay = `${u.firstName || ''} ${u.lastName || ''} ${u.username || ''}`.toLowerCase();
            return words.every((w) => hay.includes(w));
          })
          .slice(0, limit);
        return { ...data, data: { ...(data?.data || {}), users: filtered }, users: filtered };
      }
      return data;
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 404) return empty;
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/me', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get profile statistics
  getProfileStatistics: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/profile/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile statistics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get suggested friends
  getSuggestedFriends: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/suggested-friends');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch suggested friends:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update last seen timestamp
  updateLastSeen: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/last-seen');
      return response.data;
    } catch (error) {
      console.error('Failed to update last seen:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get all users for dropdown (admin only)
  getAllUsersForDropdown: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/admin/users/dropdown');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Resubmit student verification documents
  resubmitStudentVerification: async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const response = await axiosInstance.put('/users/me/student-verification', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService; 