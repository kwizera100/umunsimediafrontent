import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  Heart,
  BookOpen,
  Award,
  Trophy,
  Star,
  Activity,
  Settings,
  MoreHorizontal,
  Share2,
  Flag,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  Repeat,
  AlertCircle,
} from "lucide-react";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import RightSidebar from "../components/RightSidebar";
import MobileNav from "../components/MobileNav";
import UserDisplay from "../components/UserDisplay";
import BadgeDisplay from "../components/BadgeDisplay";
import { ArticleCard } from "../components/ArticleList";
import UserRewardsProfile from "../components/UserRewardsProfile";
import certificateService from "../services/certificateService";
import PostCard from "../components/PostCard";
import { useAuth } from "../contexts/AuthContext";
import publicProfileService from "../services/publicProfileService";
import postService from "../services/postService";
import badgeService from "../services/badgeService";
import toast from "react-hot-toast";
import VerificationBadge from "../components/VerificationBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { mediaHouseService } from "../services/mediaHouseService";
import { getShortProfileUrl, getShortenedProfileUrl, copyToClipboard, copyShortLink } from "../utils/linkShortener";

const PublicProfile = ({ username: propUsername, embedded = false }) => {
  const { username: paramUsername } = useParams();
  const username = propUsername || paramUsername;
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Profile data states
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Content states
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [allPosts, setAllPosts] = useState([]); // Combined posts and reposts
  const [articles, setArticles] = useState([]);
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [friends, setFriends] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);

  // UI states
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [subscribers, setSubscribers] = useState({ count: 0, isSubscribed: false });
  const [loadingContent, setLoadingContent] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentOpen, setCommentOpen] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentsPage, setCommentsPage] = useState({});
  const [commentsHasMore, setCommentsHasMore] = useState({});

  // Stats
  const [stats, setStats] = useState({
    postsCount: 0,
    articlesCount: 0,
    friendsCount: 0,
    followersCount: 0,
    followingCount: 0,
    totalLikes: 0,
    totalViews: 0,
  });

  // Load profile data
  useEffect(() => {
    if (username) {
      loadProfileData();
    }
  }, [username]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const userData = await publicProfileService.getUserByUsername(username);
      setProfileUser(userData);

      // Load user stats
      const statsData = await publicProfileService.getUserStats(userData.id);
      setStats(statsData);

      // Load relationships
      const [friendsData, mutualData] = await Promise.all([
        publicProfileService.getUserFriends(userData.id),
        currentUser
          ? publicProfileService.getMutualFriends(userData.id)
          : Promise.resolve([]),
      ]);
      setFriends(friendsData);
      setMutualFriends(mutualData);

      // Check relationships
      if (currentUser) {
        const [followingStatus, friendStatus] = await Promise.all([
          publicProfileService.checkFollowingStatus(userData.id),
          publicProfileService.checkFriendshipStatus(userData.id),
        ]);
        setIsFollowing(followingStatus);
        setIsFriend(friendStatus);
      }

      // Load writer subscriber count (non-blocking)
      mediaHouseService.getWriterSubscribers(userData.id)
        .then((res) => { if (res?.success) setSubscribers(res.data); })
        .catch(() => {});

      // Load initial content
      loadTabContent("posts");
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile");
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadTabContent = async (tab) => {
    if (!profileUser) return;

    try {
      setLoadingContent(true);

      switch (tab) {
        case "posts":
          const postsData = await publicProfileService.getUserPosts(
            profileUser.id
          );
          setPosts(postsData);
          // Combine posts and reposts for feed-like view
          const repostsData = await publicProfileService.getUserReposts(
            profileUser.id
          );
          setReposts(repostsData);
          const combinedPosts = [...postsData, ...repostsData].sort(
            (a, b) =>
              new Date(b.createdAt || b.repostedAt) -
              new Date(a.createdAt || a.repostedAt)
          );
          setAllPosts(combinedPosts);
          break;
        case "reposts": {
          const onlyRepostsData = await publicProfileService.getUserReposts(
            profileUser.id
          );
          setReposts(onlyRepostsData);
          setAllPosts(onlyRepostsData);
          break;
        }
        case "articles":
          const articlesData = await publicProfileService.getUserArticles(
            profileUser.id
          );
          setArticles(articlesData);
          break;
        case "badges":
          const [badgesData, rewardsData, certificatesData] = await Promise.all(
            [
              badgeService.getUserBadges(profileUser.id),
              badgeService.getUserRewards(profileUser.id),
              certificateService.getUserCertificates(profileUser.id),
            ]
          );
          setBadges(badgesData);
          setRewards(rewardsData);
          setCertificates(
            Array.isArray(certificatesData) ? certificatesData : []
          );
          break;
        case "friends":
          // Friends already loaded
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error loading ${tab}:`, err);
      if (tab !== "badges") {
        toast.error(`Failed to load ${tab}`);
      }
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      if (isFollowing) {
        await publicProfileService.unfollowUser(profileUser.id);
        setIsFollowing(false);
        toast.success("Unfollowed successfully");
      } else {
        await publicProfileService.followUser(profileUser.id);
        setIsFollowing(true);
        toast.success("Following successfully");
      }
    } catch (err) {
      console.error("Error following/unfollowing:", err);
      toast.error("Failed to follow/unfollow user");
    }
  };

  const handleAddFriend = async () => {
    if (!currentUser) {
      toast.error("Please login to add friends");
      return;
    }

    try {
      if (isFriend) {
        await publicProfileService.removeFriend(profileUser.id);
        setIsFriend(false);
        toast.success("Removed from friends");
      } else {
        await publicProfileService.sendFriendRequest(profileUser.id);
        toast.success("Friend request sent");
      }
    } catch (err) {
      console.error("Error adding/removing friend:", err);
      toast.error("Failed to add/remove friend");
    }
  };

  const handleMessage = () => {
    if (!currentUser) {
      toast.error("Please login to send messages");
      return;
    }
    navigate(`/chat?user=${profileUser.username}`);
  };

  const handleShare = async () => {
    toast.loading('Shortening link...', { id: 'share-profile' });
    const shortUrl = await copyShortLink(getShortProfileUrl(profileUser.username));
    toast.success(`Link copied: ${shortUrl}`, { id: 'share-profile' });
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    const base = (import.meta.env.VITE_SOCKET_URL || 'https://writerapi.umunsi.com').replace(/\/+$/, '');
    return url.startsWith("http")
      ? url
      : `${base}/${url.replace(/^\/+/, "")}`;
  };

  const handleToggleLike = async (postId) => {
    try {
      setLikeLoading((s) => ({ ...s, [postId]: true }));
      const res = await postService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const liked = res?.liked;
          const likesCount = res?.likesCount;
          const nextLikes =
            typeof likesCount === "number"
              ? likesCount
              : (p._count?.likes || 0) + (liked ? 1 : -1);
          return {
            ...p,
            _count: { ...(p._count || {}), likes: Math.max(0, nextLikes) },
          };
        })
      );
    } catch (err) {
      toast.error("Failed to like post");
    } finally {
      setLikeLoading((s) => ({ ...s, [postId]: false }));
    }
  };

  const handleAddComment = async (postId) => {
    const content = (commentInputs[postId] || "").trim();
    if (!content) return;
    try {
      setCommentLoading((s) => ({ ...s, [postId]: true }));
      await postService.addComment(postId, content);
      // Clear input and bump count
      setCommentInputs((s) => ({ ...s, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                _count: {
                  ...(p._count || {}),
                  comments: (p._count?.comments || 0) + 1,
                },
              }
            : p
        )
      );
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading((s) => ({ ...s, [postId]: false }));
    }
  };

  const fetchComments = async (postId, page = 1, limit = 10) => {
    try {
      setCommentsLoading((s) => ({ ...s, [postId]: true }));
      const res = await postService.getComments(postId, page, limit);
      const newComments = Array.isArray(res?.comments)
        ? res.comments
        : Array.isArray(res)
        ? res
        : [];
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]:
          page === 1 ? newComments : [...(prev[postId] || []), ...newComments],
      }));
      setCommentsPage((p) => ({ ...p, [postId]: page }));
      const total = res?.total ?? undefined;
      if (typeof total === "number") {
        const currentCount =
          (commentsByPost[postId]?.length || 0) + newComments.length;
        setCommentsHasMore((m) => ({ ...m, [postId]: currentCount < total }));
      } else {
        setCommentsHasMore((m) => ({
          ...m,
          [postId]: newComments.length === limit,
        }));
      }
    } catch (err) {
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading((s) => ({ ...s, [postId]: false }));
    }
  };

  const handleReport = () => {
    // Implement report functionality
    toast.info("Report functionality coming soon");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getJoinDate = () => {
    if (!profileUser?.createdAt) return "Unknown";
    return formatDate(profileUser.createdAt);
  };

  if (loading) {
    return (
      <div className={`${embedded ? 'py-12' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900 flex items-center justify-center`}>
        <div className="text-center">
          <LoadingSpinner size="xl" text="Loading profile..." />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className={`${embedded ? 'py-12' : 'min-h-screen'} bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4`}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: MessageCircle,
      count: stats.postsCount,
    },
    { id: "reposts", label: "Reposts", icon: Repeat, count: reposts.length },
    {
      id: "articles",
      label: "Articles",
      icon: BookOpen,
      count: stats.articlesCount,
    },
    {
      id: "badges",
      label: "Badges, Rewards & Certificates",
      icon: Award,
      count: badges.length + rewards.length + certificates.length,
    },
    { id: "friends", label: "Friends", icon: Users, count: stats.friendsCount },
  ];

  const content = (
    <div className="w-full">
          {/* Header */}
          {!embedded && (
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {profileUser.firstName} {profileUser.lastName}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {stats.postsCount} posts • {stats.followersCount} followers
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm">
            {/* Cover Photo — hidden when embedded (UserProfile already shows it) */}
            {!embedded && (
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {profileUser.coverImage && (
                <img
                  src={profileUser.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            )}

            {/* Profile Info */}
            <div className="px-4 sm:px-6 pb-4">
              {!embedded && (<>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-20 sm:-mt-16 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={
                        profileUser.avatar ||
                        `https://ui-avatars.com/api/?name=${profileUser.firstName}+${profileUser.lastName}&background=4f46e5&color=ffffff`
                      }
                      alt={profileUser.firstName}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                    />
                    {/* Verification Badge */}
                    {profileUser.plan === "PREMIUM" &&
                      profileUser.planExpiresAt &&
                      new Date(profileUser.planExpiresAt) > new Date() && (
                        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                          <VerificationBadge size="lg" />
                        </div>
                      )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                  {currentUser && currentUser.id !== profileUser.id && (
                    <>
                      <button
                        onClick={handleMessage}
                        className="px-3 py-2 sm:px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                      >
                        <MessageCircle className="h-4 w-4 mr-1 sm:mr-2 inline" />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                      <button
                        onClick={handleAddFriend}
                        className={`px-3 py-2 sm:px-4 rounded-full transition-colors text-sm sm:text-base ${
                          isFriend
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isFriend ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-1 sm:mr-2 inline" />
                            <span className="hidden sm:inline">Friends</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1 sm:mr-2 inline" />
                            <span className="hidden sm:inline">Add Friend</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleFollow}
                        className={`px-3 py-2 sm:px-4 rounded-full transition-colors text-sm sm:text-base ${
                          isFollowing
                            ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {showMoreMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                        <button
                          onClick={handleShare}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share Profile
                        </button>
                        {currentUser && currentUser.id !== profileUser.id && (
                          <button
                            onClick={handleReport}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Flag className="h-4 w-4" />
                            Report User
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileUser.firstName} {profileUser.lastName}
                  </h2>
                  {/* Verification Badge */}
                  {profileUser.plan === "PREMIUM" &&
                    profileUser.planExpiresAt &&
                    new Date(profileUser.planExpiresAt) > new Date() && (
                      <VerificationBadge size="md" />
                    )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  @{profileUser.username}
                </p>

                {profileUser.bio && (
                  <p className="text-gray-900 dark:text-white mb-4">
                    {profileUser.bio}
                  </p>
                )}

                {/* Additional Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {profileUser.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {getJoinDate()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.followingCount}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Following
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.followersCount}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Followers
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.friendsCount}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Friends
                    </span>
                  </div>
                  {subscribers.count > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {subscribers.count}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Subscribers
                      </span>
                    </div>
                  )}
                </div>
              </div>
              </>)}

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex overflow-x-auto space-x-4 sm:space-x-6 lg:space-x-8 scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          loadTabContent(tab.id);
                        }}
                        className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex flex-col items-center gap-1 relative whitespace-nowrap flex-shrink-0 ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full min-w-[18px] sm:min-w-[20px] text-center">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 min-h-96">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading content..." />
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                {activeTab === "posts" && (
                  <div className="max-w-2xl mx-auto space-y-4">
                    {allPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No posts yet
                        </p>
                      </div>
                    ) : (
                      allPosts.map((post) => (
                        <div key={post.id} className="w-full">
                          <PostCard post={post} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "reposts" && (
                  <div className="max-w-2xl mx-auto space-y-4">
                    {reposts.length === 0 ? (
                      <div className="text-center py-12">
                        <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No reposts yet
                        </p>
                      </div>
                    ) : (
                      reposts.map((post) => (
                        <div key={post.id} className="w-full">
                          <PostCard post={post} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "articles" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {articles.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No articles yet
                        </p>
                      </div>
                    ) : (
                      articles.map((article) => (
                        <div key={article.id} className="w-full">
                          <ArticleCard article={article} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "badges" && (
                  <div className="p-4 sm:p-6">
                    <UserRewardsProfile userId={profileUser.id} />
                  </div>
                )}

                {activeTab === "friends" && (
                  <div className="p-4 sm:p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Friends ({friends.length})
                      </h3>
                      {friends.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            No friends yet
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {friends.map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <img
                                src={
                                  friend.avatar ||
                                  `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}&background=4f46e5&color=ffffff`
                                }
                                alt={friend.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {friend.firstName} {friend.lastName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  @{friend.username}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {mutualFriends.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Mutual Friends ({mutualFriends.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {mutualFriends.map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <img
                                src={
                                  friend.avatar ||
                                  `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}&background=4f46e5&color=ffffff`
                                }
                                alt={friend.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {friend.firstName} {friend.lastName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  @{friend.username}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
    </div>
  );

  // Embedded mode: render only the profile content (no page chrome)
  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
     

      {/* Sidebar - Fixed on desktop */}
      <Sidebar
        onCreatePost={() => {}}
        onCreateStory={() => {}}
        onCreateArticle={() => {}}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content - Full width with proper spacing */}
      <main className="lg:ml-64 px-0 sm:px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {content}
      </main>

      {/* Right Sidebar - Desktop */}

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default PublicProfile;
