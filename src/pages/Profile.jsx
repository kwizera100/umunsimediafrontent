import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import UserProfile from '../components/UserProfile';
import LoadingSpinner from '../components/LoadingSpinner';
import MobileNav from '../components/MobileNav';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import CreateArticleModal from '../components/CreateArticleModal';
import PremiumBanner from '../components/PremiumBanner';
import PublicProfile from './PublicProfile';

const Profile = () => {
  const { user, loading } = useAuth();
  
  // Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);

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

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      {/* Sidebar - Fixed on desktop */}
      <Sidebar 
        onCreatePost={() => setIsPostModalOpen(true)}
        onCreateStory={() => setIsStoryModalOpen(true)}
        onCreateArticle={() => setIsArticleModalOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content - Full width with proper spacing */}
      <main className="lg:ml-64 px-0 sm:px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2">Profile & Insights</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Manage your account and view detailed analytics</p>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="px-3 lg:px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Last updated:</span>
                  <span className="text-xs lg:text-sm text-gray-900 dark:text-white ml-1 lg:ml-2">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Banner */}
          <PremiumBanner user={user} />

          {/* User Profile (analytics & settings) — the real profile */}
          <UserProfile />

          {/* Public-style tabs (posts/reposts/articles/rewards/friends) below the profile */}
          {user?.username && (
            <PublicProfile username={user.username} embedded />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

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

export default Profile; 