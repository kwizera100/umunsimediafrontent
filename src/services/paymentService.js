const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

class PaymentService {
  /**
   * Initiate payment with K-Pay
   * @param {object} paymentData - Payment details
   * @param {string} paymentData.plan - 'monthly' or 'annual'
   * @param {string} paymentData.msisdn - Phone number (2507XXXXXXXX) - required for Mobile Money
   * @param {string} paymentData.email - Customer email
   * @param {string} paymentData.customerName - Customer name
   * @param {string} paymentData.userId - User ID
   * @param {string} paymentData.paymentMethod - Payment method: 'momo', 'cc', or 'spenn'
   * @returns {Promise<object>} Response with checkout URL
   */
  async initiatePayment(paymentData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      return data;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   * @param {string} refid - Payment reference ID
   * @returns {Promise<object>} Payment status information
   */
  async checkPaymentStatus(refid) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/status/${refid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check payment status');
      }

      return data;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for current user
   * @returns {Promise<object>} Payment history
   */
  async getPaymentHistory() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get payment history');
      }

      return data;
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  /**
   * Poll payment status until it's completed or failed
   * @param {string} refid - Payment reference ID
   * @param {number} interval - Polling interval in milliseconds (default: 3000)
   * @param {number} maxAttempts - Maximum polling attempts (default: 20)
   * @returns {Promise<object>} Final payment status
   */
  async pollPaymentStatus(refid, interval = 3000, maxAttempts = 20) {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const poll = async () => {
        try {
          attempts++;
          const result = await this.checkPaymentStatus(refid);
          
          // If payment is completed (success or failed), resolve
          if (result.data && (result.data.status === 'SUCCESS' || result.data.status === 'FAILED')) {
            resolve(result);
            return;
          }

          // If max attempts reached, resolve with current status
          if (attempts >= maxAttempts) {
            resolve(result);
            return;
          }

          // Continue polling
          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  }
}

export default new PaymentService();

