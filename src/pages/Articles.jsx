import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import CreateArticleModal from '../components/CreateArticleModal';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import PremiumUpgradePrompt from '../components/PremiumUpgradePrompt';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, BookOpen, X, TrendingUp, Menu, Home, 
  User, Settings, LogOut, Bell, MessageCircle, ArrowLeft
} from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import toast from 'react-hot-toast';

const Articles = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  
  // Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const handleModalClose = (created) => {
    setModalOpen(false);
    if (created) {
      setRefresh(r => !r);
      toast.success('Article created successfully!');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      {/* Sidebar - Fixed on desktop */}
      <Sidebar 
        onCreatePost={() => setIsPostModalOpen(true)}
        onCreateStory={() => setIsStoryModalOpen(true)}
        onCreateArticle={() => setModalOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content - Full screen on mobile, centered on desktop */}
      <main className="lg:ml-64 lg:mr-80 px-0 lg:px-6 py-4 sm:py-6 pb-20 lg:pb-6 bg-white dark:bg-gray-900 mt-16 sm:mt-20 lg:mt-8 min-h-screen">
        <div className="w-full lg:max-w-6xl lg:mx-auto">
          {/* Header Content */}
          <div className="bg-white dark:bg-gray-900">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Enhanced Header Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
                {/* Back Button */}
                <div className="mb-6">
                  
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                        Articles & Insights
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base mt-1">
                        Discover and share in-depth stories, guides, and insights from our community
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {user?.plan === 'PREMIUM' ? (
                      <button
                        onClick={() => setModalOpen(true)}
                        className="hidden md:flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors items-center gap-2 font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Article</span>
                      </button>
                    ) : (
                      <div className="hidden md:flex px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Premium Required</span>
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>

              {/* Premium Upgrade Prompt for non-premium users */}
              {user?.plan !== 'PREMIUM' && (
                <div className="mt-4 sm:mt-6">
                  <PremiumUpgradePrompt variant="card" />
                </div>
              )}

            </div>
          </div>

          {/* Latest Articles Section */}
          <div className="mt-6 sm:mt-8 mx-4 lg:mx-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Latest Articles
                </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Fresh insights and stories from our community
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate('/student-voices');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  View All Articles
                </button>
              </div>
              
              <ArticleList 
                key={`latest-${refresh}`}
                limit={3}
                sortBy="recent"
                viewMode="grid"
                onTotalChange={() => {}}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for mobile */}
      {user?.plan === 'PREMIUM' && (
        <div className="fixed bottom-20 right-4 z-50 md:hidden">
          <button
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md w-12 h-12 transition-colors"
            onClick={() => setModalOpen(true)}
            aria-label="Create Article"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
        <RightSidebar />
      </div>

      {/* Mobile Navigation - Using Sidebar */}
      <div className="lg:hidden">
        <Sidebar 
          onCreatePost={() => setIsPostModalOpen(true)}
          onCreateStory={() => setIsStoryModalOpen(true)}
          onCreateArticle={() => setModalOpen(true)}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
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

export default Articles;