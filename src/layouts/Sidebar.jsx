import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  MessageCircle,
  User,
  Plus,
  Camera,
  Users,
  Bookmark,
  Settings,
  HelpCircle,
  Hash,
  Star,
  X,
  Trophy,
  BookOpen,
  Bell,
  Building2,
  Newspaper,
} from "lucide-react";
import Logo from "../assets/Logo.png";
import socketService from "../services/socketService";
import chatService from "../services/chatService";

const BASE_URL = import.meta.env.VITE_SOCKET_URL || "https://fggg.space";

const getUserAvatar = (user) => {
  if (!user) {
    return "https://ui-avatars.com/api/?name=Unknown&background=random";
  }
  if (user.avatar) {
    if (user.avatar.startsWith("http")) {
      return user.avatar;
    }
    if (user.avatar.startsWith("uploads/")) {
      return `${BASE_URL}/${user.avatar}`;
    }
    if (user.avatar.startsWith("avatars/")) {
      return `${BASE_URL}/uploads/${user.avatar}`;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  }
  return `https://ui-avatars.com/api/?name=${
    user.firstName || user.username || "Unknown"
  }&background=random`;
};

const Sidebar = ({
  onCreatePost,
  onCreateStory,
  onCreateArticle,
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notificationCount, setNotificationCount] = React.useState(0);

  // Safe pathname access
  const currentPath = location?.pathname || "/";

  // Fetch unread count on mount and when route changes
  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (typeof chatService?.getUnreadCount === "function") {
          const res = await chatService.getUnreadCount();
          const count = res?.count ?? res?.data?.count ?? 0;
          setUnreadCount(count);
        }
      } catch (e) {
        console.error("Error fetching unread count:", e);
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, [currentPath]);

  // Fetch notification count
  React.useEffect(() => {
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
  }, [currentPath]);

  // Live update on incoming messages
  React.useEffect(() => {
    const onIncoming = (msg) => {
      try {
        // If current user is receiver, increment
        if (msg?.to === user?.id || msg?.receiverId === user?.id) {
          // If user is in chat page, refresh count instead of increment
          if (currentPath.startsWith("/chat")) {
            if (typeof chatService?.getUnreadCount === "function") {
              chatService
                .getUnreadCount()
                .then((res) => {
                  const count = res?.count ?? res?.data?.count ?? 0;
                  setUnreadCount(count);
                })
                .catch(() => {});
            }
          } else {
            setUnreadCount((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error handling incoming message:", error);
      }
    };

    if (socketService && typeof socketService.on === "function") {
      socketService.on("chat-message", onIncoming);
      return () => {
        if (typeof socketService.off === "function") {
          socketService.off("chat-message", onIncoming);
        }
      };
    }
  }, [currentPath, user?.id]);

  // Live update on incoming notifications
  React.useEffect(() => {
    const onNewNotification = (notification) => {
      console.log("New notification received in sidebar:", notification);
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
  }, [user?.id]);

  const navigation = [
    { name: "Home", href: "/", icon: Home, badge: null },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageCircle,
      badge: unreadCount ? unreadCount : null,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: notificationCount ? notificationCount : null,
    },
    { name: "Profile", href: "/profile", icon: User, badge: null },
    { name: "Friends", href: "/friends", icon: Users, badge: null },
    { name: "Clubs", href: "/clubs", icon: Hash, badge: null },
    { name: "Articles", href: "/articles", icon: BookOpen, badge: null },
    { name: "Media Houses", href: "/media-houses", icon: Building2, badge: null },
    { name: "Sell Article", href: "/sell-article", icon: Newspaper, badge: null },
    { name: "Settings", href: "/settings", icon: Settings, badge: null },
    { name: "Help", href: "/help", icon: HelpCircle, badge: null },
  ];

  const isActive = (path) => currentPath === path;

  return (
    <>
      {/* Dark overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col z-50 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-64 lg:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <img
              src={Logo}
              alt="App Logo"
              className="w-8 h-8 rounded object-contain"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Umunsi Media
            </span>
          </div>
          <button
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full lg:hidden transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* Quick Actions */}
          {/* <div className="mb-8">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onCreatePost && onCreatePost();
                  onClose && onClose();
                }}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Plus className="h-5 w-5 mr-4 text-gray-500 dark:text-gray-400" />
                Create Post
              </button>
              <button
                onClick={() => {
                  onCreateStory && onCreateStory();
                  onClose && onClose();
                }}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Camera className="h-5 w-5 mr-4 text-gray-500 dark:text-gray-400" />
                Create Story
              </button>
              {user?.plan === 'PREMIUM' && (
                <button
                  onClick={() => {
                    onCreateArticle && onCreateArticle();
                    onClose && onClose();
                  }}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <BookOpen className="h-5 w-5 mr-4 text-gray-500 dark:text-gray-400" />
                  Write Article
                </button>
              )}
            </div>
          </div> */}

          {/* Main Navigation */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Navigation
            </div>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "Sidebar navigation clicked:",
                        item.name,
                        item.href
                      );
                      console.log("Button onClick triggered for sidebar");
                      try {
                        navigate(item.href);
                        console.log("Navigate called successfully for sidebar");
                        // Fallback: if navigate doesn't work, try window.location
                        setTimeout(() => {
                          if (window.location.pathname !== item.href) {
                            console.log(
                              "Navigate didn't work, trying window.location"
                            );
                            window.location.href = item.href;
                          }
                        }, 100);
                      } catch (error) {
                        console.error(
                          "Error calling navigate for sidebar:",
                          error
                        );
                        // Fallback to window.location
                        window.location.href = item.href;
                      }
                      if (onClose) {
                        console.log("Calling onClose");
                        onClose();
                      }
                    }}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-full transition-colors w-full text-left ${
                      isActive(item.href)
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    data-navigation="true"
                  >
                    <Icon
                      className={`h-5 w-5 mr-4 ${
                        isActive(item.href)
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white"
                      }`}
                    />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <img
              src={getUserAvatar(user)}
              alt={user?.firstName || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
