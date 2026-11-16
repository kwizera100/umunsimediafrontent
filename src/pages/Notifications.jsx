import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from '../components/NotificationItem';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAllAsRead,
    loadUnreadCount
  } = useNotifications();

  const [page, setPage] = useState(1);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadNotifications(page, 20, showUnreadOnly);
  }, [page, showUnreadOnly]);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleFilterChange = (unreadOnly) => {
    setShowUnreadOnly(unreadOnly);
    setPage(1);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm) {
      return notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const displayNotifications = showUnreadOnly 
    ? filteredNotifications.filter(n => !n.isRead)
    : filteredNotifications;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      </div>

      <div className="flex pt-16">
        {/* Sidebar - Mobile slide-in, Desktop fixed */}
        <Sidebar 
          onCreatePost={() => {}}
          onCreateStory={() => {}}
          onCreateArticle={() => {}}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 lg:mr-80">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            {/* Back Button */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Back to Home</span>
              </button>
            </div>
            
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Notifications
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {unreadCount} unread notifications
                    </p>
                  </div>
                </div>
                
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFilterChange(false)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial ${
                      !showUnreadOnly
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange(true)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial ${
                      showUnreadOnly
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="hidden sm:inline">Unread </span>({unreadCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {loading && page === 1 ? (
                <div className="p-8 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="p-8 sm:p-12 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                  </h3>
                  <p className="text-xs sm:text-sm px-2">
                    {showUnreadOnly 
                      ? 'All caught up! Check back later for new notifications.'
                      : 'You\'ll see notifications here when people interact with your content.'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {displayNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && displayNotifications.length >= 20 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="w-full py-2 px-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : 'Load more notifications'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default Notifications;
