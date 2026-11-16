import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import Feed from "../features/feed/Feed";
import StoriesContainer from "../components/StoriesContainer";
import RightSidebar from "../components/RightSidebar";
import CreatePostModal from "../components/CreatePostModal";
import CreateStoryModal from "../components/CreateStoryModal";
import MobileNav from "../components/MobileNav";
import storyService from "../services/storyService";
import userService from "../services/userService";
import chatService from "../services/chatService";
import postService from "../services/postService";
import toast from "react-hot-toast";
import CreateArticleModal from "../components/CreateArticleModal";
import NoticeBoard from "../components/NoticeBoard";
import PremiumUpgradePrompt from "../components/PremiumUpgradePrompt";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [homeStats, setHomeStats] = useState({
    activeFriends: 0,
    newMessages: 0,
    todaysPosts: 0,
    hasData: false,
  });
  const storiesRefreshRef = useRef();

  // Load home statistics
  useEffect(() => {
    console.log("Home page mounted");
    loadHomeStatistics();

    return () => {
      console.log("Home page unmounted");
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    console.log("Home page route changed to:", location.pathname);
    console.log("Home page component re-rendering due to route change");
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const loadHomeStatistics = async () => {
    try {
      setStatsLoading(true);
      const promises = [];
      let activeFriends = 0;
      let newMessages = 0;
      let todaysPosts = 0;
      let hasData = false;

      // Get active friends count
      try {
        const friendsResponse = await userService.getOnlineFriends?.();
        if (friendsResponse?.data) {
          activeFriends = friendsResponse.data.length;
          hasData = true;
        }
      } catch (error) {
        console.log("Friends data not available");
      }

      // Get unread messages count
      try {
        const messagesResponse = await chatService.getUnreadCount?.();
        if (messagesResponse?.count !== undefined) {
          newMessages = messagesResponse.count;
          hasData = true;
        }
      } catch (error) {
        console.log("Messages data not available");
      }

      // Get today's posts count
      try {
        const today = new Date().toISOString().split("T")[0];
        const postsResponse = await postService.getTodaysPosts?.(today);
        if (postsResponse?.data) {
          todaysPosts = postsResponse.data.length;
          hasData = true;
        }
      } catch (error) {
        console.log("Posts data not available");
      }

      setHomeStats({
        activeFriends,
        newMessages,
        todaysPosts,
        hasData,
      });
    } catch (error) {
      console.error("Error loading home statistics:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCreatePost = (newPost) => {
    // Here you would typically save the post to your backend
    console.log("New post created:", newPost);
    // Refresh stats to include the new post
    loadHomeStatistics();
  };

  const handleCreateStory = async (formData) => {
    try {
      setIsCreatingStory(true);

      // Debug logs to see what we receive
      console.log("Home.jsx received data:", formData);
      console.log("Home.jsx data type:", typeof formData);
      console.log("Home.jsx is FormData?", formData instanceof FormData);

      // CRITICAL: Pass the formData directly without ANY transformation
      // Don't destructure, don't spread, don't modify - just pass it through
      const response = await storyService.createStory(formData);

      if (response.success) {
        console.log("Story created successfully:", response.story);
        setIsStoryModalOpen(false);
        // Refresh stories
        if (storiesRefreshRef.current) {
          storiesRefreshRef.current();
        }
      }
    } catch (error) {
      console.error("Error creating story:", error);
      alert(error.message || "Failed to create story");
    } finally {
      setIsCreatingStory(false);
    }
  };

  // Stats card component
  const StatsCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:scale-105 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          {statsLoading ? (
            <div className="flex items-center gap-2 mt-1">
              <Loader2 className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin" />
              <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
        </div>
        <div className={`p-2 ${bgColor} rounded-full`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Top navbar */}
      <div className="flex-shrink-0">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      </div>

      {/* Mobile spacing to account for fixed navbar */}
      <div className="lg:hidden h-12"></div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile slide-in, Desktop fixed */}
        <Sidebar
          onCreatePost={() => setIsPostModalOpen(true)}
          onCreateStory={() => setIsStoryModalOpen(true)}
          onCreateArticle={() => setIsArticleModalOpen(true)}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content - Fixed Height */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          {/* Fixed Header - Hidden on mobile */}
          <div className="hidden lg:flex flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    What's happening in your world today?
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="w-full p-0 sm:p-4 lg:p-6">
              {/* Winners Notice Board */}
              <NoticeBoard />

              {/* Premium Upgrade Prompt - Show to non-premium users */}
              {user?.plan !== 'PREMIUM' && (
                <div className="mb-4 lg:mb-6">
                  <PremiumUpgradePrompt variant="card" />
                </div>
              )}

              {/* Quick Stats Cards - Only show if data is available */}
              {homeStats.hasData && (
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {homeStats.activeFriends > 0 && (
                    <StatsCard
                      title="Active Friends"
                      value={homeStats.activeFriends}
                      icon={Users}
                      color="text-blue-400"
                      bgColor="bg-blue-500/20"
                    />
                  )}

                  {homeStats.newMessages > 0 && (
                    <StatsCard
                      title="New Messages"
                      value={homeStats.newMessages}
                      icon={MessageSquare}
                      color="text-purple-400"
                      bgColor="bg-purple-500/20"
                    />
                  )}

                  {homeStats.todaysPosts > 0 && (
                    <StatsCard
                      title="Today's Posts"
                      value={homeStats.todaysPosts}
                      icon={Clock}
                      color="text-green-400"
                      bgColor="bg-green-500/20"
                    />
                  )}
                </div>
              )}

              {/* Loading state for stats */}
              {statsLoading && (
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stories Section - Mobile Optimized */}
              <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl lg:rounded-xl border-y sm:border border-gray-200 dark:border-gray-700 mb-2 sm:mb-4 lg:mb-6 overflow-hidden shadow-sm">
                <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mr-2 lg:mr-3"></div>
                    Stories
                  </h2>
                  <p className="text-gray-400 text-xs lg:text-sm mt-1">
                    Share your moments with friends
                  </p>
                </div>
                <div className="p-2 lg:p-4">
                  <StoriesContainer
                    refreshRef={storiesRefreshRef}
                    onCreateStory={() => setIsStoryModalOpen(true)}
                  />
                </div>
              </div>

              {/* Feed Section - Mobile Optimized */}
              <div className="bg-white dark:bg-gradient-to-r dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-800/90 lg:dark:from-gray-800 lg:dark:via-gray-800 lg:dark:to-gray-800 rounded-none sm:rounded-2xl lg:rounded-xl border-y sm:border border-gray-200 dark:border-gray-600/60 lg:dark:border-gray-700 overflow-hidden backdrop-blur-sm shadow-sm">
                <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-600/60 lg:dark:border-gray-700">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-2 lg:mr-3"></div>
                    Feed
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm mt-1">
                    Latest updates from your network
                  </p>
                </div>
                <div className="p-0 sm:p-2 lg:p-4">
                  <Feed />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Right Sidebar */}
        <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
          <RightSidebar />
        </div>
      </div>

      {/* Fixed Mobile Navigation */}
      {/* <div className="flex-shrink-0 lg:hidden">
        <MobileNav />
      </div> */}

      {/* Modals */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleCreatePost}
      />
      <CreateStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onSave={handleCreateStory}
        isLoading={isCreatingStory}
      />
      {user?.plan === "PREMIUM" && (
        <CreateArticleModal
          isOpen={isArticleModalOpen}
          onClose={() => setIsArticleModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
