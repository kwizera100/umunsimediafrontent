import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const useViewTracking = (contentId, contentType, options = {}) => {
  const {
    threshold = 0.5, // 50% of the element must be visible
    rootMargin = '0px',
    enabled = true,
    onViewTracked = null
  } = options;

  const elementRef = useRef(null);
  const hasTracked = useRef(false);
  const observerRef = useRef(null);
  
  // Client-side session tracking to prevent duplicate API calls
  const sessionKey = `viewed_${contentType}_${contentId}`;
  const hasTrackedInSession = useRef(
    sessionStorage.getItem(sessionKey) === 'true'
  );

  const trackView = useCallback(async () => {
    if (!contentId || !contentType || hasTracked.current || !enabled || hasTrackedInSession.current) {
      return;
    }

    try {
      const response = await api.post(
        `/analytics/view/${contentId}`,
        { type: contentType }
      );

      if (response.data.success) {
        hasTracked.current = true;
        hasTrackedInSession.current = true;
        // Store in sessionStorage to persist across page reloads
        sessionStorage.setItem(sessionKey, 'true');
        
        // Always update view count if provided, even if already viewed
        if (onViewTracked && response.data.views !== undefined) {
          onViewTracked(response.data);
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [contentId, contentType, enabled, onViewTracked, sessionKey]);

  useEffect(() => {
    if (!enabled || !contentId || !contentType) {
      return;
    }

    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            trackView();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [contentId, contentType, enabled, threshold, rootMargin, trackView]);

  // Reset tracking state when contentId changes
  useEffect(() => {
    hasTracked.current = false;
    // Check if this content was already viewed in this session
    hasTrackedInSession.current = sessionStorage.getItem(sessionKey) === 'true';
  }, [contentId, sessionKey]);

  return elementRef;
};

export default useViewTracking;
