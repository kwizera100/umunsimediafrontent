import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Crown, 
  GraduationCap,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  BookOpen,
  Download,
  Calendar,
  Activity,
  BarChart3,
  Target,
  Award,
  Clock,
  Zap,
  Star,
  Eye,
  Share2,
  ThumbsUp,
  Hash,
  TrendingDown,
  Minus,
  Plus,
  ArrowUp,
  ArrowDown,
  BarChart,
  PieChart,
  LineChart,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import userService from '../services/userService';
import { mediaHouseService } from '../services/mediaHouseService';
import AnalyticsDashboard from './AnalyticsDashboard';
import analyticsService from '../services/analyticsService';
import UserRewardsProfile from './UserRewardsProfile';
import UserDisplay from './UserDisplay';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateProfile, updateCoverImage, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [boughtArticles, setBoughtArticles] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationFile, setVerificationFile] = useState(null);
  const [schoolName, setSchoolName] = useState(user?.schoolName || '');
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
      });
      setSchoolName(user.schoolName || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        console.log('Fetching profile statistics...');
        const data = await userService.getProfileStatistics();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStatsError('Failed to load statistics');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  // Fetch marketplace earnings (writer article sales)
  useEffect(() => {
    if (!user?.id) return;
    mediaHouseService.getMyEarnings()
      .then((res) => { if (res?.success) setEarnings(res.data); })
      .catch(() => {});
    // Purchased + subscribed articles
    mediaHouseService.getMyPurchases()
      .then((res) => { if (res?.success) setBoughtArticles(res.data || []); })
      .catch(() => {});
    mediaHouseService.getMySubscriptions()
      .then((res) => { if (res?.success) setMySubscriptions(res.data || []); })
      .catch(() => {});
    if (user.monthlyPrice != null) setMonthlyPrice(String(user.monthlyPrice));
  }, [user?.id, refreshTrigger]);

  // Fetch detailed analytics when analytics view is enabled
  useEffect(() => {
    if (showAnalytics && user?.id) {
      fetchAnalytics();
    }
  }, [showAnalytics, user?.id, refreshTrigger]);

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    
    setAnalyticsLoading(true);
    try {
      const [userAnalytics, trendingContent, engagementTrends] = await Promise.all([
        analyticsService.getUserAnalytics(user.id, '30d'),
        analyticsService.getTrendingContent(user.id, 'all', 10),
        analyticsService.getEngagementTrends(user.id, '30d')
      ]);
      
      setAnalyticsData({
        ...userAnalytics,
        trendingContent,
        engagementTrends,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'avatar') {
        setAvatar(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setAvatarPreview(e.target.result);
        reader.readAsDataURL(file);
      } else if (type === 'cover') {
        setCoverImage(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Include avatar file if present
      const payload = { ...formData };
      if (avatar) {
        payload.avatar = avatar;
      }
      const result = await updateProfile(payload);
      if (result?.success) {
        // Clear avatar file and preview after successful update
        setAvatar(null);
        setAvatarPreview('');
      }
      setIsEditing(false);
      setRefreshTrigger(prev => prev + 1); // Refresh stats after profile update
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCoverImageUpdate = async () => {
    if (coverImage) {
      try {
        await updateCoverImage(coverImage);
        setCoverImage(null);
        setRefreshTrigger(prev => prev + 1); // Refresh stats after cover update
      } catch (error) {
        console.error('Error updating cover image:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    });
    setAvatar(null);
    setAvatarPreview('');
  };

  const getPlanBadge = () => {
    if (!user?.plan) return null;
    
    const planConfig = {
      FREE: { color: 'bg-gray-500 dark:bg-gray-600', text: 'Free Plan' },
      PREMIUM: { color: 'bg-gradient-to-r from-yellow-500 to-orange-500', text: 'Premium' },
      PRO: { color: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'Pro' }
    };
    
    const config = planConfig[user.plan] || planConfig.FREE;
    
    return (
      <div className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
        <Crown className="h-3 w-3" />
        {config.text}
      </div>
    );
  };

  const getMemberSince = () => {
    const createdAt = user?.createdAt || stats?.memberSince;
    if (!createdAt) return 'N/A';
    return new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEngagementRate = () => {
    if (!stats) return 0;
    return stats.engagementRate || 0;
  };

  const getActivityScore = () => {
    if (!stats) return 0;
    return Math.min(100, stats.activityScore || 0);
  };

  const getContentCreationRate = () => {
    if (!stats?.performance) return 0;
    return stats.performance.contentCreationRate || 0;
  };

  const getAverageMessagesPerChat = () => {
    if (!stats?.chatAnalysis) return 0;
    return stats.chatAnalysis.averageMessagesPerChat || 0;
  };

  const getRecentActivity = () => {
    if (!stats?.recentActivity) return { posts: 0, articles: 0, likes: 0, storyLikes: 0 };
    return stats.recentActivity;
  };

  const getPopularContent = () => {
    // Add more defensive checks
    const posts = Array.isArray(stats?.popularPosts) ? stats.popularPosts : [];
    const articles = Array.isArray(stats?.popularArticles) ? stats.popularArticles : [];
    
    return {
      posts,
      articles
    };
  };

  const getMemberDuration = () => {
    if (!stats?.daysSinceJoin) return 'N/A';
    const days = stats.daysSinceJoin;
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  const getTrendIndicator = (current, previous = 0) => {
    if (current > previous) {
      return { icon: ArrowUp, color: 'text-green-400', text: 'Up' };
    } else if (current < previous) {
      return { icon: ArrowDown, color: 'text-red-400', text: 'Down' };
    } else {
      return { icon: Minus, color: 'text-gray-500 dark:text-gray-400', text: 'Stable' };
    }
  };

  const getPerformanceColor = (value, threshold = 50) => {
    if (value >= threshold * 1.2) return 'text-green-400';
    if (value >= threshold) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getActivityLevel = (score) => {
    if (score >= 80) return { level: 'Very Active', color: 'text-green-400', bg: 'bg-green-600/20' };
    if (score >= 60) return { level: 'Active', color: 'text-blue-400', bg: 'bg-blue-600/20' };
    if (score >= 40) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-600/20' };
    return { level: 'Low', color: 'text-red-400', bg: 'bg-red-600/20' };
  };

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading insights...</span>
          </div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="space-y-8">
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-8">
          <div className="text-center">
            <p className="text-red-400">{statsError}</p>
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activityLevel = getActivityLevel(getActivityScore());
  const recentActivity = getRecentActivity();
  const popularContent = getPopularContent();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Analytics Dashboard */}
      {showAnalytics && user?.id && (
        <div className="mb-8">
          {analyticsLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
              </div>
            </div>
          ) : (
            <AnalyticsDashboard userId={user.id} timeframe="30d" />
          )}
        </div>
      )}
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
        {/* Cover Image */}
        <div className="relative h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-600/20 dark:to-purple-600/20">
          {user?.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Cover Image Upload */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cover')}
                className="hidden"
              />
              <div className="bg-black/50 dark:bg-gray-900/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-black/60 dark:hover:bg-gray-800/90 transition-colors border border-gray-300/50 dark:border-gray-600">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </label>
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white dark:bg-gray-900 rounded-full p-1 shadow-2xl border-4 border-white dark:border-gray-800">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Avatar Upload */}
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                  className="hidden"
                />
                <div className="bg-blue-600 rounded-full p-1.5 sm:p-2 hover:bg-blue-700 transition-colors border-2 border-white dark:border-gray-800">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 sm:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <UserDisplay 
                  user={user} 
                  showAvatar={false}
                  size="lg"
                  linkToProfile={false}
                  showVerification={true}
                />
                {getPlanBadge()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 sm:px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                      showAnalytics 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {coverImage && (
                <button
                  type="button"
                  onClick={handleCoverImageUpdate}
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg border border-green-500/30 font-medium text-sm sm:text-base"
                >
                  Update Cover
                </button>
              )}
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {user?.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h3>
                  <p className="text-gray-900 dark:text-white text-base sm:text-lg leading-relaxed">{user.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                <div className="bg-gray-100 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Email:</span>
                  <p className="text-gray-900 dark:text-white mt-1 text-sm sm:text-base">{user?.email}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Member since:</span>
                  <p className="text-gray-900 dark:text-white mt-1 text-sm sm:text-base">{getMemberSince()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Plan Card */}
      {(() => {
        const isPremium =
          user?.plan === 'PREMIUM' &&
          user?.planExpiresAt &&
          new Date(user.planExpiresAt) > new Date();
        const isAnnual = isPremium && user?.planType === 'ANNUAL';

        return (
          <div className="rounded-2xl lg:rounded-xl border overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-800">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isAnnual
                        ? 'Annual Premium Active'
                        : isPremium
                        ? 'Premium Active — Upgrade to Yearly'
                        : 'Upgrade to Premium'}
                    </h3>
                    <p className="text-sm text-blue-100">
                      {isAnnual
                        ? 'Free post boosts included — your posts get recommended across the app.'
                        : isPremium
                        ? 'Switch to Yearly to unlock free post boosts & priority reach.'
                        : 'Verification badge, articles, analytics & more — from 2,000 RWF/month.'}
                    </p>
                  </div>
                </div>
                {!isAnnual && (
                  <button
                    onClick={() => navigate('/subscription')}
                    className="px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base flex-shrink-0"
                  >
                    <Zap className="h-4 w-4" />
                    {isPremium ? 'Go Yearly' : 'Get Premium'}
                  </button>
                )}
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-blue-50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 flex-shrink-0" />
                  <span>Blue verification badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 flex-shrink-0" />
                  <span>Create & sell articles to media houses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 flex-shrink-0" />
                  <span>Boost posts — wider reach & views</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 flex-shrink-0" />
                  <span>Advanced analytics & insights</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Star className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                  <span className="font-semibold">
                    Yearly subscribers get FREE post boosts — recommended across the app
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Writer Earnings Card — shown when the user has marketplace sales */}
      {earnings && earnings.totalEarned > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Article Earnings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">You earn 70% of every sale</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(earnings.available ?? earnings.totalEarned).toLocaleString()} RWF
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Available to withdraw</div>
              </div>
            </div>
            <div className="space-y-2">
              {earnings.articles.filter((a) => a.sales > 0).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.sales} sale{a.sales !== 1 ? 's' : ''} · {a.price.toLocaleString()} RWF each</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 ml-3 flex-shrink-0">
                    +{a.earned.toLocaleString()} RWF
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Writer monthly price setter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Monthly Subscription Price</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Readers pay this to unlock all your paid articles</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="number"
                min="0"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="e.g. 1000"
                className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">RWF/mo</span>
            </div>
            <button
              onClick={async () => {
                if (savingPrice) return;
                setSavingPrice(true);
                try {
                  await mediaHouseService.setMonthlyPrice(parseFloat(monthlyPrice) || 0);
                  toast.success('Monthly price saved');
                } catch (e) {
                  toast.error(e.response?.data?.message || 'Failed to save price');
                } finally { setSavingPrice(false); }
              }}
              disabled={savingPrice}
              className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold text-sm flex-shrink-0"
            >
              {savingPrice ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Balance & Withdraw — earnings available for payout (min 7,000 RWF) */}
      {earnings && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Balance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Money earned from article sales — withdraw to your MoMo</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="min-w-0">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(earnings.available ?? 0).toLocaleString()} RWF
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">available to withdraw · min 7,000 RWF</p>
                {earnings.pendingWithdrawal > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{earnings.pendingWithdrawal.toLocaleString()} RWF payout pending</p>
                )}
              </div>
              <button
                onClick={async () => {
                  const available = earnings.available ?? 0;
                  if (available < 7000) {
                    toast.error('Minimum withdrawal is 7,000 RWF');
                    return;
                  }
                  const phone = user?.telephone || '';
                  const input = phone || window.prompt('Enter your MTN MoMo number to receive the payout:', '2507XXXXXXXX');
                  if (!input) return;
                  try {
                    await mediaHouseService.requestWithdrawal(input);
                    toast.success('Withdrawal requested — ' + available.toLocaleString() + ' RWF will be sent to your MoMo');
                    setRefreshTrigger((t) => t + 1);
                  } catch (e) {
                    toast.error(e.response?.data?.message || 'Withdrawal failed');
                  }
                }}
                disabled={(earnings.available ?? 0) < 7000}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm flex-shrink-0"
              >
                Withdraw to MoMo
              </button>
            </div>
            {(earnings.available ?? 0) < 7000 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                You need {(7000 - (earnings.available ?? 0)).toLocaleString()} more RWF to reach the minimum withdrawal.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bought Articles — purchased + subscribed */}
      {(boughtArticles.length > 0 || mySubscriptions.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">My Articles</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Purchased + from writers you subscribe to</p>
              </div>
            </div>
            {mySubscriptions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">Subscribed writers</p>
                <div className="flex flex-wrap gap-2">
                  {mySubscriptions.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                      <Crown className="h-3 w-3" />
                      {`${s.writer.firstName || ''} ${s.writer.lastName || ''}`.trim() || s.writer.username}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              {boughtArticles.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">by {`${(a.writer?.firstName)||''} ${(a.writer?.lastName)||''}`.trim() || a.writer?.username}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const r = await mediaHouseService.getUserDownloadUrl(a.id);
                        if (r.success && r.data?.url) window.open(r.data.url, '_blank');
                      } catch (e) { toast.error('Download not available'); }
                    }}
                    className="ml-3 flex-shrink-0 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Verification Section - Only show if NOT approved */}
      {user?.isStudent && user?.studentVerificationStatus !== 'APPROVED' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Verification</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your student verification status</p>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="mb-4">
              {user?.studentVerificationStatus === 'PENDING' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Verification Pending</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      Your documents are under review. We'll notify you once reviewed.
                    </p>
                  </div>
                </div>
              )}

              {user?.studentVerificationStatus === 'REJECTED' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-300">Verification Rejected</p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      Your verification was rejected. Please resubmit with updated documents.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Resubmission Form - Show for REJECTED or if no status and is student */}
            {(user?.studentVerificationStatus === 'REJECTED' || user?.studentVerificationStatus === 'PENDING' || (user?.isStudent && !user?.studentVerificationStatus)) && (
              <div>
                {!showVerificationForm ? (
                  <button
                    onClick={() => setShowVerificationForm(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {user?.studentVerificationStatus === 'REJECTED' ? 'Resubmit Documents' : 'Submit Documents'}
                  </button>
                ) : (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        School Name
                      </label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Enter your school name"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Verification Document
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="verification-file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setVerificationFile(e.target.files[0])}
                          className="hidden"
                        />
                        <label
                          htmlFor="verification-file"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {verificationFile ? verificationFile.name : 'Click to upload PDF or image'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            PDF, JPG, or PNG (max 5MB)
                          </span>
                        </label>
                      </div>
                      {verificationFile && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {verificationFile.name}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!verificationFile && !schoolName.trim()) {
                            toast.error('Please provide either a document or school name');
                            return;
                          }

                          try {
                            setVerificationLoading(true);
                            const formData = new FormData();
                            if (verificationFile) {
                              formData.append('studentReport', verificationFile);
                            }
                            if (schoolName.trim()) {
                              formData.append('schoolName', schoolName);
                            }

                            const result = await userService.resubmitStudentVerification(formData);
                            toast.success(result.message || 'Verification documents submitted successfully!');
                            setShowVerificationForm(false);
                            setVerificationFile(null);
                            // Refresh user data
                            window.location.reload();
                          } catch (error) {
                            console.error('Error submitting verification:', error);
                            toast.error(error.message || 'Failed to submit verification documents');
                          } finally {
                            setVerificationLoading(false);
                          }
                        }}
                        disabled={verificationLoading || (!verificationFile && !schoolName.trim())}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {verificationLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Submit for Review
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowVerificationForm(false);
                          setVerificationFile(null);
                          setSchoolName(user?.schoolName || '');
                        }}
                        disabled={verificationLoading}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user?.schoolName && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">School Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.schoolName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Total Posts</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalPosts || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-500">{recentActivity.posts} this month</span>
                {recentActivity.posts > 0 && (
                  <div className="flex items-center gap-1 text-green-500 dark:text-green-400">
                    <ArrowUp className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="text-xs">+{recentActivity.posts}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-green-400 dark:hover:border-green-500/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Friends</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalFriends || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats?.totalSentFriendRequests || 0} pending requests
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-600/20 rounded-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-purple-400 dark:hover:border-purple-500/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Articles</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalArticles || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-500">{recentActivity.articles} this month</span>
                {recentActivity.articles > 0 && (
                  <div className="flex items-center gap-1 text-purple-500 dark:text-purple-400">
                    <ArrowUp className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="text-xs">+{recentActivity.articles}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-red-400 dark:hover:border-red-500/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Total Views</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{(stats?.totalViews || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {(stats?.totalPostViews || 0) + (stats?.totalArticleViews || 0)} content views
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-600/20 rounded-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Rate Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Engagement Rate</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{getEngagementRate()}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {(stats?.totalPostLikes || 0) + (stats?.totalArticleLikes || 0)} total likes
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-600/20 rounded-lg">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Activity Level Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Activity Level</h3>
          <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${activityLevel.bg} ${activityLevel.color}`}>
            {activityLevel.level}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-gray-400 text-sm sm:text-base">Activity Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getActivityScore()}%` }}
                ></div>
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">{getActivityScore()}/100</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <span className="text-gray-400 text-xs sm:text-sm">Member for:</span>
              <p className="text-white font-medium text-sm sm:text-base">{getMemberDuration()}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <span className="text-gray-400 text-xs sm:text-sm">Content rate:</span>
              <p className="text-white font-medium text-sm sm:text-base">{getContentCreationRate()} per week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Engagement Analytics */}
        <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-800/90 lg:dark:from-gray-800 lg:dark:via-gray-800 lg:dark:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Engagement Analytics</h3>
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Engagement Rate</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Based on interactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPerformanceColor(getEngagementRate(), 50)} dark:${getPerformanceColor(getEngagementRate(), 50)}`}>
                  {getEngagementRate()}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Post Performance</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Avg. engagement per post</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPerformanceColor(stats?.performance?.engagementPerPost || 0, 5)} dark:${getPerformanceColor(stats?.performance?.engagementPerPost || 0, 5)}`}>
                  {stats?.performance?.engagementPerPost || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
                  <Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Article Performance</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Avg. engagement per article</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPerformanceColor(stats?.performance?.engagementPerArticle || 0, 10)} dark:${getPerformanceColor(stats?.performance?.engagementPerArticle || 0, 10)}`}>
                  {stats?.performance?.engagementPerArticle || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-600/20 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Story Engagement</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total story likes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.totalStoryLikes || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity (30 days)</h3>
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-sm">Created {recentActivity.posts} posts</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{recentActivity.posts}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
                <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-sm">Liked {recentActivity.likes} posts</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-green-600 dark:text-green-400 font-semibold">{recentActivity.likes}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-sm">Published {recentActivity.articles} articles</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">{recentActivity.articles}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-600/20 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-sm">Liked {recentActivity.storyLikes} stories</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">{recentActivity.storyLikes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Analytics & Club Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chat Analytics</h3>
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Active Chats</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Unique conversations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.chatAnalysis?.totalChats || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
                  <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Messages Sent</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total outgoing messages</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.chatAnalysis?.totalMessagesSent || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
                  <ArrowDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Messages Received</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total incoming messages</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.chatAnalysis?.totalMessagesReceived || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-600/20 rounded-lg">
                  <BarChart className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Avg. Messages/Chat</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Average per conversation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{getAverageMessagesPerChat()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Club Participation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Club Participation</h3>
            <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Member of</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total clubs joined</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalClubs || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
                  <Crown className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Owned Clubs</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Clubs you created</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.ownedClubs || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Leadership Score</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Based on owned clubs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.ownedClubs > 0 ? Math.min(100, stats.ownedClubs * 25) : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-600/20 rounded-lg">
                  <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Community Role</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Your participation level</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {stats?.ownedClubs > 2 ? 'Leader' : stats?.totalClubs > 5 ? 'Active' : 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Content Section - Light/Dark */}
      {!statsLoading && stats && (
        (Array.isArray(stats.popularPosts) && stats.popularPosts.length > 0) || 
        (Array.isArray(stats.popularArticles) && stats.popularArticles.length > 0)
      ) && (
        <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-800/90 lg:dark:from-gray-800 lg:dark:via-gray-800 lg:dark:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Popular Content</h3>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Popular Posts */}
            {Array.isArray(stats.popularPosts) && stats.popularPosts.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Top Posts
                </h4>
                <div className="space-y-3">
                  {stats.popularPosts.slice(0, 3).map((post, index) => (
                    <div key={post.id || `post-${index}`} className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs">{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white text-sm line-clamp-2">{post.content || 'No content'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Articles */}
            {Array.isArray(stats.popularArticles) && stats.popularArticles.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Top Articles
                </h4>
                <div className="space-y-3">
                  {stats.popularArticles.slice(0, 3).map((article, index) => (
                    <div key={article.id || `article-${index}`} className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs">{Array.isArray(article.articleLikes) ? article.articleLikes.length : 0}</span>
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white text-sm line-clamp-2">{article.title || 'No title'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rewards & Achievements */}
      {user?.id && (
        <div className="mb-8">
          <UserRewardsProfile userId={user.id} />
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 sm:gap-2 mx-auto text-sm sm:text-base"
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          Refresh Insights
        </button>
      </div>
    </div>
  );
};

export default UserProfile;