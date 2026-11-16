const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

class SubscriptionService {
  // Subscribe to a plan
  async subscribe(planType, paymentMethod = 'card') {
    try {
      const response = await fetch(`${API_URL}/subscription/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planType,
          paymentMethod
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to subscribe');
      }

      return await response.json();
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  }

  // Request manual verification
  async requestVerification(notes = '') {
    try {
      const response = await fetch(`${API_URL}/subscription/request-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request verification');
      }

      return await response.json();
    } catch (error) {
      console.error('Verification request error:', error);
      throw error;
    }
  }

  // Get subscription status
  async getSubscriptionStatus() {
    try {
      const response = await fetch(`${API_URL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get subscription status error:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await fetch(`${API_URL}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  // Get available plans
  async getPlans() {
    try {
      const response = await fetch(`${API_URL}/subscription/plans`);

      if (!response.ok) {
        throw new Error('Failed to get plans');
      }

      return await response.json();
    } catch (error) {
      console.error('Get plans error:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();
