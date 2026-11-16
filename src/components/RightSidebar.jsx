import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Flame, 
  UserPlus, 
  Bell, 
  Users, 
  TrendingUp, 
  Hash, 
  MoreHorizontal,
  Loader2,
  Star,
  ChevronRight,
  Sparkles,
  Crown,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import clubService from '../services/clubService';
import postService from '../services/postService';
import PostCard from './PostCard';
import userService from '../services/userService';
import friendService from '../services/friendService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import mediaHouseService from '../services/mediaHouseService';
import MediaHouseLogo from './MediaHouseLogo';
import { Building2 } from 'lucide-react';

const RightSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClubsPage = location.pathname.includes('/clubs');

  // State management
  const [popularClubs, setPopularClubs] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [clubMembersMap, setClubMembersMap] = useState({});
  const [clubMembershipMap, setClubMembershipMap] = useState({});
  const [clubPrivacyMap, setClubPrivacyMap] = useState({});
  const [clubRequestMap, setClubRequestMap] = useState({});
  // Sponsored posts (boosted)
  const [sponsoredPosts, setSponsoredPosts] = useState([]);
  const [sponsoredIndex, setSponsoredIndex] = useState(0);
  // Media House suggestions (rotating)
  const [suggestedMediaHouses, setSuggestedMediaHouses] = useState([]);

  const clubCategories = clubService.getClubCategories();

  useEffect(() => {
    loadPopularClubs();
    if (!isClubsPage) {
      loadSuggestedFriends();
    }
    // Load sponsored posts regardless of page
    loadSponsoredPosts();
    loadSuggestedMediaHouses();
  }, [isClubsPage]);

  // Rotate sponsored post periodically (desktop sidebar is persistent)
  useEffect(() => {
    if (!sponsoredPosts || sponsoredPosts.length <= 1) return;
    const interval = setInterval(() => {
      setSponsoredIndex((prev) => (prev + 1) % sponsoredPosts.length);
    }, 20000); // 20s rotation
    return () => clearInterval(interval);
  }, [sponsoredPosts]);

  const loadSuggestedMediaHouses = async () => {
    try {
      const res = await mediaHouseService.getSuggestedMediaHouses();
      setSuggestedMediaHouses(res.data || []);
    } catch {
      setSuggestedMediaHouses([]);
    }
  };

  const loadSponsoredPosts = async () => {
    try {
      const res = await postService.getPosts(1, 20);
      const now = new Date();
      const boosted = (res?.data?.posts || res?.posts || [])
        .filter(
          (p) =>
            p.isBoosted &&
            p.boostExpiresAt &&
            new Date(p.boostExpiresAt) > now
        );
      setSponsoredPosts(boosted);
      setSponsoredIndex(0);
    } catch (e) {
      setSponsoredPosts([]);
    }
  };

  const loadPopularClubs = async () => {
    try {
      setLoading(true);
      const response = await clubService.getAllClubs({ 
        limit: isClubsPage ? 4 : 3, 
        sortBy: 'members' 
      });
      
      if (response.data && response.data.clubs) {
        const clubs = response.data.clubs;
        setPopularClubs(clubs);
        // Track privacy and membership from API
        const membershipMap = {};
        const privacyMap = {};
        clubs.forEach((club) => {
          membershipMap[club.id] = !!club.isMember;
          privacyMap[club.id] = !!club.isPrivate;
        });
        setClubMembershipMap(membershipMap);
        setClubPrivacyMap(privacyMap);

        // Fetch members for all clubs to show member avatars
        const memberPromises = clubs.map(async (club) => {
            try {
              const membersRes = await clubService.getClubMembers(club.id, 1, 8);
              const members = membersRes.data?.members?.map(m => m.user || m) || membersRes.members || [];
              return { clubId: club.id, members };
            } catch {
              return { clubId: club.id, members: [] };
            }
          });
        const membersList = await Promise.all(memberPromises);
        const membersMap = {};
        membersList.forEach(({ clubId, members }) => { membersMap[clubId] = members; });
        setClubMembersMap(membersMap);
      }
    } catch (error) {
      console.error('Error loading popular clubs:', error);
      setPopularClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedFriends = async () => {
    try {
      setSuggestedLoading(true);
      const response = await userService.getSuggestedFriends?.();
      
      if (response?.data?.suggestions && response.data.suggestions.length > 0) {
        setSuggestedFriends(response.data.suggestions.slice(0, 4));
      } else {
        // If API doesn't exist, create some placeholder data
        setSuggestedFriends([]);
      }
    } catch (error) {
      console.error('Error loading suggested friends:', error);
      setSuggestedFriends([]);
    } finally {
      setSuggestedLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(clubId);
      const response = await clubService.joinClub(clubId);
      
      if (response.success) {
        // Private clubs return join request; public clubs join directly
        if (clubPrivacyMap[clubId]) {
          toast.success('Join request sent!');
          setClubRequestMap(prev => ({ ...prev, [clubId]: true }));
        } else {
        toast.success('Successfully joined the club!');
        await loadPopularClubs();
        }
      } else {
        toast.error(response.message || 'Failed to join club');
      }
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error(error.message || 'Failed to join club');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(userId);
      const response = await friendService.sendFriendRequest(userId);
      
      if (response?.success) {
        toast.success('Friend request sent!');
        // Update the user's status in the list
        setSuggestedFriends(prev => 
          prev.map(friend => 
            friend.id === userId 
              ? { ...friend, requestSent: true }
              : friend
          )
        );
      } else {
        toast.error(response?.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(error.message || 'Failed to send friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (isClubsPage) {
        navigate(`/clubs?search=${encodeURIComponent(searchTerm)}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const getCategoryIcon = (categoryValue) => {
    const category = clubCategories.find(cat => cat.value === categoryValue);
    return category?.emoji || '🏷️';
  };

  // Avatar handled by shared Avatar component

  const formatMemberCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatMutualFriends = (count) => {
    if (!count || count === 0) return 'No mutual friends';
    if (count === 1) return '1 mutual friend';
    return `${count} mutual friends`;
  };

  return (
    <aside className="w-full h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden lg:w-80 xl:w-96">
      {/* Professional Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              Discover
            </h2>
          </div>
          <button 
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {/* Professional Search */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isClubsPage ? "Search clubs..." : "Search..."}
              className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-150 hover:border-gray-300 dark:hover:border-gray-600"
            />
            {searchTerm && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Search"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Sponsored Posts */}
        {sponsoredPosts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sponsored
                </h3>
              </div>
            </div>
            <div className="p-0 bg-white dark:bg-gray-800">
              <PostCard post={sponsoredPosts[sponsoredIndex]} showUsername={false} />
            </div>
          </div>
        )}

        {/* Suggested Media Houses */}
        {suggestedMediaHouses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Media Houses</h3>
                </div>
                <button
                  onClick={() => navigate('/media-houses')}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {suggestedMediaHouses.slice(0, 4).map((mh) => (
                <div key={mh.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors" onClick={() => navigate('/media-houses/' + mh.id)}>
                  <MediaHouseLogo logo={mh.logo} name={mh.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{mh.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{mh.country || 'Media House'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular/Trending Clubs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {isClubsPage ? 'Popular Clubs' : 'Trending Clubs'}
                </h3>
              </div>
              {!isClubsPage && (
                <button
                  onClick={() => navigate('/clubs')}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  View all
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
              </div>
            ) : popularClubs.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No clubs available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularClubs.map((club, index) => (
                  <div 
                    key={club.id} 
                    className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all duration-150 cursor-pointer"
                    onClick={() => navigate(`/clubs/${club.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-base shadow-sm">
                          {getCategoryIcon(club.category)}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                            <Crown className="h-2 w-2 text-gray-900" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {club.name}
                          </h4>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatMemberCount(club._count?.members || club.memberCount || 0)} members
                          </span>
                          {club.isPrivate && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                              <Shield className="h-3 w-3" />
                              Private
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {Array.isArray(clubMembersMap[club.id]) && clubMembersMap[club.id].length > 0 ? (
                              <div className="flex -space-x-1.5">
                                {clubMembersMap[club.id].slice(0, 3).map((m, idx) => (
                                  <Avatar
                                    key={m.id || m.userId || m.username || m.email || idx}
                                    user={m}
                                    alt={m.firstName || m.username || 'Member'}
                                    className="w-5 h-5 ring-2 ring-white dark:ring-gray-800"
                                  />
                                ))}
                                {(club._count?.members || club.memberCount || 0) > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-gray-800 font-medium">
                                    +{(club._count?.members || club.memberCount || 0) - 3}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                          
                          {!clubMembershipMap[club.id] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinClub(club.id);
                              }}
                              disabled={actionLoading === club.id}
                              className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 border border-blue-200 dark:border-blue-800 hover:border-blue-600 dark:hover:border-blue-500"
                            >
                              {actionLoading === club.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="h-3 w-3" />
                                  Join
                                </>
                              )}
                            </button>
                          )}
                          {clubMembershipMap[club.id] && (
                            <span className="px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-md flex items-center gap-1 border border-green-200 dark:border-green-800/50">
                              <UserCheck className="h-3 w-3" />
                              Member
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Club Categories - Only show on clubs page */}
        {isClubsPage && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Categories
                </h3>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {clubCategories.slice(0, 6).map((category) => (
                <button
                  key={category.value}
                  onClick={() => navigate(`/clubs?category=${category.value}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{category.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                      {category.label}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </button>
              ))}
              <button 
                onClick={() => navigate('/clubs')}
                className="w-full mt-2 p-2.5 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700"
              >
                View All Categories
              </button>
            </div>
          </div>
        )}

        {/* Suggested Friends - Only show on home page */}
        {!isClubsPage && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    People You May Know
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/friends')}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  See all
                </button>
              </div>
            </div>
            
            <div className="p-3">
              {suggestedLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
                </div>
              ) : suggestedFriends.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No suggestions</p>
                  <button
                    onClick={() => navigate('/friends')}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestedFriends.map((friend) => (
                    <div 
                      key={friend.id} 
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <div 
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
                        onClick={() => navigate(`/profile/${friend.username}`)}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar 
                            user={friend}
                            alt={friend.firstName || friend.name} 
                            className="w-9 h-9 ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-300 dark:group-hover:ring-gray-600 transition-all"
                          />
                          {friend.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {friend.firstName && friend.lastName 
                              ? `${friend.firstName} ${friend.lastName}`
                              : friend.name || friend.username
                            }
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {friend.mutualFriends 
                              ? formatMutualFriends(friend.mutualFriends)
                              : friend.location || `@${friend.username}`
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-2">
                        {friend.requestSent ? (
                          <span className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center gap-1 border border-gray-200 dark:border-gray-600">
                            <UserCheck className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendFriendRequest(friend.id);
                            }}
                            disabled={actionLoading === friend.id}
                            className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 border border-blue-200 dark:border-blue-800 hover:border-blue-600 dark:hover:border-blue-500"
                          >
                            {actionLoading === friend.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3" />
                                Add
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Professional Footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <div className="font-medium text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} UmunsiMedia
          </div>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => navigate('/privacy')}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy
            </button>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <button 
              onClick={() => navigate('/terms')}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Terms
            </button>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <button 
              onClick={() => navigate('/help')}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Help
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.4);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.6);
          }
        }
      `}</style>
    </aside>
  );
};

export default RightSidebar;