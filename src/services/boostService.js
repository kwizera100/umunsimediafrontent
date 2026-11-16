const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
const API_BASE_URL = `${API_URL}/boost`;

const boostService = {
  // Get boost options and pricing
  async getBoostOptions() {
    try {
      const response = await fetch(`${API_BASE_URL}/options`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get boost options");
      }

      return data;
    } catch (error) {
      console.error("Error getting boost options:", error);
      throw error;
    }
  },

  // Boost a post (legacy - kept for backward compatibility, but should use initiateBoostPayment)
  async boostPost(postId, boostLevel) {
    try {
      const response = await fetch(`${API_BASE_URL}/boost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          postId,
          boostLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to boost post");
      }

      return data;
    } catch (error) {
      console.error("Error boosting post:", error);
      throw error;
    }
  },

  // Initiate boost payment (requires payment)
  async initiateBoostPayment(postId, boostLevel, msisdn, email, customerName, paymentMethod = 'momo') {
    try {
      const response = await fetch(`${API_BASE_URL}/initiate-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          postId,
          boostLevel,
          msisdn,
          email,
          customerName,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate boost payment");
      }

      return data;
    } catch (error) {
      console.error("Error initiating boost payment:", error);
      throw error;
    }
  },

  // Free boost — Annual Premium perk (no payment)
  async freeBoost(postId, boostLevel = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ postId, boostLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to boost post");
      }

      return data;
    } catch (error) {
      console.error("Error free-boosting post:", error);
      throw error;
    }
  },

  // Get user's boosted posts
  async getMyBoostedPosts(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/my-boosts?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get boosted posts");
      }

      return data;
    } catch (error) {
      console.error("Error getting boosted posts:", error);
      throw error;
    }
  },

  // Cancel a boost
  async cancelBoost(boostId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${boostId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel boost");
      }

      return data;
    } catch (error) {
      console.error("Error cancelling boost:", error);
      throw error;
    }
  },

  // Get boost analytics for a post
  async getBoostAnalytics(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get boost analytics");
      }

      return data;
    } catch (error) {
      console.error("Error getting boost analytics:", error);
      throw error;
    }
  },
};

export default boostService;

