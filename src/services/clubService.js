const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

class ClubService {
  constructor() {
    this.baseURL = `${API_URL}/clubs`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Make authenticated request
  async makeRequest(url, options = {}) {
    const token = this.getAuthToken();
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Create a new club
  async createClub(clubData) {
    const formData = new FormData();
    formData.append('name', clubData.name);
    formData.append('description', clubData.description);
    formData.append('category', clubData.category);
    formData.append('isPrivate', String(clubData.isPrivate || false));
    
    if (clubData.image) {
      formData.append('image', clubData.image);
    }

    const token = this.getAuthToken();
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create club');
    }

    return data;
  }

  // Get all clubs with optional filtering
  async getAllClubs(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const url = `${this.baseURL}?${params.toString()}`;
    return this.makeRequest(url);
  }

  // Get user's clubs
  async getUserClubs(page = 1, limit = 10) {
    const url = `${this.baseURL}/user?page=${page}&limit=${limit}`;
    return this.makeRequest(url);
  }

  // Get club by ID
  async getClubById(id) {
    const url = `${this.baseURL}/${id}`;
    return this.makeRequest(url);
  }

  // Join a club
  async joinClub(id, message = '') {
    const url = `${this.baseURL}/${id}/join`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Leave a club
  async leaveClub(id) {
    const url = `${this.baseURL}/${id}/leave`;
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  // Create a club post
  async createClubPost(clubId, postData) {
    const formData = new FormData();
    formData.append('content', postData.content);
    
    if (postData.image) {
      formData.append('image', postData.image);
    }

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}/${clubId}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create post');
    }

    return data;
  }

  // Get club posts
  async getClubPosts(clubId, page = 1, limit = 10) {
    const url = `${this.baseURL}/${clubId}/posts?page=${page}&limit=${limit}`;
    return this.makeRequest(url);
  }

  // Like/unlike a club post
  async togglePostLike(clubId, postId) {
    const url = `${this.baseURL}/${clubId}/posts/${postId}/like`;
    return this.makeRequest(url, {
      method: 'POST',
    });
  }

  // Get post comments
  async getPostComments(clubId, postId, page = 1, limit = 10) {
    const url = `${this.baseURL}/${clubId}/posts/${postId}/comments?page=${page}&limit=${limit}`;
    return this.makeRequest(url);
  }

  // Add comment to post
  async addPostComment(clubId, postId, content) {
    const url = `${this.baseURL}/${clubId}/posts/${postId}/comments`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Delete comment
  async deleteComment(clubId, postId, commentId) {
    const url = `${this.baseURL}/${clubId}/posts/${postId}/comments/${commentId}`;
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  // Get club categories
  getClubCategories() {
    return [
      { value: 'MEDIA', label: 'Media Clubs', emoji: '📺' },
      { value: 'CULTURAL', label: 'Cultural', emoji: '🎭' },
      { value: 'ACADEMIC', label: 'Academic', emoji: '📚' },
      { value: 'DEBATE', label: 'Debate', emoji: '💬' },
      { value: 'NGOS', label: 'NGOs', emoji: '🤝' },
      { value: 'COMMUNITY_SERVICE', label: 'Community Service', emoji: '❤️' },
      { value: 'COUNTRY', label: 'Country', emoji: '🌍' },
      { value: 'FRATERNITIES_SORORITIES', label: 'Fraternities and Sororities', emoji: '🏛️' },
      { value: 'PROFESSIONAL', label: 'Professional', emoji: '💼' },
      { value: 'ASSOCIATION', label: 'Association', emoji: '🔗' },
      { value: 'ARTS', label: 'Arts', emoji: '🎨' },
      { value: 'FILM', label: 'Film', emoji: '🎬' },
      { value: 'FRATERNAL', label: 'Fraternal', emoji: '🤝' },
      { value: 'RELIGIOUS', label: 'Religious', emoji: '⛪' },
      { value: 'SPIRITUAL_ORGANIZATIONS', label: 'Spiritual Organizations', emoji: '🕊️' }
    ];
  }

  // Get club members
  async getClubMembers(clubId, page = 1, limit = 20) {
    try {
      const response = await this.makeRequest(`${this.baseURL}/${clubId}/members?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get club join requests (for owners/admins only)
  async getClubJoinRequests(clubId, page = 1, limit = 20) {
    try {
      const response = await this.makeRequest(`${this.baseURL}/${clubId}/join-requests?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Handle join request (approve/reject)
  async handleJoinRequest(clubId, requestId, action) {
    try {
      const response = await this.makeRequest(`${this.baseURL}/${clubId}/join-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ action })
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Add member directly
  async addMember(clubId, userId, role = 'member') {
    try {
      const response = await this.makeRequest(`${this.baseURL}/${clubId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId, role })
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Remove member
  async removeMember(clubId, memberId) {
    try {
      const response = await this.makeRequest(`${this.baseURL}/${clubId}/members/${memberId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new ClubService();