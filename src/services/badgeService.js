const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

class BadgeService {
  // Get badges for a specific article
  async getArticleBadges(articleId) {
    try {
      const response = await fetch(`${API_URL}/rewards/badges/article/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch article badges');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching article badges:', error);
      return { badges: [], rewards: [] };
    }
  }

  // Get rewards for a specific article
  async getArticleRewards(articleId) {
    try {
      const response = await fetch(`${API_URL}/rewards/rewards/article/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch article rewards');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching article rewards:', error);
      return { rewards: [] };
    }
  }

  // Get badges for a specific club
  async getClubBadges(clubId) {
    try {
      const response = await fetch(`${API_URL}/rewards/badges/club/${clubId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch club badges');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching club badges:', error);
      return { badges: [], rewards: [] };
    }
  }

  // Get rewards for a specific club
  async getClubRewards(clubId) {
    try {
      const response = await fetch(`${API_URL}/rewards/rewards/club/${clubId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch club rewards');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching club rewards:', error);
      return { rewards: [] };
    }
  }

  // Get all available badges
  async getAllBadges() {
    try {
      const response = await fetch(`${API_URL}/rewards/badges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching badges:', error);
      return { badges: [] };
    }
  }

  // Get user badges
  async getUserBadges(userId) {
    try {
      const response = await fetch(`${API_URL}/rewards/badges/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user badges');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  // Get user rewards
  async getUserRewards(userId) {
    try {
      const response = await fetch(`${API_URL}/rewards/rewards/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user rewards');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return [];
    }
  }

  // Get all available rewards
  async getAllRewards() {
    try {
      const response = await fetch(`${API_URL}/rewards/rewards`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return { rewards: [] };
    }
  }

  // Award a badge to an article
  async awardBadgeToArticle(articleId, badgeId, notes = '') {
    try {
      const response = await fetch(`${API_URL}/rewards/badges/article/${articleId}/${badgeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        throw new Error('Failed to award badge');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  // Award a reward to an article
  async awardRewardToArticle(articleId, rewardId, notes = '') {
    try {
      const response = await fetch(`${API_URL}/rewards/rewards/article/${articleId}/${rewardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        throw new Error('Failed to award reward');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error awarding reward:', error);
      throw error;
    }
  }

  // Award a badge to a club
  async awardBadgeToClub(clubId, badgeId, notes = '') {
    try {
      const response = await fetch(`${API_URL}/rewards/badges/club/${clubId}/${badgeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        throw new Error('Failed to award badge to club');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error awarding badge to club:', error);
      throw error;
    }
  }

  // Award a reward to a club
  async awardRewardToClub(clubId, rewardId, notes = '') {
    try {
      const response = await fetch(`${API_URL}/rewards/rewards/club/${clubId}/${rewardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        throw new Error('Failed to award reward to club');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error awarding reward to club:', error);
      throw error;
    }
  }

  // Get user's badge progression
  async getUserBadgeProgression(userId) {
    try {
      const response = await fetch(`${API_URL}/api/rewards/user/${userId}/progression`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch badge progression');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching badge progression:', error);
      return { progression: [] };
    }
  }

  // Get leaderboards
  async getLeaderboards(type = 'all') {
    try {
      const response = await fetch(`${API_URL}/api/rewards/leaderboards?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboards');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      return { leaderboards: [] };
    }
  }

  // Get achievement notifications
  async getAchievementNotifications(userId) {
    try {
      const response = await fetch(`${API_URL}/api/notifications/achievements?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievement notifications');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching achievement notifications:', error);
      return { notifications: [] };
    }
  }

  // Generate certificate
  async generateCertificate(certificateId, userId, articleId = null) {
    try {
      const response = await fetch(`${API_URL}/api/rewards/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          certificateId,
          userId,
          articleId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate certificate');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  // Download certificate
  async downloadCertificate(certificateId, userId) {
    try {
      const response = await fetch(`${API_URL}/api/rewards/certificates/${certificateId}/download?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export default new BadgeService();
