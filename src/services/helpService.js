import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

const helpService = {
  // Get FAQ data
  getFAQs: async (category = 'all', search = '') => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/help/faqs', {
        params: { category, search }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get FAQ categories
  getCategories: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/help/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit contact form
  submitContactForm: async (formData) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/help/contact', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get help articles
  getArticles: async (category = 'all', search = '') => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/help/articles', {
        params: { category, search }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get help article by ID
  getArticle: async (id) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/help/articles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Rate help article
  rateArticle: async (id, rating) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(`/help/articles/${id}/rate`, { rating });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search help content
  searchHelp: async (query) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/help/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get support status
  getSupportStatus: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/help/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/help/feedback', feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default helpService;
