import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Eye, Heart, MessageCircle, Calendar, Filter, Search, Plus, Menu, Home, User, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import CreateArticleModal from './CreateArticleModal';
import CreatePostModal from './CreatePostModal';
import CreateStoryModal from './CreateStoryModal';
import Badge from './Badge';
import badgeService from '../services/badgeService';
import UserDisplay from './UserDisplay';
import toast from 'react-hot-toast';
import Logo from '../assets/Logo.png';

// Helper functions for category styling
const getCategoryColor = (categoryName) => {
  const colors = {
    'Academic Topics': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Inspirational Essays': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Creative Writing': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'Community Service': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'School Life': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  };
  return colors[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
};

const getCategoryIcon = (categoryName) => {
  const icons = {
    'Academic Topics': '📚',
    'Inspirational Essays': '💡',
    'Creative Writing': '✍️',
    'Community Service': '🤝',
    'School Life': '🏫',
  };
  return icons[categoryName] || '📄';
};

// Article Card Component with badge support
const ArticleCard = ({ article }) => {
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // Load badges and rewards for this article
  useEffect(() => {
    const loadBadgesAndRewards = async () => {
      try {
        setLoadingBadges(true);
        const [badgesData, rewardsData] = await Promise.all([
          badgeService.getArticleBadges(article.id),
          badgeService.getArticleRewards(article.id)
        ]);
        
        const processedBadges = badgesData.map(item => item.badge || item) || [];
        const processedRewards = rewardsData.map(item => item.reward || item) || [];
        
        setBadges(processedBadges);
        setRewards(processedRewards);
      } catch (error) {
        console.error('Error loading badges:', error);
        setBadges([]);
        setRewards([]);
      } finally {
        setLoadingBadges(false);
      }
    };

    loadBadgesAndRewards();
  }, [article.id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
      {/* Article Image */}
      {article.image && (
        <div className="aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Category Badge */}
        {article.category && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category.name)}`}>
              {getCategoryIcon(article.category.name)} {article.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Badges and Rewards Display */}
        {!loadingBadges && (badges.length > 0 || rewards.length > 0) && (
          <div className="flex items-center gap-2 mb-3">
            {badges.slice(0, 3).map((badge, index) => (
              <Badge 
                key={`badge-${index}`} 
                badge={badge} 
                size="sm" 
                animated={badge.type === 'EDITORS_CHOICE' || badge.type === 'TRENDING'}
              />
            ))}
            {rewards.slice(0, 2).map((reward, index) => (
              <Badge 
                key={`reward-${index}`} 
                badge={reward} 
                size="sm" 
                animated={true}
              />
            ))}
            {(badges.length > 3 || rewards.length > 2) && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                +{(badges.length - 3) + (rewards.length - 2)} more
              </span>
            )}
          </div>
        )}

        {/* Content Preview */}
        <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {article.content ? (
            <div dangerouslySetInnerHTML={{
              __html: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + (article.content.length > 150 ? '...' : '')
            }} />
          ) : (
            <span className="text-gray-400 italic">No preview available</span>
          )}
        </div>

        {/* Author */}
        <div className="mb-4">
          <UserDisplay 
            user={article.author} 
            size="md"
            showVerification={true}
            linkToProfile={true}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link 
            to={`/articles/${article.id}`}
            className="flex items-center hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <Heart className="h-4 w-4 mr-1" />
            <span>{article.likeCount || 0}</span>
          </Link>
          <Link 
            to={`/articles/${article.id}`}
            className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>{article.commentCount || 0}</span>
          </Link>
          <span className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {article.views || 0}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(article.createdAt).toLocaleDateString()}
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <Link 
            to={`/articles/${article.id}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center"
          >
            Read Article
          </Link>
        </div>
      </div>
    </div>
  );
};

const StudentVoicesJournal = () => {
  const { user, logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, sortBy]);

  // Modal handlers
  const handleCreatePost = (postData) => {
    console.log('Post created:', postData);
    setIsPostModalOpen(false);
  };

  const handleCreateStory = async (storyData) => {
    try {
      setIsCreatingStory(true);
      console.log('Story created:', storyData);
      setIsStoryModalOpen(false);
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsCreatingStory(false);
    }
  };

  const handleModalClose = (created) => {
    setModalOpen(false);
    if (created) {
      fetchData(); // Refresh articles
      toast.success('Article created successfully!');
    }
  };

  const fetchData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/articles`),
        fetch(`${API_URL}/rewards/categories`)
      ]);

      const [articlesData, categoriesData] = await Promise.all([
        articlesRes.json(),
        categoriesRes.json()
      ]);

      setArticles(articlesData);
      setCategories(categoriesData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await fetch(`${API_URL}/articles?${params}`);
      const data = await response.json();
      setArticles(data);

    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Academic Topics': '📚',
      'School Life': '🏫',
      'Student Achievements': '🏆',
      'Community Service': '🤝',
      'Inspirational Essays': '💡',
      'Creative Writing': '✍️'
    };
    return iconMap[categoryName] || '📄';
  };

  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'Academic Topics': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'School Life': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Student Achievements': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Community Service': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Inspirational Essays': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Creative Writing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 dark:bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Fixed Desktop Navigation */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </div>

      {/* Fixed Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50"
            >
              <img src={Logo} alt="App Logo" className="w-8 h-8 rounded object-contain" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">All Articles</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user?.plan === 'PREMIUM' && (
              <button
                onClick={() => setModalOpen(true)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-gray-900 dark:text-white text-xs font-bold">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-800/98 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-50">
              <div className="p-4 space-y-2">
                <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  Dashboard
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-3">
                  <User className="h-5 w-5" />
                  Profile
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  Settings
                </button>
                <div className="border-t border-gray-700/50 pt-2">
                  <button 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 pt-16 md:pt-20 relative z-10">
        {/* Fixed Left Sidebar - Desktop only */}
        <div className="hidden md:block fixed left-0 top-20 bottom-0 w-64 z-40">
          <Sidebar 
            onCreatePost={() => setIsPostModalOpen(true)}
            onCreateStory={() => setIsStoryModalOpen(true)}
            onCreateArticle={() => setModalOpen(true)}
          />
        </div>


        {/* Main Content Area with proper margins for fixed sidebars */}
        <div className="flex-1 md:ml-64 relative">
          {/* Header Content */}
          <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="p-4 lg:p-6 space-y-6">
              {/* Enhanced Header Section */}
              <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800/95 dark:via-gray-700/95 dark:to-gray-800/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-gray-200 dark:border-gray-700/50 p-6 lg:p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-blue-100 dark:to-purple-200">
                        All Articles
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base mt-1">
                        📚 Browse through all articles, stories, and insights shared by our community
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {user?.plan === 'PREMIUM' ? (
                      <button
                        onClick={() => setModalOpen(true)}
                        className="hidden md:flex px-4 py-1 lg:px-6 lg:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 items-center gap-2 font-medium shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                      >
                        <Plus className="h-1 w-2 lg:h-3 lg:w-5" />
                        <span className="hidden sm:inline">Create Article</span>
                        <span className="sm:hidden">Create</span>
                      </button>
                    ) : (
                      <div className="hidden md:flex px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl border border-yellow-500/30 items-center gap-2">
                        <span className="text-yellow-400 text-sm font-medium">Premium Required</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content with proper spacing for fixed header */}
          <div className="mt-8 mx-4 lg:mx-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getCategoryIcon(category.name)} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score">Highest Score</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* No Articles Message */}
      {filteredArticles.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search criteria'
              : 'Be the first to publish an article!'
            }
          </p>
        </div>
      )}
          </div>
        </div>
      </div>

      {/* Enhanced Floating Action Button for mobile */}
      {user?.plan === 'PREMIUM' && (
        <div className="fixed bottom-20 right-6 z-50 md:hidden">
          <button
            className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg w-14 h-14 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-blue-500/50"
            onClick={() => setModalOpen(true)}
            aria-label="Create Article"
          >
            <Plus className="h-6 w-6" />
          </button>
          <div className="absolute -top-12 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-900 dark:text-white text-xs px-3 py-1 rounded-lg border border-gray-300/50 dark:border-gray-600/50 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Create Article
          </div>
        </div>
      )}

      {/* Mobile Navigation - Using Sidebar */}
      <div className="lg:hidden">
        <Sidebar 
          onCreatePost={() => setIsPostModalOpen(true)}
          onCreateStory={() => setIsStoryModalOpen(true)}
          onCreateArticle={() => setModalOpen(true)}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Modals */}
      <CreateArticleModal isOpen={modalOpen} onClose={handleModalClose} />
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
    </div>
  );
};

export default StudentVoicesJournal;
