import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Users, 
  UserCheck, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  UserX,
  Loader2,
  RefreshCw
} from 'lucide-react';
import userService from '../services/userService';
import friendService from '../services/friendService';
import toast from 'react-hot-toast';

const FindFriends = ({ type = 'suggested', hideTabs = false }) => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    searchQuery: '',
    searchResults: [],
    friendRequests: [],
    pendingRequests: [],
    suggestedFriends: [],
    activeTab: type || 'suggested',
    loading: false,
    searching: false,
    loadingSuggestions: false,
    error: null
  });

  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    if (hideTabs && type && type !== state.activeTab) {
      updateState({ activeTab: type });
    }
  }, [hideTabs, type]);

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadFriendRequests(),
        loadSuggestedFriends()
      ]);
    };
    loadInitialData();
  }, []);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const loadFriendRequests = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      const [receivedRes, sentRes] = await Promise.all([
        friendService.getFriendRequests('received'),
        friendService.getFriendRequests('sent')
      ]);
      
      updateState({
        friendRequests: Array.isArray(receivedRes) ? receivedRes : (receivedRes.data || receivedRes.requests || []),
        pendingRequests: Array.isArray(sentRes) ? sentRes : (sentRes.data || sentRes.requests || []),
        loading: false
      });
    } catch (error) {
      console.error('Error loading friend requests:', error);
      updateState({ 
        error: 'Failed to load friend requests',
        loading: false 
      });
    }
  }, [updateState]);

  const loadSuggestedFriends = useCallback(async () => {
    try {
      updateState({ loadingSuggestions: true, error: null });
      
      const response = await userService.getSuggestedFriends();
      const suggestions = response.data?.suggestions || response.suggestions || [];
      
      updateState({
        suggestedFriends: suggestions,
        loadingSuggestions: false
      });
    } catch (error) {
      console.error('Error loading suggested friends:', error);
      updateState({
        error: 'Failed to load suggestions',
        loadingSuggestions: false
      });
    }
  }, [updateState]);

  const searchSeqRef = React.useRef(0);
  const searchUsers = useCallback(async (query) => {
    query = (query || '').trim();
    const seq = ++searchSeqRef.current;
    if (query.replace(/^@+/, '').length < 2) {
      updateState({ searchResults: [] });
      return;
    }

    try {
      updateState({ searching: true, error: null });
      
      const response = await userService.searchUsers(query, 1, 20);
      if (seq !== searchSeqRef.current) return;
      updateState({
        searchResults: response.data?.users || response.users || [],
        searching: false
      });
    } catch (error) {
      console.error('Error searching users:', error);
      if (seq !== searchSeqRef.current) return;
      updateState({
        searchResults: [],
        searching: false,
        error: 'Search failed. Please try again.'
      });
    }
  }, [updateState]);

  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    updateState({ searchQuery: query });
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => searchUsers(query), 300);
    setSearchTimeout(timeout);
  }, [searchUsers, searchTimeout, updateState]);

  const sendFriendRequest = useCallback(async (userId) => {
    try {
      await friendService.sendFriendRequest(userId);
      toast.success('Friend request sent');
      
      updateState({
        searchResults: state.searchResults.map(user => 
          user.id === userId ? { ...user, requestStatus: 'pending' } : user
        ),
        suggestedFriends: state.suggestedFriends.map(user => 
          user.id === userId ? { ...user, requestStatus: 'pending' } : user
        )
      });
      
      await loadFriendRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      updateState({ error: 'Failed to send friend request' });
    }
  }, [state.searchResults, state.suggestedFriends, updateState, loadFriendRequests]);

  const acceptFriendRequest = useCallback(async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      toast.success('Friend request accepted');
      await Promise.all([loadFriendRequests(), loadSuggestedFriends()]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
      updateState({ error: 'Failed to accept friend request' });
    }
  }, [loadFriendRequests, loadSuggestedFriends, updateState]);

  const rejectFriendRequest = useCallback(async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      toast.success('Friend request declined');
      await loadFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to decline friend request');
      updateState({ error: 'Failed to reject friend request' });
    }
  }, [loadFriendRequests, updateState]);

  const cancelFriendRequest = useCallback(async (requestId) => {
    try {
      await friendService.cancelFriendRequest(requestId);
      toast.success('Friend request cancelled');
      await loadFriendRequests();
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Failed to cancel friend request');
      updateState({ error: 'Failed to cancel friend request' });
    }
  }, [loadFriendRequests, updateState]);

  const getRequestStatus = useCallback((userId) => {
    const pendingRequest = state.pendingRequests.find(req => {
      const receiver = req.receiver || req.user || {};
      return receiver.id === userId;
    });
    if (pendingRequest) return 'pending';
    
    const receivedRequest = state.friendRequests.find(req => {
      const sender = req.sender || req.user || {};
      return sender.id === userId;
    });
    if (receivedRequest) return 'received';
    
    return null;
  }, [state.pendingRequests, state.friendRequests]);

  const getUserAvatar = useCallback((user) => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';
    if (!user) return `https://ui-avatars.com/api/?name=Unknown&background=4f46e5&color=ffffff&size=128`;
    if (!user.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.username || 'Unknown')}&background=4f46e5&color=ffffff&size=128`;
    }
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  }, []);

  const tabs = useMemo(() => [
    {
      id: 'suggested',
      label: 'Suggested',
      icon: Sparkles,
      count: state.suggestedFriends.length,
    },
    {
      id: 'search',
      label: 'Find People',
      icon: Search,
      count: null,
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: UserCheck,
      count: state.friendRequests.length,
    },
    {
      id: 'sent',
      label: 'Sent',
      icon: Clock,
      count: state.pendingRequests.length,
    }
  ], [state.suggestedFriends.length, state.friendRequests.length, state.pendingRequests.length]);

  // User Card Component
  const UserCard = React.memo(({ user, showMutualFriends = false, showStatus = false, showInterests = false }) => {
    const requestStatus = getRequestStatus(user.id);
    
    return (
      <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={getUserAvatar(user)}
                alt={user.firstName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.username || 'User')}&background=4f46e5&color=ffffff&size=128`;
                }}
              />
              {showStatus && user.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 
                onClick={() => navigate(`/profile/${user.username}`)}
                className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate"
              >
                {user.firstName} {user.lastName}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">@{user.username}</p>
              
              {showMutualFriends && user.mutualFriends && (
                <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-500 mt-1">
                  <Users className="h-3 w-3" />
                  <span>{user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}</span>
                </div>
              )}
              
              {showStatus && user.lastSeen && (
                <p className="text-xs text-gray-600 dark:text-gray-500 flex items-center gap-1 mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  {user.lastSeen}
                </p>
              )}

              {showInterests && user.commonInterests && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.commonInterests.slice(0, 2).map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-500/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {requestStatus === 'pending' ? (
              <button
                onClick={() => {
                  const req = state.pendingRequests.find(req => {
                    const receiver = req.receiver || req.user || {};
                    return receiver.id === user.id;
                  });
                  if (req) cancelFriendRequest(req.id);
                }}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            ) : requestStatus === 'received' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const req = state.friendRequests.find(req => {
                      const sender = req.sender || req.user || {};
                      return sender.id === user.id;
                    });
                    if (req) acceptFriendRequest(req.id);
                  }}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Accept</span>
                </button>
                <button
                  onClick={() => {
                    const req = state.friendRequests.find(req => {
                      const sender = req.sender || req.user || {};
                      return sender.id === user.id;
                    });
                    if (req) rejectFriendRequest(req.id);
                  }}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-1.5"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Decline</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => sendFriendRequest(user.id)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Friend</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  });

  const LoadingState = ({ message = "Loading..." }) => (
    <div className="text-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );

  const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
    <div className="text-center py-12 sm:py-16">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{subtitle}</p>
      {action}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Banner */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400 font-medium">{state.error}</p>
          </div>
          <button
            onClick={() => updateState({ error: null })}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      {!hideTabs && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = state.activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => updateState({ activeTab: tab.id })}
                  className={`relative flex items-center justify-center px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-4 sm:space-y-6">
        
        {/* Suggested Friends Tab */}
        {state.activeTab === 'suggested' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Suggested Friends ({state.suggestedFriends.length})
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Discover people in your network
                  </p>
                </div>
              </div>
              
              <button
                onClick={loadSuggestedFriends}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                disabled={state.loadingSuggestions}
              >
                <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${state.loadingSuggestions ? 'animate-spin' : ''} transition-transform duration-300`} />
              </button>
            </div>
            
            {state.loadingSuggestions ? (
              <LoadingState message="Finding people for you..." />
            ) : state.suggestedFriends.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {state.suggestedFriends.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    showMutualFriends={true}
                    showStatus={true}
                    showInterests={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UserX}
                title="No suggestions available"
                subtitle="We couldn't find any suggestions for you right now. Try connecting with more people or check back later!"
                action={
                  <button
                    onClick={() => updateState({ activeTab: 'search' })}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium"
                  >
                    <Search className="h-4 w-4 mr-2 inline" />
                    Search People Instead
                  </button>
                }
              />
            )}
          </div>
        )}

        {/* Search Tab */}
        {state.activeTab === 'search' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Find People</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Search by name, username, or interests
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4 sm:mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by username, first name, or last name..."
                    value={state.searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                  {state.searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {state.searching && (
                <LoadingState message="Searching for people..." />
              )}

              {state.searchResults.length > 0 && !state.searching && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      Search Results ({state.searchResults.length})
                    </h4>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {state.searchResults.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {state.searchQuery.length >= 2 && !state.searching && state.searchResults.length === 0 && (
                <EmptyState
                  icon={AlertCircle}
                  title="No results found"
                  subtitle={`We couldn't find anyone matching "${state.searchQuery}". Try a different search term.`}
                />
              )}

              {state.searchQuery.length < 2 && (
                <div className="text-center py-8 sm:py-12">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Start searching</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type at least 2 characters to search for people</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Friend Requests Tab */}
        {state.activeTab === 'requests' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Friend Requests ({state.friendRequests.length})
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  People who want to connect with you
                </p>
              </div>
            </div>
            
            {state.loading ? (
              <LoadingState message="Loading friend requests..." />
            ) : state.friendRequests.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {state.friendRequests.map((request) => {
                  const sender = request.sender || request.user || {};
                  return (
                    <div key={request.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getUserAvatar(sender)}
                              alt={sender.firstName}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                              <UserPlus className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {sender.firstName} {sender.lastName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">@{sender.username}</p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                              Wants to be your friend
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs sm:text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(request.id)}
                            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={UserCheck}
                title="No pending requests"
                subtitle="You don't have any friend requests at the moment. Share your profile with others to get connected!"
              />
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {state.activeTab === 'sent' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Sent Requests ({state.pendingRequests.length})
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Friend requests you've sent
                </p>
              </div>
            </div>
            
            {state.pendingRequests.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {state.pendingRequests.map((request) => {
                  const receiver = request.receiver || request.user || {};
                  return (
                    <div key={request.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getUserAvatar(receiver)}
                              alt={receiver.firstName}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                              <Clock className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {receiver.firstName} {receiver.lastName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">@{receiver.username}</p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                              Request sent • Waiting for response
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => cancelFriendRequest(request.id)}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-1.5"
                        >
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title="No sent requests"
                subtitle="You haven't sent any friend requests recently. Start connecting with people from your suggestions or search!"
                action={
                  <button
                    onClick={() => updateState({ activeTab: 'suggested' })}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium"
                  >
                    <Sparkles className="h-4 w-4 mr-2 inline" />
                    View Suggestions
                  </button>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FindFriends);