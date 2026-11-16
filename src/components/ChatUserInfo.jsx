import React from 'react';
import { Mail, MapPin, Calendar, User, Shield, Star, MessageCircle, X } from 'lucide-react';

const ChatUserInfo = ({ chatUser, isVisible, onClose }) => {
  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';
  
  const getAvatarUrl = (user) => {
    if (!user) {
      return `https://ui-avatars.com/api/?name=Unknown&background=4f46e5&color=ffffff&size=128`;
    }
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      if (user.avatar.startsWith('uploads/')) {
        return `${BASE_URL}/${user.avatar}`;
      }
      if (user.avatar.startsWith('avatars/')) {
        return `${BASE_URL}/uploads/${user.avatar}`;
      }
      return `${BASE_URL}/uploads/avatars/${user.avatar}`;
    }
    const name = user.firstName || user.username || 'Unknown';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&size=128`;
  };

  const getStatusColor = (isOnline) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-500';
  };

  const getPlanBadge = (plan) => {
    switch (plan?.toUpperCase()) {
      case 'PREMIUM':
        return (
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg">
            <span className="mr-1">⭐</span>
            Premium
          </div>
        );
      case 'PRO':
        return (
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
            <span className="mr-1">🚀</span>
            Pro
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500 dark:bg-gray-700 text-white dark:text-gray-300">
            <span className="mr-1">👤</span>
            Basic
          </div>
        );
    }
  };

  if (!chatUser) {
    return (
      <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-80 lg:w-96 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-l border-gray-700/50 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } lg:relative lg:translate-x-0 lg:block shadow-2xl`}>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500 mb-2">
            No User Selected
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            💬 Select a conversation to view user information
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* User Info Panel */}
      <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-80 lg:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700/50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      } lg:relative lg:translate-x-0 lg:block`}>
        
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 p-4 lg:p-6 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-gray-300">
              👤 Profile
            </h3>
            <button
              onClick={onClose}
              className="lg:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 lg:p-6">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="relative">
                <img
                  src={getAvatarUrl(chatUser)}
                  alt={chatUser.name || chatUser.firstName}
                  className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover shadow-2xl ring-4 ring-gray-300 dark:ring-gray-700/50 border-4 border-gray-200 dark:border-gray-800"
                  onError={(e) => {
                    const name = chatUser.firstName || chatUser.username || 'Unknown';
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&size=128`;
                  }}
                />
                {/* Online Status with Glow */}
                <div className={`absolute bottom-3 right-3 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 ${getStatusColor(chatUser.isOnline)} ${
                  chatUser.isOnline ? 'shadow-lg shadow-green-500/50' : ''
                } transition-all duration-200`}></div>
              </div>
              
              {/* Decorative Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10 blur-xl"></div>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-gray-100 dark:to-gray-300 mb-2 leading-tight">
              {chatUser.name || `${chatUser.firstName || ''} ${chatUser.lastName || ''}`.trim() || chatUser.username || 'User'}
            </h2>
            
            <p className={`text-sm font-semibold mb-4 flex items-center justify-center gap-2 ${
              chatUser.isOnline 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="text-base">{chatUser.isOnline ? '🟢' : '⚫'}</span>
              {chatUser.isOnline ? '✨ Active now' : '💤 Offline'}
            </p>

            {/* Plan Badge */}
            <div className="mb-6">
              {getPlanBadge(chatUser.plan)}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button className="flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-blue-500/25 font-semibold">
              <span className="mr-2">💬</span>
              Message
            </button>
            <button className="flex items-center justify-center px-4 py-3.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg font-semibold">
              <span className="mr-2">👀</span>
              View Profile
            </button>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            {/* Email */}
            {chatUser.email && (
              <div className="group bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700/30">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">📧</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">✉️ Email Address</p>
                    <p className="text-gray-900 dark:text-white text-sm font-medium break-all leading-relaxed">{chatUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Username */}
            {chatUser.username && chatUser.username !== chatUser.email && (
              <div className="group bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700/30">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">🏷️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">🔖 Username</p>
                    <p className="text-gray-900 dark:text-white text-sm font-medium">@{chatUser.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {chatUser.location && (
              <div className="group bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700/30">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">📍</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">🌍 Location</p>
                    <p className="text-gray-900 dark:text-white text-sm font-medium">{chatUser.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Join Date */}
            {chatUser.createdAt && (
              <div className="group bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700/30">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-lg">📅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">🎉 Member Since</p>
                    <p className="text-gray-900 dark:text-white text-sm font-medium">
                      {new Date(chatUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bio */}
            {chatUser.bio && (
              <div className="group bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700/30">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <span>📝</span> About Me
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm leading-relaxed font-medium">{chatUser.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatUserInfo;