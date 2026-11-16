import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://umuhuza.store/api';

const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
};

const unwrap = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return data;
};

const publicProfileService = {
  getUserByUsername: async (username) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${encodeURIComponent(username)}`);
    return res.data;
  },

  getUserStats: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${userId}/stats`);
    return res.data;
  },

  getUserPosts: async (userId, page = 1, limit = 12) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${userId}/posts?page=${page}&limit=${limit}`);
    return unwrap(res.data);
  },

  getUserReposts: async (userId, page = 1, limit = 12) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${userId}/reposts?page=${page}&limit=${limit}`);
    return unwrap(res.data);
  },

  getUserArticles: async (userId, page = 1, limit = 12) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${userId}/articles?page=${page}&limit=${limit}`);
    return unwrap(res.data);
  },

  getUserFriends: async (userId, page = 1, limit = 30) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${userId}/friends?page=${page}&limit=${limit}`);
    return unwrap(res.data);
  },

  getUserRewards: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.get(`/rewards/rewards/user/${userId}`);
    return unwrap(res.data);
  },

  getUserBadges: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.get(`/rewards/badges/user/${userId}`);
    return unwrap(res.data);
  },

  getPaymentHistory: async () => {
    const api = createAxiosInstance();
    const res = await api.get(`/payments/history`);
    return unwrap(res.data);
  },

  sendFriendRequest: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.post(`/public/user/${userId}/friend-request`);
    return res.data;
  },

  followUser: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.post(`/public/user/${userId}/follow`);
    return res.data;
  },

  unfollowUser: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.delete(`/public/user/${userId}/follow`);
    return res.data;
  },

  checkFriendshipStatus: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${userId}/friendship-status`);
    return res.data;
  },

  checkFollowingStatus: async (userId) => {
    const api = createAxiosInstance();
    const res = await api.get(`/public/user/${userId}/following-status`);
    return res.data;
  }
};

export default publicProfileService;
