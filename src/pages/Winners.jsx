import React, { useState, useEffect } from 'react';
import { Trophy, Award, FileText, Calendar, AlertCircle, Target, BookOpen, RefreshCw } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import LoadingSpinner from '../components/LoadingSpinner';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import CreateArticleModal from '../components/CreateArticleModal';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const Winners = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/announcements`);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'reward': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'badge': return <Award className="h-5 w-5 text-blue-500" />;
      case 'certificate': return <FileText className="h-5 w-5 text-green-500" />;
      default: return <Trophy className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'reward': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'badge': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'certificate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
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
        <main className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
          <LoadingSpinner size="xl" text="Loading winners..." />
        </main>
        <MobileNav />
      </div>
    );
  }

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
        <main className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Winners</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button 
                onClick={fetchAnnouncements}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

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

      <main className="lg:ml-64 px-0 sm:px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  Winners & Achievements
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Celebrate the achievements of our community members. From writing excellence to outstanding contributions, see who's making an impact.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6 p-4 sm:p-6">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {[
                { id: 'all', label: 'All Achievements', icon: Trophy },
                { id: 'reward', label: 'Rewards', icon: Trophy },
                { id: 'badge', label: 'Badges', icon: Award },
                { id: 'certificate', label: 'Certificates', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                    filter === id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Announcements Grid */}
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No {filter === 'all' ? 'achievements' : filter + 's'} yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {filter === 'all' 
                  ? 'Be the first to earn an achievement!' 
                  : `No ${filter}s have been awarded yet.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-200 flex flex-col"
                >
                  {/* Header */}
                  <div className="p-4 sm:p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {getIcon(announcement.type)}
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTypeColor(announcement.type)}`}>
                          {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                        <span className="sm:hidden">{new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {announcement.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {announcement.content}
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                        {announcement.user?.firstName?.charAt(0)}{announcement.user?.lastName?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {announcement.user?.firstName} {announcement.user?.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{announcement.user?.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Article Link if available */}
                  {announcement.article && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <Link
                        to={`/articles/${announcement.article.slug}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">Read article: "{announcement.article.title}"</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {announcements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-6 sm:mt-8">
              <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {announcements.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Achievements</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                      {announcements.filter(a => a.type === 'reward').length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rewards</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {announcements.filter(a => a.type === 'badge').length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Badges</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {announcements.filter(a => a.type === 'certificate').length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Certificates</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileNav />

      {/* Modals */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        onSave={() => setIsPostModalOpen(false)}
      />
      <CreateStoryModal 
        isOpen={isStoryModalOpen} 
        onClose={() => setIsStoryModalOpen(false)}
        onSave={() => setIsStoryModalOpen(false)}
      />
      <CreateArticleModal 
        isOpen={isArticleModalOpen} 
        onClose={() => setIsArticleModalOpen(false)}
        onSave={() => setIsArticleModalOpen(false)}
      />
    </div>
  );
};

export default Winners;
