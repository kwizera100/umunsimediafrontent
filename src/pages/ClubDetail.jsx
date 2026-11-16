import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, Calendar, MoreVertical, Image as ImageIcon, Send, Settings, Hash, Eye, EyeOff, Crown, Shield, X, UserPlus, UserX } from 'lucide-react';
import Logo from '../assets/Logo.png';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import ClubManagement from '../components/ClubManagement';
import ClubPost from '../components/ClubPost';
import BadgeDisplay from '../components/BadgeDisplay';
import clubService from '../services/clubService';
import badgeService from '../services/badgeService';
import toast from 'react-hot-toast';

const ClubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchClubData();
  }, [id]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const [clubResponse, postsResponse] = await Promise.all([
        clubService.getClubById(id),
        clubService.getClubPosts(id)
      ]);
      
      setClub(clubResponse.data);
      setPosts(postsResponse.data.posts);
      
      // Load badges and rewards for the club
      loadClubBadgesAndRewards(clubResponse.data);
    } catch (error) {
      console.error('Error fetching club data:', error);
      toast.error('Failed to load club data');
    } finally {
      setLoading(false);
    }
  };

  const loadClubBadgesAndRewards = async (clubData) => {
    try {
      setLoadingBadges(true);
      const [badgesData, rewardsData] = await Promise.all([
        badgeService.getClubBadges(clubData.id),
        badgeService.getClubRewards(clubData.id)
      ]);
      setBadges(badgesData.map(item => item.badge || item) || []);
      setRewards(rewardsData.map(item => item.reward || item) || []);
    } catch (error) {
      console.error('Error loading club badges:', error);
      setBadges([]);
      setRewards([]);
    } finally {
      setLoadingBadges(false);
    }
  };

  const handleJoinClub = async () => {
    try {
      const response = await clubService.joinClub(id);
      
      // Check if it's a private club (join request) or public (direct join)
      if (response.data && response.message && response.message.includes('request')) {
        toast.success('Join request sent. Waiting for approval.', {
          duration: 4000,
        });
      } else {
        toast.success('Successfully joined the club!', {
          duration: 3000,
        });
      }
      
      fetchClubData(); // Refresh club data
    } catch (error) {
      console.error('Error joining club:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to join club';
      toast.error(errorMessage, {
        duration: 4000,
      });
    }
  };

  const handleLeaveClub = async () => {
    try {
      await clubService.leaveClub(id);
      toast.success('👋 Successfully left the club');
      fetchClubData(); // Refresh club data
    } catch (error) {
      console.error('Error leaving club:', error);
      toast.error(error.message || 'Failed to leave club');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('🚫 Image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('🚫 Please select an image file');
        return;
      }

      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPostImage(null);
    setPostImagePreview(null);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) {
      toast.error('🚫 Please enter some content');
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        content: newPost,
        image: postImage
      };
      
      await clubService.createClubPost(id, postData);
      setNewPost('');
      setPostImage(null);
      setPostImagePreview(null);
      toast.success('🎉 Post created successfully!');
      fetchClubData(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || '❌ Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const categories = clubService.getClubCategories();
    const cat = categories.find(c => c.value === category);
    return cat ? cat.emoji : '🏢';
  };

  const getCategoryLabel = (category) => {
    const categories = clubService.getClubCategories();
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const handlePostUpdate = () => {
    fetchClubData(); // Refresh posts when a post is updated
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-6 w-6 text-purple-400" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Club Detail</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Mobile slide-in, Desktop fixed */}
        <Sidebar 
          onCreatePost={() => {}}
          onCreateStory={() => {}}
          onCreateArticle={() => {}}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="lg:ml-64 lg:mr-80 px-0 sm:px-4 lg:px-6 pt-20 lg:pt-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto">
            {/* Loading Content */}
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">✨ Loading amazing club content...</p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Desktop */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
          <RightSidebar />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-6 w-6 text-purple-400" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Club Detail</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Mobile slide-in, Desktop fixed */}
        <Sidebar 
          onCreatePost={() => {}}
          onCreateStory={() => {}}
          onCreateArticle={() => {}}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="lg:ml-64 lg:mr-80 px-0 sm:px-4 lg:px-6 pt-20 lg:pt-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto">
            {/* Error Content */}
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Hash className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🚫 Club not found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">The club you're looking for doesn't exist or has been removed.</p>
                <Link
                  to="/clubs"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  🏠 Back to Clubs
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Desktop */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
          <RightSidebar />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      {/* Mobile Header */}
      
      
      {/* Sidebar - Mobile slide-in, Desktop fixed */}
      <Sidebar 
        onCreatePost={() => {}}
        onCreateStory={() => {}}
        onCreateArticle={() => {}}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 lg:mr-80 px-0 sm:px-4 lg:px-6 pt-24 lg:pt-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="w-full max-w-4xl mx-auto overflow-y-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white text-sm sm:text-lg flex-shrink-0">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      {club.name}
                    </h1>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                      <span className="truncate">{getCategoryLabel(club.category)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {club._count?.members || 0} members
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end mt-4 sm:mt-0">
                {!club.isMember ? (
                  <button
                    onClick={handleJoinClub}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Join Club</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveClub}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Leave</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
              {/* Enhanced Club Hero Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <Users className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded flex items-center space-x-1.5 border ${
                      club.isPrivate 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                    }`}>
                      {club.isPrivate ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{club.isPrivate ? 'Private' : 'Public'}</span>
                    </span>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600">
                      {getCategoryLabel(club.category)}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                      {club.name}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{club.description}</p>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">{club._count?.members || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">{club._count?.posts || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                        {new Date(club.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Created</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements & Rewards Section */}
              {!loadingBadges && (badges.length > 0 || rewards.length > 0) && (
                <div className="mt-6">
                  <BadgeDisplay 
                    badges={badges}
                    rewards={rewards}
                    title="Club Achievements & Rewards"
                    layout="grid"
                    size="md"
                    maxVisible={6}
                    showAll={true}
                    onBadgeClick={(badge) => {
                      // Handle badge click - could open a modal with details
                      console.log('Badge clicked:', badge);
                    }}
                  />
                </div>
              )}

              {/* Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-4 sm:space-x-6 px-4 sm:px-6 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('posts')}
                      className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center transition-colors duration-200 whitespace-nowrap ${
                        activeTab === 'posts'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      Posts
                    </button>
                    {club.isMember && (club.userRole === 'owner' || club.userRole === 'admin') && (
                      <button
                        onClick={() => setActiveTab('management')}
                        className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center transition-colors duration-200 whitespace-nowrap ${
                          activeTab === 'management'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                      >
                        {club.userRole === 'owner' ? <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> : <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />}
                        Management
                      </button>
                    )}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'posts' && (
                <>
                  {/* Create Post */}
                  {club.isMember && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="p-4 sm:p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            Share with your club
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Express your thoughts and connect with your community</p>
                        </div>
                        <form onSubmit={handleSubmitPost} className="space-y-4">
                          <div className="relative">
                            <textarea
                              value={newPost}
                              onChange={(e) => setNewPost(e.target.value)}
                              placeholder="What's on your mind? Share your thoughts, ideas, or updates with your club members..."
                              className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-sm leading-relaxed"
                              rows={4}
                              maxLength={1000}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-600 dark:text-gray-500">
                              {newPost.length}/1000
                            </div>
                          </div>
                          
                          {postImagePreview && (
                            <div className="relative inline-block">
                              <img
                                src={postImagePreview}
                                alt="Preview"
                                className="h-40 w-40 object-cover rounded-xl border border-gray-300 dark:border-gray-600/50 shadow-lg"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all duration-200 hover:scale-110 shadow-lg"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700/30">
                            <div className="flex items-center gap-3">
                              <label className="cursor-pointer p-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded-lg transition-all duration-200 hover:scale-105">
                                <ImageIcon className="h-5 w-5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                />
                              </label>
                              <span className="text-xs text-gray-600 dark:text-gray-500">📸 Add image (max 5MB)</span>
                            </div>
                            <button
                              type="submit"
                              disabled={submitting || !newPost.trim()}
                              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                              <Send className="h-4 w-4" />
                              <span>{submitting ? 'Posting...' : 'Share Post'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
                          {club.isMember 
                            ? 'Be the first to share something with your club community'
                            : 'Join the club to see posts and start engaging with fellow members'
                          }
                        </p>
                        {club.isMember && (
                          <button
                            onClick={() => document.querySelector('textarea')?.focus()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                          >
                            Create First Post
                          </button>
                        )}
                      </div>
                    ) : (
                      posts.map((post) => (
                        <ClubPost 
                          key={post.id} 
                          post={post} 
                          clubId={id}
                          onUpdate={handlePostUpdate}
                          isMember={club.isMember}
                        />
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === 'management' && (
                <ClubManagement club={club} onUpdate={fetchClubData} />
              )}
          </div>
        </div>
      </main>

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
        <RightSidebar />
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }
      `}</style>
    </div>
  );
};

export default ClubDetail;