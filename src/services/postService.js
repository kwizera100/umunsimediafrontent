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

class PostService {
  // Create a new post
  async createPost(postData) {
    try {
      const formData = new FormData();
      
      // Add text fields (only when present - avoids sending literal "undefined")
      if (postData.content && postData.content.trim()) {
        formData.append('content', postData.content.trim());
      }
      if (postData.location) {
        formData.append('location', postData.location);
      }
      if (postData.feeling) {
        formData.append('feeling', postData.feeling);
      }

      // Add multiple images if present
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image) => {
          formData.append('images', image);
        });
      } 
      // Single image - use the same 'images' field the backend expects
      else if (postData.image) {
        formData.append('images', postData.image);
      }
      
      // Handle video with correct field name
      if (postData.video) {
        formData.append('videos', postData.video);
      }
      
      // Handle multiple videos
      if (postData.videos && postData.videos.length > 0) {
        postData.videos.forEach((video) => {
          formData.append('videos', video);
        });
      }

      // Add tagged user IDs for mentions
      if (postData.taggedUserIds && postData.taggedUserIds.length > 0) {
        postData.taggedUserIds.forEach((userId) => {
          formData.append('taggedUserIds', userId);
        });
      }

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create post' };
    }
  }

  // Get all posts (feed)
  async getPosts(page = 1, limit = 10) {
    try {
      const response = await api.get(`/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch posts' };
    }
  }

  // Get posts by user ID
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user posts' };
    }
  }

  // Get a single post by ID
  async getPost(postId) {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch post' };
    }
  }

  // Like/unlike a post
  async toggleLike(postId) {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to toggle like' };
    }
  }

  // Add comment to a post
  async addComment(postId, content, parentId) {
    try {
      const body = { content };
      if (parentId) body.parentId = parentId;
      const response = await api.post(`/posts/${postId}/comments`, body);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add comment' };
    }
  }

  // Get comments for a post
  async getComments(postId, page = 1, limit = 10) {
    try {
      const response = await api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch comments' };
    }
  }

  // Delete a post
  async deletePost(postId) {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete post' };
    }
  }

  // Update a post
  async updatePost(postId, formData) {
    try {
      const response = await api.put(`/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update post' };
    }
  }

  // Share a post
  async sharePost(postId, message = '') {
    try {
      const response = await api.post(`/posts/${postId}/share`, { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to share post' };
    }
  }

  // Repost a post
  async repostPost(postId) {
    try {
      const response = await api.post(`/posts/${postId}/repost`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to repost' };
    }
  }

  // Quote repost a post
  async quoteRepost(postId, content) {
    try {
      const response = await api.post(`/posts/${postId}/quote-repost`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to quote repost' };
    }
  }

  // Toggle repost (like/unlike repost)
  async toggleRepost(postId) {
    try {
      const response = await api.post(`/posts/${postId}/repost`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to toggle repost' };
    }
  }

  // Save/Unsave a post
  async toggleSavePost(postId) {
    try {
      const response = await api.post(`/posts/${postId}/save`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save/unsave post' };
    }
  }

  // Get saved posts
  async getSavedPosts(skip = 0, limit = 10) {
    try {
      const response = await api.get('/posts/saved/all', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get saved posts' };
    }
  }

  // Report a post
  async reportPost(postId, reason) {
    try {
      const response = await api.post(`/posts/${postId}/report`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to report post' };
    }
  }
}

export default new PostService(); 