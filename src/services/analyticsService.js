import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Authentication expired, please log in again');
    }
    return Promise.reject(error);
  }
);

class AnalyticsService {
  // Get detailed post analytics for a specific user
  async getPostAnalytics(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/posts/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch post analytics' };
    }
  }

  // Get detailed article analytics for a specific user
  async getArticleAnalytics(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/articles/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch article analytics' };
    }
  }

  // Get comprehensive user analytics
  async getUserAnalytics(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/user/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user analytics' };
    }
  }

  // Get real-time engagement metrics for posts
  async getPostEngagementMetrics(postId) {
    try {
      const response = await api.get(`/analytics/posts/${postId}/engagement`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch post engagement metrics' };
    }
  }

  // Get real-time engagement metrics for articles
  async getArticleEngagementMetrics(articleId) {
    try {
      const response = await api.get(`/analytics/articles/${articleId}/engagement`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch article engagement metrics' };
    }
  }

  // Get trending content for a user
  async getTrendingContent(userId, contentType = 'all', limit = 10) {
    try {
      const response = await api.get(`/analytics/trending/${userId}?type=${contentType}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch trending content' };
    }
  }

  // Get engagement trends over time
  async getEngagementTrends(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/trends/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch engagement trends' };
    }
  }

  // Get audience insights
  async getAudienceInsights(userId) {
    try {
      const response = await api.get(`/analytics/audience/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch audience insights' };
    }
  }

  // Get content performance comparison
  async getContentPerformanceComparison(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/performance/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch content performance comparison' };
    }
  }

  // Get detailed post analytics with views, likes, comments, shares
  async getDetailedPostAnalytics(postId) {
    try {
      const response = await api.get(`/analytics/posts/${postId}/detailed`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch detailed post analytics' };
    }
  }

  // Get detailed article analytics with views, likes, comments, shares
  async getDetailedArticleAnalytics(articleId) {
    try {
      const response = await api.get(`/analytics/articles/${articleId}/detailed`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch detailed article analytics' };
    }
  }

  // Get content creation insights
  async getContentCreationInsights(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/creation/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch content creation insights' };
    }
  }

  // Get engagement rate analysis
  async getEngagementRateAnalysis(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/engagement-rate/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch engagement rate analysis' };
    }
  }

  // Get best performing content
  async getBestPerformingContent(userId, contentType = 'all', limit = 5) {
    try {
      const response = await api.get(`/analytics/best-performing/${userId}?type=${contentType}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch best performing content' };
    }
  }

  // Get content calendar insights
  async getContentCalendarInsights(userId, timeframe = '30d') {
    try {
      const response = await api.get(`/analytics/calendar/${userId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch content calendar insights' };
    }
  }

  // Get real-time metrics (for live updates)
  async getRealTimeMetrics(userId) {
    try {
      const response = await api.get(`/analytics/realtime/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch real-time metrics' };
    }
  }
}

export default new AnalyticsService();
