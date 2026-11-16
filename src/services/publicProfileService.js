const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

class PublicProfileService {
  // Get user by username
  async getUserByUsername(username) {
    try {
      const response = await fetch(`${API_URL}/public/user/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get user stats
  async getUserStats(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Get user posts
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/posts?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }

  // Get user reposts
  async getUserReposts(userId, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/reposts?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user reposts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user reposts:', error);
      throw error;
    }
  }

  // Get user articles
  async getUserArticles(userId, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/articles?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user articles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user articles:', error);
      throw error;
    }
  }

  // Get user friends
  async getUserFriends(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/friends`);
      if (!response.ok) {
        throw new Error('Failed to fetch user friends');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user friends:', error);
      throw error;
    }
  }

  // Get mutual friends
  async getMutualFriends(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/mutual-friends`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch mutual friends');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching mutual friends:', error);
      throw error;
    }
  }

  // Check following status
  async checkFollowingStatus(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/following-status`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to check following status');
      }
      const data = await response.json();
      return data.isFollowing;
    } catch (error) {
      console.error('Error checking following status:', error);
      throw error;
    }
  }

  // Check friendship status
  async checkFriendshipStatus(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/friendship-status`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to check friendship status');
      }
      const data = await response.json();
      return data.isFriend;
    } catch (error) {
      console.error('Error checking friendship status:', error);
      throw error;
    }
  }

  // Follow user
  async followUser(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/follow`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to follow user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  // Unfollow user
  async unfollowUser(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/follow`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unfollow user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Send friend request
  async sendFriendRequest(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/friend-request`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send friend request');
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  // Remove friend
  async removeFriend(userId) {
    try {
      const response = await fetch(`${API_URL}/public/user/${userId}/friend`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove friend');
      }
      return await response.json();
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }
}

export default new PublicProfileService();
