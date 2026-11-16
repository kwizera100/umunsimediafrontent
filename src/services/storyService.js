import axios from 'axios';
import socketService from './socketService';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const storyService = {
  // Create a new story
  async createStory(formData) {
    try {
      console.log('Sending story data:', formData);
      
      // Check if formData is actually FormData
      if (!(formData instanceof FormData)) {
        console.error('Data is not FormData instance:', formData);
        throw new Error('Invalid data format');
      }
      
      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.post('/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        socketService.emitStoryCreated(response.data.story);
      }

      return response.data;
    } catch (error) {
      console.error('Create story error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication expired, please log in again');
      }
      
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create story');
    }
  },

  // Get all stories
  async getAllStories() {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await api.get('/stories');
      return response.data;
    } catch (error) {
      console.error('Get stories error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('User not found');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch stories');
    }
  },

  // Get story by ID
  async getStoryById(id) {
    try {
      const response = await api.get(`/stories/${id}/view`);
      return response.data;
    } catch (error) {
      console.error('Get story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch story');
    }
  },

  // Update story
  async updateStory(id, storyData) {
    try {
      const formData = new FormData();
      
      if (storyData.content) {
        formData.append('content', storyData.content);
      }
      
      if (storyData.image) {
        formData.append('story', storyData.image);
      }

      const response = await api.put(`/stories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Update story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update story');
    }
  },

  // Delete story
  async deleteStory(id) {
    try {
      console.log('Attempting to delete story with ID:', id); // Debug log
      if (!id) {
        throw new Error('Story ID is required');
      }
      const response = await api.delete(`/stories/${id}`);
      
      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        socketService.emitStoryDeleted({ storyId: id });
      }
      
      return response.data;
    } catch (error) {
      console.error('Delete story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete story');
    }
  },

  // Like/Unlike story
  async toggleStoryLike(id) {
    try {
      const response = await api.post(`/stories/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Toggle story like error:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle story like');
    }
  },

  // Like story (separated method for better UX)
  async likeStory(id) {
    try {
      console.log('Attempting to like story with ID:', id); // Debug log
      if (!id) {
        throw new Error('Story ID is required');
      }
      const response = await api.post(`/stories/${id}/like`);
      
      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        socketService.emitStoryLiked({ storyId: id, liked: true });
      }
      
      return response.data;
    } catch (error) {
      console.error('Like story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to like story');
    }
  },

  // Unlike story (separated method for better UX)
  async unlikeStory(id) {
    try {
      console.log('Attempting to unlike story with ID:', id); // Debug log
      if (!id) {
        throw new Error('Story ID is required');
      }
      const response = await api.post(`/stories/${id}/like`);
      
      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        socketService.emitStoryLiked({ storyId: id, liked: false });
      }
      
      return response.data;
    } catch (error) {
      console.error('Unlike story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to unlike story');
    }
  },

  // Send story reply (via direct message)
  async sendStoryReply(userId, messageData) {
    try {
      const response = await api.post(`/messages`, {
        receiverId: userId,
        content: messageData.message,
        storyReply: true,
        storyId: messageData.storyId
      });
      return response.data;
    } catch (error) {
      console.error('Send story reply error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reply');
    }
  },

  // Get story likes
  async getStoryLikes(id) {
    try {
      const response = await api.get(`/stories/${id}/likes`);
      return response.data;
    } catch (error) {
      console.error('Get story likes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get story likes');
    }
  },
};

export default storyService;