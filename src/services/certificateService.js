import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const certificateService = {
  // Get all certificates
  getAllCertificates: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rewards/certificates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  },

  // Get user's certificates
  getUserCertificates: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/rewards/certificates/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      throw error;
    }
  },

  // Get certificate preview
  getCertificatePreview: async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/rewards/certificates/preview/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching certificate preview:', error);
      throw error;
    }
  },

  // Verify certificate
  verifyCertificate: async (certificateId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/rewards/certificates/verify/${certificateId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  },

  // Download certificate PDF
  downloadCertificatePDF: async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/rewards/certificates/${certificateId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error downloading certificate PDF:', error);
      throw error;
    }
  },

  // Issue certificate to user (admin only)
  issueCertificate: async (userId, certificateId, articleId = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/rewards/certificates/issue/${userId}/${certificateId}`,
        { articleId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  },

  // Create certificate (admin only)
  createCertificate: async (certificateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/rewards/certificates`,
        certificateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  },

  // Update certificate (admin only)
  updateCertificate: async (certificateId, certificateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/rewards/certificates/${certificateId}`,
        certificateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  },

  // Delete certificate (admin only)
  deleteCertificate: async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE_URL}/rewards/certificates/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  },

  // Initialize default certificates (admin only)
  initializeDefaultCertificates: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/rewards/certificates/initialize`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error initializing default certificates:', error);
      throw error;
    }
  }
};

export default certificateService;
