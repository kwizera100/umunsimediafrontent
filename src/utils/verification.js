/**
 * Utility functions for user verification and premium status
 */

/**
 * Check if a user is currently verified (has active premium subscription)
 * @param {Object} user - User object
 * @returns {boolean} - True if user is verified
 */
export const isUserVerified = (user) => {
  if (!user) return false;
  
  // Check if user has premium plan
  if (user.plan !== 'PREMIUM') return false;
  
  // Check if plan hasn't expired
  if (!user.planExpiresAt) return false;
  
  return new Date(user.planExpiresAt) > new Date();
};

/**
 * Check if a user's premium subscription has expired
 * @param {Object} user - User object
 * @returns {boolean} - True if subscription has expired
 */
export const isSubscriptionExpired = (user) => {
  if (!user) return true;
  
  if (user.plan !== 'PREMIUM') return true;
  
  if (!user.planExpiresAt) return true;
  
  return new Date(user.planExpiresAt) <= new Date();
};

/**
 * Get the number of days until subscription expires
 * @param {Object} user - User object
 * @returns {number|null} - Days until expiry, or null if not premium
 */
export const getDaysUntilExpiry = (user) => {
  if (!isUserVerified(user)) return null;
  
  const now = new Date();
  const expiry = new Date(user.planExpiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Get subscription status text
 * @param {Object} user - User object
 * @returns {string} - Status description
 */
export const getSubscriptionStatus = (user) => {
  if (!user) return 'No account';
  
  if (user.plan === 'FREE') return 'Free plan';
  
  if (isSubscriptionExpired(user)) return 'Expired';
  
  const daysLeft = getDaysUntilExpiry(user);
  if (daysLeft === null) return 'Free plan';
  
  if (daysLeft === 0) return 'Expires today';
  if (daysLeft === 1) return 'Expires tomorrow';
  if (daysLeft <= 7) return `Expires in ${daysLeft} days`;
  
  return 'Active';
};

/**
 * Check if user can perform premium actions
 * @param {Object} user - User object
 * @param {string} action - Action to check (e.g., 'editPost', 'longPost')
 * @returns {boolean} - True if user can perform the action
 */
export const canPerformAction = (user, action) => {
  if (!user) return false;
  
  const premiumActions = [
    'editPost',
    'editArticle', 
    'longPost',
    'longArticle',
    'customTheme',
    'prioritySupport',
    'advancedAnalytics'
  ];
  
  if (!premiumActions.includes(action)) return true;
  
  return isUserVerified(user);
};

/**
 * Get user display name with verification status
 * @param {Object} user - User object
 * @returns {Object} - Object with name and verification status
 */
export const getUserDisplayInfo = (user) => {
  if (!user) return { name: 'Unknown User', isVerified: false };
  
  const name = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username || 'Unknown User';
    
  return {
    name,
    username: user.username,
    isVerified: isUserVerified(user),
    plan: user.plan,
    expiresAt: user.planExpiresAt
  };
};
