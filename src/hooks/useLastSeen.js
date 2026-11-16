import { useEffect, useRef } from 'react';
import userService from '../services/userService';

const useLastSeen = (isActive = true) => {
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const updateLastSeen = async () => {
    try {
      await userService.updateLastSeen();
      lastUpdateRef.current = Date.now();
    } catch (error) {
      console.error('Failed to update last seen:', error);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    // Update immediately when component mounts
    updateLastSeen();

    // Set up interval to update every 30 seconds
    intervalRef.current = setInterval(() => {
      // Only update if it's been at least 30 seconds since last update
      const now = Date.now();
      if (now - lastUpdateRef.current >= 30000) {
        updateLastSeen();
      }
    }, 30000);

    // Update on page visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastSeen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Update on window focus
    const handleFocus = () => {
      updateLastSeen();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isActive]);

  return { updateLastSeen };
};

export default useLastSeen;
