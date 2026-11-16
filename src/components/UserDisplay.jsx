import React from 'react';
import { Link } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';

const UserDisplay = ({ 
  user, 
  showAvatar = true,
  showUsername = true,
  showVerification = true,
  size = 'md',
  className = '',
  linkToProfile = true
}) => {
  if (!user) return null;

  const isVerified = user.plan === 'PREMIUM' && 
    user.planExpiresAt && 
    new Date(user.planExpiresAt) > new Date();

  const sizeClasses = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-sm',
      username: 'text-xs'
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-base',
      username: 'text-sm'
    },
    lg: {
      avatar: 'w-10 h-10',
      text: 'text-lg',
      username: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  const getUserDisplayName = (user) => {
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.username || 'Unknown User';
  };

  const getUserAvatar = (user) => {
    if (user.avatar) {
      const base = (import.meta.env.VITE_SOCKET_URL || 'https://writerapi.umunsi.com').replace(/\/+$/, '');
      return user.avatar.startsWith('http')
        ? user.avatar
        : `${base}/uploads/${user.avatar}`;
    }
    return null;
  };

  const UserContent = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <div className={`${currentSize.avatar} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0`}>
          {getUserAvatar(user) ? (
            <img
              src={getUserAvatar(user)}
              alt={getUserDisplayName(user)}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold"
            style={{ display: getUserAvatar(user) ? 'none' : 'flex' }}
          >
            {getUserDisplayName(user).charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <span className={`${currentSize.text} font-medium text-gray-900 dark:text-white truncate`}>
            {getUserDisplayName(user)}
          </span>
          {showVerification && isVerified && (
            <VerificationBadge size="sm" />
          )}
        </div>
        {showUsername && user.username && (
          <span className={`${currentSize.username} text-gray-500 dark:text-gray-400 truncate`}>
            @{user.username}
          </span>
        )}
      </div>
    </div>
  );

  if (linkToProfile) {
    return (
      <Link to={`/profile/${user.username || user.id}`} className="hover:opacity-80 transition-opacity">
        <UserContent />
      </Link>
    );
  }

  return <UserContent />;
};

export default UserDisplay;
