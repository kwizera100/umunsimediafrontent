import React, { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import publicProfileService from "../services/publicProfileService";
import chatService from "../services/chatService";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import MobileNav from "../components/MobileNav";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import ChatUserInfo from "../components/ChatUserInfo";
import CreatePostModal from "../components/CreatePostModal";
import CreateStoryModal from "../components/CreateStoryModal";
import CreateArticleModal from "../components/CreateArticleModal";
import { useAuth } from "../contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Bug,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import {
  testSocketConnection,
  testSocketEvents,
  monitorSocketEvents,
} from "../utils/socketTest";

const Chat = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);

  // Debug logging
  React.useEffect(() => {
    console.log("Chat page mounted");
    return () => {
      console.log("Chat page unmounted");
    };
  }, []);
  const [showChatList, setShowChatList] = useState(true); // Mobile toggle state
  const [showChatListDesktop, setShowChatListDesktop] = useState(true); // Desktop toggle state
  const [showUserInfo, setShowUserInfo] = useState(false); // Mobile user info state
  const [showUserInfoDesktop, setShowUserInfoDesktop] = useState(true); // Desktop user info state

  // Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);

  // Modal handlers
  const handleCreatePost = useCallback((postData) => {
    console.log("Post created:", postData);
    setIsPostModalOpen(false);
  }, []);

  const handleCreateStory = useCallback(async (storyData) => {
    try {
      setIsCreatingStory(true);
      console.log("Story created:", storyData);
      setIsStoryModalOpen(false);
    } catch (error) {
      console.error("Error creating story:", error);
    } finally {
      setIsCreatingStory(false);
    }
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      setShowChatList(false);
    } else {
      setShowChatList(true);
    }
    // Reset user info panel on mobile
    setShowUserInfo(false);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const targetUsername = searchParams.get("user");

  // Open a conversation directly when arriving via /chat?user=<username>
  React.useEffect(() => {
    if (!targetUsername) return;
    // Consume the param so it doesn't re-trigger on re-renders
    setSearchParams({}, { replace: true });
    (async () => {
      try {
        const res = await publicProfileService.getUserByUsername(targetUsername);
        const person = res?.data?.user || res?.data || res;
        if (person && person.id) {
          handleSelectChat({ user: person });
          try {
            chatService.markMessagesAsRead(person.id);
          } catch (e) {
            /* non-fatal */
          }
        } else {
          toast.error(`Could not find @${targetUsername}`);
        }
      } catch (err) {
        console.error("Failed to open chat:", err);
        toast.error(`Could not open chat with @${targetUsername}`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUsername]);

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
    setShowUserInfo(false);
  };

  const handleShowUserInfo = () => {
    setShowUserInfo(true);
  };

  const handleCloseUserInfo = () => {
    setShowUserInfo(false);
  };

  const toggleChatListDesktop = () => {
    setShowChatListDesktop(!showChatListDesktop);
  };

  const toggleUserInfoDesktop = () => {
    setShowUserInfoDesktop(!showUserInfoDesktop);
  };

  React.useEffect(() => {
    const syncToViewport = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (isDesktop) {
        setShowChatList(true);
        setShowUserInfo(false); // Reset mobile user info on desktop
      }
    };
    syncToViewport();
    window.addEventListener("resize", syncToViewport);
    return () => window.removeEventListener("resize", syncToViewport);
  }, []);

  // Debug functions for development
  const handleDebugConnection = () => {
    testSocketConnection();
  };

  const handleDebugEvents = () => {
    testSocketEvents();
  };

  const handleMonitorEvents = () => {
    monitorSocketEvents();
  };

  return (
    <div className="h-screen h-[100dvh] bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden pb-20 lg:pb-0">
      {/* Fixed Navbar - Hidden on mobile */}
      <div className="flex-shrink-0 hidden lg:block">
        <Navbar />
      </div>

      {/* Main Content Area - Mobile optimized */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Fixed Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar
            onCreatePost={() => setIsPostModalOpen(true)}
            onCreateStory={() => setIsStoryModalOpen(true)}
            onCreateArticle={() => setIsArticleModalOpen(true)}
          />
        </div>

        {/* Main Chat Area - Mobile scrollable */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Enhanced Chat Header - Hidden on mobile */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 hidden lg:flex shadow-sm">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Direct Messages
                  </h1>
                </div>
                <span className="text-gray-500 text-sm hidden xl:inline">•</span>
                <div className="flex items-center space-x-2 hidden xl:flex">
                  <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    All conversations
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Debug buttons - only in development */}
                {import.meta.env.DEV && (
                  <>
                    <button
                      onClick={handleDebugConnection}
                      className="p-2 text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105"
                      title="🔧 Test Socket Connection"
                    >
                      <Bug className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDebugEvents}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105"
                      title="⚡ Test Socket Events"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleMonitorEvents}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105"
                      title="👀 Monitor Socket Events"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  onClick={toggleUserInfoDesktop}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  title={
                    showUserInfoDesktop ? "Hide User Info" : "Show User Info"
                  }
                >
                  <ChevronRight
                    className={`h-5 w-5 transition-transform duration-200 ${
                      showUserInfoDesktop ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Interface - Fixed Height with Independent Scrolling */}
          <div className="flex flex-1 min-h-0 overflow-hidden relative">
            {/* Enhanced Chat List - Mobile: Toggleable, Desktop: Toggleable */}
            <div
              className={`${showChatList ? "w-full" : "hidden"} ${
                showChatListDesktop ? "lg:w-80" : "lg:w-0"
              } lg:flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden ${
                showChatListDesktop ? "lg:opacity-100" : "lg:opacity-0"
              }`}
            >
              <ChatList
                onSelectChat={handleSelectChat}
                selectedChat={selectedChat}
              />
            </div>

            {/* Desktop Toggle Button - Only visible when chat list is hidden */}
            {!showChatListDesktop && (
              <button
                onClick={toggleChatListDesktop}
                className="hidden lg:block absolute left-0 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/50 rounded-r-xl text-gray-300 hover:text-white hover:from-gray-700 hover:to-gray-600 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Chat Window and User Info - Mobile: Full width when chat selected, Desktop: Always visible */}
            <div
              className={`${
                !showChatList ? "w-full flex" : "hidden"
              } lg:flex flex-1 min-h-0 overflow-hidden relative`}
            >
              {selectedChat ? (
                <div className="flex flex-1 min-h-0 overflow-hidden relative">
                  {/* Enhanced Chat Window - Scrollable Content */}
                  <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
                    <ChatWindow
                      chat={selectedChat}
                      onToggleChatList={toggleChatListDesktop}
                      showChatList={showChatListDesktop}
                      onMobileBack={handleBackToList}
                      onShowUserInfo={handleShowUserInfo}
                      onSelectChat={handleSelectChat}
                      selectedChat={selectedChat}
                    />
                  </div>

                  {/* Desktop User Info Panel */}
                  <div
                    className={`hidden lg:flex flex-col transition-all duration-300 overflow-hidden ${
                      showUserInfoDesktop ? "w-96 opacity-100" : "w-0 opacity-0"
                    }`}
                  >
                    <ChatUserInfo
                      chatUser={selectedChat.user}
                      isVisible={showUserInfo} // Mobile visibility
                      isDesktopVisible={showUserInfoDesktop} // Desktop visibility
                      onClose={handleCloseUserInfo} // Mobile close
                      onDesktopClose={toggleUserInfoDesktop} // Desktop close
                    />{" "}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center max-w-md mx-auto px-4 sm:px-6">
                    <div className="p-3 sm:p-4 bg-blue-600 rounded-full w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                      <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                      Welcome to Chat
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed px-2">
                      <span className="lg:hidden">Select a conversation to start chatting</span>
                      <span className="hidden lg:inline">Select a conversation from the sidebar to start chatting with your friends and colleagues.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop User Info Toggle Button - Only visible when user info is hidden and chat is selected */}
            {!showUserInfoDesktop && selectedChat && (
              <button
                onClick={toggleUserInfoDesktop}
                className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-gradient-to-l from-gray-800 to-gray-700 border border-gray-600/50 rounded-l-xl text-gray-300 hover:text-white hover:from-gray-700 hover:to-gray-600 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation - Fixed positioning */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <MobileNav />
      </div>

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

export default Chat;
