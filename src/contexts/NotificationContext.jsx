import React, { createContext, useContext, useReducer, useEffect } from 'react';
import notificationService from '../services/notificationService';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load notifications only when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isAuthenticated, user]);

  // Set up real-time notification listeners only when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleNewNotification = (notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    };

    const handleNotificationRead = (notificationId) => {
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    };

    // Listen for real-time notifications
    socketService.on('new-notification', handleNewNotification);
    socketService.on('notification-read', handleNotificationRead);

    return () => {
      socketService.off('new-notification', handleNewNotification);
      socketService.off('notification-read', handleNotificationRead);
    };
  }, [isAuthenticated, user]);

  // Clear notifications when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [isAuthenticated]);

  const loadNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await notificationService.getNotifications(page, limit, unreadOnly);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.notifications });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: response.data.unreadCount });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: response.count });
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const value = {
    ...state,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
