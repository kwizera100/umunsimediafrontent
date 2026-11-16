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
          {/* Premium Banner */}
          <PremiumBanner user={user} />

          {/* User Profile (analytics & settings) — the real profile */}
          <UserProfile />
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