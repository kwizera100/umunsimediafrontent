import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Users, 
  FileText, 
  Mail,
  X,
  ExternalLink,
  Clock,
  Repeat,
  Quote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onClose }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'repost':
        return <Repeat className="h-5 w-5 text-green-500" />;
      case 'quote_repost':
        return <Quote className="h-5 w-5 text-purple-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'friend_request':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'message':
        return <Mail className="h-5 w-5 text-indigo-500" />;
      case 'club_invite':
        return <Users className="h-5 w-5 text-orange-500" />;
      case 'article_published':
        return <FileText className="h-5 w-5 text-cyan-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Use React Router navigation instead of window.location.href
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    if (onClose) {
      onClose();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const getMetadata = () => {
    if (notification.metadata) {
      try {
        return JSON.parse(notification.metadata);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const metadata = getMetadata();

  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {notification.content}
          </p>
          
          {metadata && (
            <div className="mt-2">
              {metadata.image && (
                <img
                  src={metadata.image}
                  alt="Notification"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              {metadata.count && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {metadata.count} more
                </span>
              )}
            </div>
          )}
          
          {notification.actionText && (
            <div className="mt-2">
              <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                {notification.actionText}
                <ExternalLink className="h-3 w-3 ml-1" />
              </span>
            </div>
          )}
        </div>
        
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
