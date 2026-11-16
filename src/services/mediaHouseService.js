import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const mediaHouseApi = axios.create({
  baseURL: `${API_BASE_URL}/media-houses`,
});

mediaHouseApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mediaHouseService = {
  // Public: Get all media houses
  getAllMediaHouses: async (params = {}) => {
    const response = await mediaHouseApi.get('/', { params });
    return response.data;
  },

  // Public: Get single media house by id or slug
  getMediaHouse: async (idOrSlug) => {
    const response = await mediaHouseApi.get(`/${idOrSlug}`);
    return response.data;
  },

  // Public: Claim a media house
  claimMediaHouse: async (mediaHouseId, claimData) => {
    const response = await mediaHouseApi.post(`/${mediaHouseId}/claim`, claimData);
    return response.data;
  },

  // User: Get media houses owned by current user
  getMyMediaHouses: async () => {
    const response = await mediaHouseApi.get('/my/houses');
    return response.data;
  },

  // User: Update owned media house profile
  updateMediaHouse: async (mediaHouseId, data) => {
    const response = await mediaHouseApi.put(`/${mediaHouseId}`, data);
    return response.data;
  },

  // Writer: Submit article to marketplace
  submitMarketArticle: async (formData) => {
    const response = await mediaHouseApi.post('/articles/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Writer: Get their submitted marketplace articles
  getMyMarketArticles: async () => {
    const response = await mediaHouseApi.get('/my/articles');
    return response.data;
  },

  // Media House: Get articles tagged to this media house
  getTaggedArticles: async (mediaHouseId) => {
    const response = await mediaHouseApi.get(`/${mediaHouseId}/tagged`);
    return response.data;
  },

  // Public: Get approved marketplace articles
  getMarketplace: async (params = {}) => {
    const response = await mediaHouseApi.get('/marketplace', { params });
    return response.data;
  },

  // Media House: Buy an article
  buyArticle: async (articleId) => {
    const response = await mediaHouseApi.post(`/articles/${articleId}/buy`);
    return response.data;
  },

  // Media House: Reject/remove a tag
  rejectArticle: async (articleId) => {
    const response = await mediaHouseApi.post(`/articles/${articleId}/reject`);
    return response.data;
  },

  // Media House: Get purchased articles
  getPurchasedArticles: async (mediaHouseId) => {
    const response = await mediaHouseApi.get(`/${mediaHouseId}/purchased`);
    return response.data;
  },

  // Media House: Download purchased article
  getDownloadUrl: async (articleId) => {
    const response = await mediaHouseApi.get(`/articles/${articleId}/download`);
    return response.data;
  },

  // ============ USER PURCHASE (any user, MTN MoMo) ============
  // Any user: Initiate article purchase via MTN MoMo
  initiateArticlePurchase: async (articleId, { msisdn, email, customerName }) => {
    const response = await mediaHouseApi.post(`/articles/${articleId}/initiate-purchase`, {
      msisdn, email, customerName,
    });
    return response.data;
  },

  // Any user: Get articles they purchased
  getMyPurchases: async () => {
    const response = await mediaHouseApi.get('/my/purchases');
    return response.data;
  },

  // Any user: Download URL for a purchased article
  getUserDownloadUrl: async (articleId) => {
    const response = await mediaHouseApi.get(`/articles/${articleId}/user-download`);
    return response.data;
  },

  // Writer: Earnings summary (70% of sales)
  getMyEarnings: async () => {
    const response = await mediaHouseApi.get('/my/earnings');
    return response.data;
  },

  // Writer: Request a withdrawal of earnings (min RWF 7,000)
  requestWithdrawal: async (msisdn) => {
    const response = await mediaHouseApi.post('/my/withdraw', { msisdn });
    return response.data;
  },

  // ============ WRITER MONTHLY SUBSCRIPTION ============
  // Subscribe monthly to a writer (MTN MoMo)
  subscribeToWriter: async (writerId, { msisdn, email, customerName, articleId }) => {
    const response = await mediaHouseApi.post(`/writers/${writerId}/subscribe`, {
      msisdn, email, customerName, articleId,
    });
    return response.data;
  },

  // Writer edits their submitted market article (goes back to pending for re-review)
  updateMarketArticle: async (articleId, formData) => {
    const response = await mediaHouseApi.put(`/my/articles/${articleId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Writer deletes their submitted market article (blocked once purchased)
  deleteMarketArticle: async (articleId) => {
    const response = await mediaHouseApi.delete(`/my/articles/${articleId}`);
    return response.data;
  },

  // Writer's subscriber count + whether current user is subscribed
  getWriterSubscribers: async (writerId) => {
    const response = await mediaHouseApi.get(`/writers/${writerId}/subscribers`);
    return response.data;
  },

  // Writers the current user subscribes to
  getMySubscriptions: async () => {
    const response = await mediaHouseApi.get('/my/subscriptions');
    return response.data;
  },

  // Articles from writers the user subscribes to
  getSubscribedArticles: async () => {
    const response = await mediaHouseApi.get('/subscribed/articles');
    return response.data;
  },

  // Writer sets their monthly subscription price
  setMonthlyPrice: async (monthlyPrice) => {
    const response = await mediaHouseApi.put('/my/monthly-price', { monthlyPrice });
    return response.data;
  },

  // Admin: Create a new media house (basic info, to be claimed later)
  adminCreateMediaHouse: async (data) => {
    const response = await mediaHouseApi.post('/admin/create', data);
    return response.data;
  },

  // Admin: Get all media houses (with claim status)
  adminGetAllMediaHouses: async (params = {}) => {
    const response = await mediaHouseApi.get('/admin/all', { params });
    return response.data;
  },

  // Admin: Approve a claim
  adminApproveClaim: async (claimId) => {
    const response = await mediaHouseApi.post(`/admin/claims/${claimId}/approve`);
    return response.data;
  },

  // Admin: Reject a claim
  adminRejectClaim: async (claimId, reason) => {
    const response = await mediaHouseApi.post(`/admin/claims/${claimId}/reject`, { rejectionReason: reason });
    return response.data;
  },

  // Admin: Approve a marketplace article (before it goes to feed/marketplace)
  adminApproveArticle: async (articleId) => {
    const response = await mediaHouseApi.post(`/admin/articles/${articleId}/approve`);
    return response.data;
  },

  // Admin: Reject a marketplace article
  adminRejectArticle: async (articleId, reason) => {
    const response = await mediaHouseApi.post(`/admin/articles/${articleId}/reject`, { rejectionReason: reason });
    return response.data;
  },

  // Admin: Delete media house
  adminDeleteMediaHouse: async (mediaHouseId) => {
    const response = await mediaHouseApi.delete(`/admin/${mediaHouseId}`);
    return response.data;
  },

  // Admin: Get pending claims
  adminGetPendingClaims: async () => {
    const response = await mediaHouseApi.get('/admin/claims');
    return response.data;
  },

  // Admin: Get pending marketplace articles
  adminGetPendingArticles: async () => {
    const response = await mediaHouseApi.get('/admin/articles');
    return response.data;
  },

  // Suggestions: Get rotating suggested media houses
  getSuggestedMediaHouses: async () => {
    const response = await mediaHouseApi.get('/suggested');
    return response.data;
  },
};

export default mediaHouseService;
