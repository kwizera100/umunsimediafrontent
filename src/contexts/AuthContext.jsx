import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import socketService from '../services/socketService';
import pwaUtils from '../utils/pwa';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          // Set user from localStorage immediately
          const userData = JSON.parse(user);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Initialize WebSocket connection
          socketService.connect(token, userData.id);
          
          // Verify token is still valid by fetching profile
          try {
            const profileResponse = await authService.getProfile();
            if (profileResponse.success) {
              setUser(profileResponse.data);
              localStorage.setItem('user', JSON.stringify(profileResponse.data));
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            // If profile fetch fails, token might be invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Subscribe to web push once authenticated (Facebook-style device notifications)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!('Notification' in window)) return;
    // Don't re-prompt if the user already denied
    if (Notification.permission === 'denied') return;

    const t = setTimeout(() => {
      pwaUtils.subscribeToPushNotifications().catch(() => {});
    }, 3000); // slight delay so it doesn't fire during initial render
    return () => clearTimeout(t);
  }, [isAuthenticated]);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      if (response.success) {
        // Check if email verification is required
        if (response.requiresEmailVerification) {
          // Don't log user in - they need to verify email first
          toast.success(response.message || 'Registration successful! Please check your email to verify your account.');
          return { 
            success: true, 
            requiresEmailVerification: true,
            message: response.message 
          };
        } else {
          // Only log in if no email verification required (shouldn't happen with current setup)
          localStorage.setItem('token', response.data.token);
          setUser(response.data.user);
          setIsAuthenticated(true);
          socketService.connect(response.data.token, response.data.user.id);
          
          if (userData.isStudent) {
            toast.success('Registration successful! Your student verification is pending admin approval.');
          } else {
            toast.success(response.message || 'Registration successful!');
          }
          return { success: true };
        }
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
      toast.error(error.message || 'Registration failed');
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Initialize WebSocket connection after login
        socketService.connect(response.data.token, response.data.user.id);
        toast.success('Welcome back!');
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      toast.error(error.message || 'Login failed');
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    // Disconnect WebSocket
    socketService.disconnect();
    toast.success('Logged out successfully');
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        setUser(response.data);
        // Persist updated user to localStorage for immediate UI refresh across app
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update cover image
  const updateCoverImage = async (file) => {
    try {
      setLoading(true);
      const response = await authService.updateCoverImage(file);
      
      if (response.success) {
        // Update user state with new cover image
        setUser(prev => ({
          ...prev,
          coverImage: response.data.coverImage
        }));
        // Persist to localStorage as well
        const updated = {
          ...(JSON.parse(localStorage.getItem('user') || '{}')),
          coverImage: response.data.coverImage,
        };
        localStorage.setItem('user', JSON.stringify(updated));
        toast.success('Cover image updated successfully');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update cover image');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query, page = 1, limit = 10) => {
    try {
      const response = await authService.searchUsers(query, page, limit);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to search users');
      throw error;
    }
  };

  // Get user by ID
  const getUserById = async (userId) => {
    try {
      const response = await authService.getUserById(userId);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to get user');
      throw error;
    }
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const profileResponse = await authService.getProfile();
      if (profileResponse.success) {
        setUser(profileResponse.data);
        localStorage.setItem('user', JSON.stringify(profileResponse.data));
        return { success: true, data: profileResponse.data };
      }
      return { success: false };
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    register,
    login,
    logout,
    updateProfile,
    updateCoverImage,
    searchUsers,
    getUserById,
    refreshUser,
    socketService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 

export { AuthProvider };