import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  MessageSquare, 
  Calendar, 
  Hash, 
  MoreHorizontal,
  Star,
  Globe,
  Lock,
  TrendingUp,
  Sparkles,
  Heart,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import clubService from '../services/clubService';
import CreateClubModal from '../components/CreateClubModal';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import CreateArticleModal from '../components/CreateArticleModal';
import toast from 'react-hot-toast';
import Logo from '../assets/Logo.png';

const Clubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('newest'); // newest, popular, members
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const categories = clubService.getClubCategories();

  useEffect(() => {
    fetchClubs();
  }, [searchTerm, selectedCategory, pagination.page, sortBy]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        category: selectedCategory,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortBy
      };
      
      const response = await clubService.getAllClubs(filters);
      setClubs(response.data.clubs || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      const response = await clubService.joinClub(clubId);
      
      // Check if it's a private club (join request) or public (direct join)
      if (response.data && response.message && (response.message.includes('request') || response.message.includes('pending'))) {
        toast.success('Join request sent. Waiting for approval.', {
          duration: 4000,
        });
        return { message: 'request' };
      } else {
        toast.success('Successfully joined the club!', {
          duration: 3000,
        });
        return { message: 'joined' };
      }
    } catch (error) {
      console.error('Error joining club:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to join club';
      toast.error(errorMessage, {
        duration: 4000,
      });
      throw error;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryEmoji = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.emoji : '🏢';
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading && clubs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50"
              >
                <img src={Logo} alt="App Logo" className="w-8 h-8 rounded object-contain" />
              </button>
              <div className="flex items-center gap-2">
                <Hash className="h-6 w-6 text-purple-400" />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Clubs</h1>
              </div>
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
          onCreatePost={() => setIsPostModalOpen(true)}
          onCreateStory={() => setIsStoryModalOpen(true)}
          onCreateArticle={() => setIsArticleModalOpen(true)}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="lg:ml-64 lg:mr-80 px-0 sm:px-4 lg:px-6 pt-20 lg:pt-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="w-full max-w-4xl mx-auto">
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
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Clubs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Discover and join communities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Hash className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-blue-600/30 animate-ping"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Loading amazing clubs...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">✨ Please wait while we fetch the communities</p>
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
        onCreatePost={() => setIsPostModalOpen(true)}
        onCreateStory={() => setIsStoryModalOpen(true)}
        onCreateArticle={() => setIsArticleModalOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 lg:mr-80 px-0 sm:px-4 lg:px-6 pt-20 lg:pt-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="w-full max-w-4xl mx-auto">
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
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Clubs
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Discover and join communities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Club Button */}
          <div className="mb-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Club</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </form>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* Category Filter */}
                <div className="flex-1 min-w-[140px] sm:min-w-0 sm:flex-initial">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full sm:w-48 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="flex-1 min-w-[120px] sm:min-w-0 sm:flex-initial">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full sm:w-40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="members">Most Members</option>
                    <option value="active">Most Active</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <div className="w-3 h-0.5 sm:w-4 sm:h-0.5 bg-current rounded"></div>
                      <div className="w-3 h-0.5 sm:w-4 sm:h-0.5 bg-current rounded"></div>
                      <div className="w-3 h-0.5 sm:w-4 sm:h-0.5 bg-current rounded"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clubs Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6">
              {/* Stats Bar */}
              {clubs.length > 0 && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center justify-between sm:justify-start space-x-4 sm:space-x-6 flex-1">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{pagination.total}</div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400">{clubs.filter(c => !c.isPrivate).length}</div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Public</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-semibold text-green-600 dark:text-green-400">{clubs.filter(c => c.isMember).length}</div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Joined</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-end text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span>Page {pagination.page} of {pagination.pages}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Clubs Grid/List */}
              {clubs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="mb-6">
                    <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No clubs found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm max-w-md mx-auto">
                    {searchTerm || selectedCategory 
                      ? 'Try adjusting your search or filters to discover communities'
                      : 'Be the first to create a club and build your community'
                    }
                  </p>
                  {!searchTerm && !selectedCategory && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create First Club
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
    {clubs.map((club) => (
      <ClubCard 
        key={club.id} 
        club={club} 
        onJoin={handleJoinClub}
        getCategoryEmoji={getCategoryEmoji}
        getCategoryLabel={getCategoryLabel}
        formatMemberCount={formatMemberCount}
      />
    ))}
  </div>
              ) : (
                <div className="space-y-4">
                  {clubs.map((club) => (
                    <ClubListItem 
                      key={club.id} 
                      club={club} 
                      onJoin={handleJoinClub}
                      getCategoryEmoji={getCategoryEmoji}
                      getCategoryLabel={getCategoryLabel}
                      formatMemberCount={formatMemberCount}
                    />
                  ))}
                </div>
              )}

              {/* Enhanced Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      ← Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + Math.max(1, pagination.page - 2);
                        if (page > pagination.pages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
        <RightSidebar />
      </div>

      {/* Create Club Modal */}
      {showCreateModal && (
        <CreateClubModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClubs();
            toast.success('Club created successfully!');
          }}
        />
      )}

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
    </div>
  );
};

// Enhanced Club Card Component - Consistent Height
const ClubCard = ({ club, onJoin, getCategoryEmoji, getCategoryLabel, formatMemberCount }) => {
  const BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState(club.hasPendingRequest ? 'pending' : null);
  
  const getAvatarUrl = (user) => {
    if (!user?.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&background=4f46e5&color=ffffff&size=64`;
    }
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  };

  const handleJoinClick = async () => {
    if (isJoining || club.isMember || joinStatus === 'pending' || club.hasPendingRequest) return;
    
    setIsJoining(true);
    try {
      const response = await onJoin(club.id);
      // Check if it's a private club (pending request) or public (joined)
      if (club.isPrivate || (response?.message && response.message.includes('request'))) {
        setJoinStatus('pending');
      } else {
        setJoinStatus('joined');
      }
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsJoining(false);
    }
  };

  const getJoinButtonContent = () => {
    if (club.isMember || joinStatus === 'joined') {
      return (
        <div className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-green-700 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Joined
        </div>
      );
    }
    
    if (joinStatus === 'pending' || club.hasPendingRequest) {
      return (
        <div className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-600 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
          Pending
        </div>
      );
    }
    
    return (
      <button
        onClick={handleJoinClick}
        disabled={isJoining}
        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoining ? 'Joining...' : 'Join'}
      </button>
    );
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Club Header - Fixed Height */}
      <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
        {club.image ? (
          <img
            src={club.image.startsWith('http') ? club.image : `${BASE_URL}/${club.image}`}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback background */}
        <div className={`w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${club.image ? 'hidden' : 'flex'}`}>
          <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 backdrop-blur-sm">
            <span className="truncate max-w-[100px] sm:max-w-none">{getCategoryLabel(club.category)}</span>
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded backdrop-blur-sm ${
            club.isPrivate 
              ? 'bg-red-100/90 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700' 
              : 'bg-green-100/90 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
          }`}>
            {club.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>

        {/* Member status indicator */}
        {(club.isMember || joinStatus === 'joined') && (
          <div className="absolute bottom-2 right-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content - Flexible but consistent */}
      <div className="p-4 flex-1 flex flex-col space-y-3 min-h-[200px]">
        {/* Title and Description */}
        <div className="flex-1 min-h-[60px]">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
            {club.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {club.description || 'Join this community to connect with like-minded people'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-1">
            <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {formatMemberCount(club._count?.members || club.memberCount || 0)}
            </span>
          </div>
          
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-1">
            <MessageSquare className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {club._count?.posts || club.postCount || 0}
            </span>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div className="relative flex-shrink-0">
            <img
              src={getAvatarUrl(club.owner)}
              alt={club.owner?.firstName}
              className="w-7 h-7 rounded-full border-2 border-blue-200 dark:border-blue-700 object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(club.owner?.firstName || 'Owner')}&background=4f46e5&color=ffffff&size=32`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
              {club.owner?.firstName} {club.owner?.lastName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Owner
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <Link
            to={`/clubs/${club.id}`}
            className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          >
            View
          </Link>
          
          {getJoinButtonContent()}
        </div>
      </div>
    </div>
  );
};

// Club List Item Component
const ClubListItem = ({ club, onJoin, getCategoryEmoji, getCategoryLabel, formatMemberCount }) => {
  const BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState(club.hasPendingRequest ? 'pending' : null);
  
  const getAvatarUrl = (user) => {
    if (!user?.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&background=4f46e5&color=ffffff&size=64`;
    }
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  };

  const handleJoinClick = async () => {
    if (isJoining || club.isMember || joinStatus === 'pending' || club.hasPendingRequest) return;
    
    setIsJoining(true);
    try {
      const response = await onJoin(club.id);
      if (club.isPrivate || (response?.message && response.message.includes('request'))) {
        setJoinStatus('pending');
      } else {
        setJoinStatus('joined');
      }
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsJoining(false);
    }
  };

  const getJoinButtonContent = () => {
    if (club.isMember || joinStatus === 'joined') {
      return (
        <span className="px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20">
          Member
        </span>
      );
    }
    
    if (joinStatus === 'pending' || club.hasPendingRequest) {
      return (
        <span className="px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-600 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1" />
          Pending
        </span>
      );
    }
    
    return (
      <button
        onClick={handleJoinClick}
        disabled={isJoining}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoining ? 'Joining...' : 'Join'}
      </button>
    );
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Club Image */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {club.image ? (
              <img
                src={club.image.startsWith('http') ? club.image : `${BASE_URL}/${club.image}`}
                alt={club.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          
          {/* Status indicator */}
          <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${
            club.isPrivate ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {club.isPrivate ? <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" /> : <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />}
          </div>
        </div>

        {/* Club Info */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 truncate">
                {club.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                {club.description || 'Join this community to connect with like-minded people'}
              </p>
              
              {/* Stats and Category */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
                <span className="flex items-center text-blue-600 dark:text-blue-400">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  {formatMemberCount(club._count?.members || club.memberCount || 0)} members
                </span>
                <span className="flex items-center text-purple-600 dark:text-purple-400">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  {club._count?.posts || club.postCount || 0} posts
                </span>
                <span className="flex items-center text-gray-600 dark:text-gray-400">
                  {getCategoryLabel(club.category)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                to={`/clubs/${club.id}`}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
              >
                View
              </Link>
              
              {getJoinButtonContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clubs;