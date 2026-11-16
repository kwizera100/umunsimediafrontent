import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Bell,
  Search,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  GraduationCap,
  HelpCircle,
  Download,
} from "lucide-react";
import { CompactThemeToggle } from "../components/ThemeToggle";
import NotificationDropdown from "../components/NotificationDropdown";
import Logo from "../assets/Logo.png";

const API_URL = import.meta.env.VITE_API_URL || "https://fggg.space";
const BASE_URL = import.meta.env.VITE_SOCKET_URL || "https://fggg.space";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Scroll effect for mobile navbar
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY && currentScrollY > 10) {
            // Scrolling down - hide navbar
            setIsNavbarVisible(false);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up - show navbar
            setIsNavbarVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const getPlanBadge = () => {
    if (!user) return null;

    if (user.isStudent) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <GraduationCap className="w-3 h-3 mr-1" />
          Student
        </span>
      );
    }

    if (user.plan === "PREMIUM") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Free
      </span>
    );
  };

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
        isNavbarVisible ? "translate-y-0" : "-translate-y-full"
      } bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-16">
          {/* Left Section - Logo Hamburger Button */}
          <div className="flex items-center">
            {/* Logo as Hamburger Button - Mobile */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <img
                src={Logo}
                alt="App Logo"
                className="w-10 h-10 rounded object-contain"
              />
            </button>

            {/* Logo - Desktop */}
          </div>

          {/* Center Section - Search - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-4 sm:mx-8">
            <div className="relative"></div>
          </div>

          {/* Right Section - Actions and Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <CompactThemeToggle className="hidden sm:block" />

            {/* Help - Hidden on mobile */}
            <button className="hidden md:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Notifications - Hidden on mobile */}
            <div className="hidden lg:block">
              <NotificationDropdown />
            </div>

            {/* Admin Panel Button - Only show for admin/moderator users */}
            {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
              <button
                onClick={() => navigate("/admin")}
                className="hidden md:block p-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                title="Admin Panel"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <img
                  src={getUserAvatar(user)}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
                <svg
                  className="hidden sm:block h-4 w-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </div>
                      {getPlanBadge()}
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
                      data-navigation="true"
                    >
                      <User className="h-4 w-4 mr-3" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
                      data-navigation="true"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>

                    {/* Admin Panel Link - Only show for admin/moderator users */}
                    {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate("/admin");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 hover:text-purple-700 dark:hover:text-purple-300 flex items-center transition-colors"
                        data-navigation="true"
                      >
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        Admin Panel
                      </button>
                    )}

                    {/* Theme Toggle for Mobile */}
                    <div className="sm:hidden px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Theme
                        </span>
                        <CompactThemeToggle />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 flex items-center transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
