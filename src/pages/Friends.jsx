import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, UserPlus, Search, Sparkles, TrendingUp, Send, UserCheck, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import FindFriends from '../components/FindFriends';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import CreateArticleModal from '../components/CreateArticleModal';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import friendService from '../services/friendService';
import toast from 'react-hot-toast';

const Friends = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('suggested');
  const [friendStats, setFriendStats] = useState({
    totalFriends: 0,
    newThisWeek: 0,
    mutualConnections: 0,
    pendingRequests: 0,
    sentRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal handlers
  const handleCreatePost = useCallback((postData) => {
    console.log('Post created:', postData);
    setIsPostModalOpen(false);
  }, []);

  const handleCreateStory = useCallback(async (storyData) => {
    try {
      setIsCreatingStory(true);
      console.log('Story created:', storyData);
      setIsStoryModalOpen(false);
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsCreatingStory(false);
    }
  }, []);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchFriendStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, requestsResponse, sentRequestsResponse] = await Promise.all([
        userService.getProfileStatistics(),
        userService.getFriendRequestCount?.() || { count: 0 },
        friendService.getFriendRequests('sent').catch(() => [])
      ]);
      
      setFriendStats({
        totalFriends: statsResponse.totalFriends || 0,
        newThisWeek: statsResponse.newFriendsThisWeek || 0,
        mutualConnections: statsResponse.mutualConnections || 0,
        pendingRequests: requestsResponse.count || 0,
        sentRequests: Array.isArray(sentRequestsResponse) ? sentRequestsResponse.length : (sentRequestsResponse.requests?.length || sentRequestsResponse.data?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching friend stats:', error);
      setError('Failed to load friend statistics');
      toast.error('Failed to load friend statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriendStats();
  }, [fetchFriendStats]);

  // Navigation tabs configuration
  const tabs = useMemo(() => [
    {
      id: 'suggested',
      label: 'Suggested',
      icon: Sparkles,
      count: null,
    },
    {
      id: 'find',
      label: 'Find People',
      icon: Search,
      count: null,
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: UserCheck,
      count: friendStats.pendingRequests,
    },
    {
      id: 'sent',
      label: 'Sent',
      icon: Send,
      count: friendStats.sentRequests || 0,
    }
  ], [friendStats.pendingRequests, friendStats.sentRequests]);

  // Memoized stats cards for better performance
  const statsCards = useMemo(() => [
    {
      title: 'Total Friends',
      value: friendStats.totalFriends,
      icon: Users,
      change: `+${friendStats.newThisWeek} this week`,
      changeColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'New This Week',
      value: friendStats.newThisWeek,
      icon: UserPlus,
      change: 'Recent connections',
      changeColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Mutual Connections',
      value: friendStats.mutualConnections,
      icon: TrendingUp,
      change: 'Shared connections',
      changeColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Pending Requests',
      value: friendStats.pendingRequests,
      icon: Clock,
      change: 'Awaiting response',
      changeColor: 'text-orange-600 dark:text-orange-400'
    }
  ], [friendStats]);

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'suggested':
        return <FindFriends type="suggested" hideTabs={true} />;
      case 'find':
        return <FindFriends type="search" hideTabs={true} />;
      case 'requests':
        return <FriendRequests onUpdate={fetchFriendStats} />;
      case 'sent':
        return <SentRequests onUpdate={fetchFriendStats} />;
      default:
        return <FindFriends type="suggested" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <Sidebar 
          onCreatePost={() => setIsPostModalOpen(true)}
          onCreateStory={() => setIsStoryModalOpen(true)}
          onCreateArticle={() => setIsArticleModalOpen(true)}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="lg:ml-64 lg:mr-80 px-4 sm:px-6 pt-20 lg:pt-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-500/20 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchFriendStats}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      {/* Sidebar - Mobile slide-in, Desktop fixed */}
      <Sidebar 
        onCreatePost={() => setIsPostModalOpen(true)}
        onCreateStory={() => setIsStoryModalOpen(true)}
        onCreateArticle={() => setIsArticleModalOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 lg:mr-80 px-0 sm:px-4 lg:px-6 pt-20 lg:pt-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    Friends & Connections
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                    Discover and connect with people
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-semibold ml-2">
                    {loading ? (
                      <div className="inline-block w-8 h-4 bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                    ) : (
                      `${friendStats.totalFriends}`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {loading && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    )}
                  </div>
                  
                  <div className="space-y-0.5 sm:space-y-1">
                    <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </h3>
                    <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      {loading ? (
                        <div className="w-10 h-5 sm:w-12 sm:h-6 bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <p className={`text-xs ${stat.changeColor} font-medium`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap
                      transition-all duration-200 min-w-fit
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                    {tab.count !== null && tab.count > 0 && (
                      <span className={`
                        px-1.5 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-red-100 text-red-700 dark:bg-red-500 dark:text-white'
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
        <RightSidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleCreatePost}
      />
      <CreateStoryModal 
        isOpen={isStoryModalOpen} 
        onClose={() => setIsStoryModalOpen(false)}
        onSave={handleCreateStory}
        isLoading={isCreatingStory}
      />
      {user?.plan === 'PREMIUM' && (
        <CreateArticleModal 
          isOpen={isArticleModalOpen} 
          onClose={() => setIsArticleModalOpen(false)}
        />
      )}

      <style jsx="true">{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Friend Requests Component
const FriendRequests = ({ onUpdate }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';

  const getUserAvatar = (user) => {
    if (!user?.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&background=4f46e5&color=ffffff&size=128`;
    }
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  };

  // Fetch real friend requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await friendService.getFriendRequests('received');
        // Handle the API response structure
        const requestsData = Array.isArray(response) ? response : (response.requests || response.data || []);
        setRequests(requestsData);
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
        setError('Failed to load friend requests');
        setRequests([]);
        toast.error('Failed to load friend requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      await friendService.acceptFriendRequest(requestId);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Friend request accepted');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast.error('Failed to accept friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      await friendService.rejectFriendRequest(requestId);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Friend request declined');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to decline friend request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <UserCheck className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading requests</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <UserCheck className="h-5 w-5" />
        Friend Requests ({requests.length})
      </h2>
      
      <div className="space-y-3 sm:space-y-4">
        {requests.map((request) => {
          const sender = request.sender || request.user || {};
          return (
            <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={getUserAvatar(sender)}
                    alt={sender?.firstName || 'User'}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.firstName || 'User')}&background=4f46e5&color=ffffff&size=128`;
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    onClick={() => navigate(`/profile/${sender?.username}`)}
                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors text-sm sm:text-base truncate"
                  >
                    {sender?.firstName} {sender?.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    @{sender?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 flex-shrink-0">
                <button 
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={actionLoading === request.id}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {actionLoading === request.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Accept
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={actionLoading === request.id}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
        
        {requests.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pending requests</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sent Requests Component
const SentRequests = ({ onUpdate }) => {
  const navigate = useNavigate();
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';

  const getUserAvatar = (user) => {
    if (!user?.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&background=4f46e5&color=ffffff&size=128`;
    }
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  };

  // Fetch real sent requests data
  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await friendService.getFriendRequests('sent');
        // Handle the API response structure
        const requestsData = Array.isArray(response) ? response : (response.requests || response.data || []);
        setSentRequests(requestsData);
      } catch (error) {
        console.error('Failed to fetch sent requests:', error);
        setError('Failed to load sent requests');
        setSentRequests([]);
        toast.error('Failed to load sent requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSentRequests();
  }, []);

  const handleCancelRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      await friendService.cancelFriendRequest(requestId);
      setSentRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success('Friend request cancelled');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      toast.error('Failed to cancel friend request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <Send className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading sent requests</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Send className="h-5 w-5" />
        Sent Requests ({sentRequests.length})
      </h2>
      
      <div className="space-y-3 sm:space-y-4">
        {sentRequests.map((request) => {
          const receiver = request.receiver || request.user || {};
          return (
            <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={getUserAvatar(receiver)}
                    alt={receiver?.firstName || 'User'}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver?.firstName || 'User')}&background=4f46e5&color=ffffff&size=128`;
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                    <Clock className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    onClick={() => navigate(`/profile/${receiver?.username}`)}
                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors text-sm sm:text-base truncate"
                  >
                    {receiver?.firstName} {receiver?.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    @{receiver?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Sent {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 font-medium">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleCancelRequest(request.id)}
                disabled={actionLoading === request.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {actionLoading === request.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Cancel'
                )}
              </button>
            </div>
          );
        })}
        
        {sentRequests.length === 0 && (
          <div className="text-center py-12">
            <Send className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No sent requests</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Start connecting with new people!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;