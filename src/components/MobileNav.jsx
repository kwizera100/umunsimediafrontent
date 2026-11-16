import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  User, 
  Bell,
  Search
} from 'lucide-react';
import socketService from '../services/socketService';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || "https://fggg.space";

const MobileNav = () => {
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(
            `${BASE_URL}/api/notifications/unread-count`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setNotificationCount(data.count || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
        setNotificationCount(0);
      }
    };

    fetchNotifications();

    // Listen for new notifications
    const onNewNotification = () => {
      setNotificationCount((prev) => prev + 1);
    };

    if (socketService && typeof socketService.on === "function") {
      socketService.on("new-notification", onNewNotification);
      return () => {
        if (typeof socketService.off === "function") {
          socketService.off("new-notification", onNewNotification);
        }
      };
    }
  }, [location.pathname]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/chat' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-xl border-t border-white/10 z-50">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                active
                  ? 'text-white bg-white/20 backdrop-blur-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Notifications Link */}
        <Link
          to="/notifications"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            isActive('/notifications')
              ? 'text-white bg-white/20 backdrop-blur-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Notifications</span>
        </Link>
        
        {/* Profile Link */}
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            isActive('/profile')
              ? 'text-white bg-white/20 backdrop-blur-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="relative">
            <User className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav; 