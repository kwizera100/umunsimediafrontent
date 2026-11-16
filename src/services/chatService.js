import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  console.log('Creating axios instance with token:', token ? 'present' : 'missing');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

const chatService = {
  // Send a message
  sendMessage: async (receiverId, content, messageType = 'text', fileData = null) => {
    try {
      const axiosInstance = createAxiosInstance();
      const requestData = { 
        receiverId, 
        content, 
        messageType,
        fileData: fileData ? JSON.stringify(fileData) : null
      };
      console.log('Sending message with data:', requestData);
      const response = await axiosInstance.post('/messages', requestData);
      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in chatService.sendMessage:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },
  // Get chat history with a user
  getMessages: async (userId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/messages?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
   async getUnreadCount() {

    const res = await createAxiosInstance().get('/messages/unread-count');
    return res.data;
  },
  markMessagesAsRead: async (senderId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/messages/mark-messages-as-read',{ senderId: senderId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

};

export default chatService; 