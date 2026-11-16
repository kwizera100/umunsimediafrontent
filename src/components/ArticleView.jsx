import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getArticleById,
  deleteArticle,
  likeArticle,
  unlikeArticle,
  getArticleLikes,
  deleteArticleImage,
  getArticleComments,
  shareArticle,
  checkArticleAccess,
} from "../services/articleService";
import BuyArticleModal from "./BuyArticleModal";
import { useAuth } from "../contexts/AuthContext";
import EditArticleModal from "./EditArticleModal";
import ArticleComments from "./ArticleComments";
import Badge from "./Badge";
import badgeService from "../services/badgeService";
import UserDisplay from "./UserDisplay";
import {
  Tag,
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
  Calendar,
  Eye,
  BookOpen,
  ArrowLeft,
  MoreHorizontal,
  Edit3,
  Trash2,
  Flag,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Download,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Menu,
  Home,
  User,
  Settings,
  Bell,
  Search,
  LogOut,
  Plus,
  Star,
} from "lucide-react";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import RightSidebar from "./RightSidebar";
import MobileNav from "./MobileNav";
import CreateArticleModal from "./CreateArticleModal";
import CreatePostModal from "./CreatePostModal";
import CreateStoryModal from "./CreateStoryModal";
import socketService from "../services/socketService";
import postService from "../services/postService";
import toast from "react-hot-toast";
import Logo from "../assets/Logo.png";
import LoginPrompt from "./LoginPrompt";
import { getShortArticleUrl } from "../utils/linkShortener";

// Use the backend API URL as the base for images
const BASE_URL = import.meta.env.VITE_API_URL || "https://fggg.space";

// Enhanced image URL helper with error handling
const getImageUrl = (img, type = "articles") => {
  if (!img) return "";
  let url = typeof img === "string" ? img : img.url;
  if (!url) return "";

  // If already a full URL, return as is
  if (url.startsWith("http")) return url;

  // Gallery images
  if (
    type === "gallery" ||
    /^gallery-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)
  ) {
    // Handle old URL format: /uploads/articles/gallery-filename.jpg
    if (
      url.includes("/uploads/articles/gallery-") &&
      !url.includes("/uploads/articles/gallery/gallery-")
    ) {
      const filename = url.split("/").pop(); // Get just the filename
      return `${BASE_URL}/uploads/articles/gallery/${filename}`;
    }

    url = url.replace(/^gallery\//, "");
    return `${BASE_URL}/uploads/articles/gallery/${url}`;
  }

  // Main article image
  if (
    type === "articles" ||
    /^article-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)
  ) {
    url = url.replace(/^articles\//, "");
    return `${BASE_URL}/uploads/articles/${url}`;
  }

  // Cover image
  if (
    type === "covers" ||
    /^coverImage-\d+-\d+\.(jpeg|jpg|png|webp|gif)$/i.test(url)
  ) {
    url = url.replace(/^covers\//, "");
    return `${BASE_URL}/uploads/covers/${url}`;
  }

  return `${BASE_URL}/uploads/${url}`;
};

const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || "Unknown User";
};

const getUserAvatar = (user) => {
  if (!user) {
    return "https://ui-avatars.com/api/?name=Unknown&background=4f46e5&color=ffffff";
  }
  if (user.avatar) {
    if (user.avatar.startsWith("http")) {
      return user.avatar;
    }
    let avatarPath = user.avatar.replace(/^avatars\//, "");
    return `${BASE_URL}/uploads/avatars/${avatarPath}`;
  }
  const name = getUserDisplayName(user);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=4f46e5&color=ffffff`;
};

const ArticleView = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef();

  // Core state
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState({ count: 0, users: [] });
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [shareCount, setShareCount] = useState(0);

  // Badge and reward state
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // UI state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isSharingToFeed, setIsSharingToFeed] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyMode, setBuyMode] = useState("single");

  // Load article data
  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getArticleById(id);
      setArticle(data);
      setShareCount(data.shareCount || 0);

      // Fetch comments
      try {
        const initialComments = await getArticleComments(id);
        setComments(initialComments || []);
      } catch (err) {
        console.log("Comments not available");
      }

      // Fetch likes
      try {
        const likesData = await getArticleLikes(id);
        setLikes(likesData);
        setLiked(likesData.users.some((like) => like.userId === user?.id));
      } catch (err) {
        console.log("Likes not available");
      }

      // Fetch badges and rewards
      try {
        setLoadingBadges(true);
        const [badgesData, rewardsData] = await Promise.all([
          badgeService.getArticleBadges(id),
          badgeService.getArticleRewards(id),
        ]);

        const processedBadges =
          badgesData.map((item) => item.badge || item) || [];
        const processedRewards =
          rewardsData.map((item) => item.reward || item) || [];

        setBadges(processedBadges);
        setRewards(processedRewards);
      } catch (err) {
        console.log("Badges and rewards not available");
        setBadges([]);
        setRewards([]);
      } finally {
        setLoadingBadges(false);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) {
      setLoginPromptMessage("Please log in to like articles");
      setShowLoginPrompt(true);
      return;
    }

    try {
      if (liked) {
        await unlikeArticle(id);
        setLikes((prev) => ({
          count: prev.count - 1,
          users: prev.users.filter((like) => like.userId !== user.id),
        }));
        setLiked(false);
      } else {
        await likeArticle(id);
        setLikes((prev) => ({
          count: prev.count + 1,
          users: [...prev.users, { userId: user.id, user }],
        }));
        setLiked(true);
        setLikeAnimation(true);
        setTimeout(() => setLikeAnimation(false), 600);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user || user.id !== article.authorId) {
      toast.error("You can only delete your own articles");
      return;
    }

    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      await deleteArticle(id);
      toast.success("Article deleted successfully");
      navigate("/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      const url = getShortArticleUrl(id);
      setShareUrl(url);
      setShareModalOpen(true);

      // Increment share count
      await shareArticle(id);
      setShareCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error sharing article:", error);
    }
  };

  // Copy share URL
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || getShortArticleUrl(id));
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Error copying URL:", error);
      toast.error("Failed to copy link");
    }
  };

  // Share article as a public post in the feed
  const shareToFeed = async () => {
    if (!user) {
      toast.error("Please log in to share articles");
      return;
    }
    setIsSharingToFeed(true);
    try {
      const url = shareUrl || getShortArticleUrl(id);
      const excerpt = (article.excerpt || article.summary || "").trim();
      const author = article.author;
      const isOwnArticle = author?.id && author.id === user.id;
      let content = "";
      if (!isOwnArticle && author) {
        content += `\u{1F501} Reposted article by ${author.username ? `@${author.username}` : getUserDisplayName(author)}\n`;
      }
      content += `\u{1F4F0} ${article.title}\n`;
      if (excerpt) {
        content += `\n${excerpt.slice(0, 180)}${excerpt.length > 180 ? "..." : ""}\n`;
      }
      content += `\nRead the full article: ${url}`;

      const postData = { content };

      // Try to attach the article's cover image so the post shows it
      const imgUrl = article.image
        ? getImageUrl(article.image, "articles")
        : article.coverImage
        ? getImageUrl(article.coverImage, "covers")
        : null;
      if (imgUrl) {
        try {
          const resp = await fetch(imgUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            const ext = (blob.type.split("/")[1] || "jpg").split(";")[0];
            postData.image = new File([blob], `article-${id}.${ext}`, { type: blob.type });
          }
        } catch (imgErr) {
          console.warn("Could not attach article image:", imgErr);
        }
      }

      await postService.createPost(postData);
      toast.success("Article shared to your feed!");
      setShareModalOpen(false);
    } catch (error) {
      console.error("Error sharing article to feed:", error);
      toast.error(error.message || "Failed to share article");
    } finally {
      setIsSharingToFeed(false);
    }
  };

  // Share to social media
  const shareToSocial = (platform) => {
    const url = encodeURIComponent(shareUrl || getShortArticleUrl(id));
    const title = encodeURIComponent(article.title);
    let shareLink = "";

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${title}%20${url}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }

    window.open(shareLink, "_blank", "width=600,height=400");
  };

  // Modal handlers
  const handleCreatePost = (postData) => {
    console.log("Post created:", postData);
    setIsPostModalOpen(false);
  };

  const handleCreateStory = async (storyData) => {
    try {
      setIsCreatingStory(true);
      console.log("Story created:", storyData);
      setIsStoryModalOpen(false);
    } catch (error) {
      console.error("Error creating story:", error);
    } finally {
      setIsCreatingStory(false);
    }
  };

  const handleModalClose = (created) => {
    setModalOpen(false);
    if (created) {
      toast.success("Article created successfully!");
    }
  };

  // Handle image modal
  const openImageModal = (imageUrl, index = 0) => {
    setSelectedImage(imageUrl);
    setGalleryIndex(index);
    setImageModalOpen(true);
  };

  const navigateGallery = (direction) => {
    if (!article.gallery || article.gallery.length === 0) return;

    let newIndex = galleryIndex;
    if (direction === "next") {
      newIndex = (galleryIndex + 1) % article.gallery.length;
    } else {
      newIndex =
        galleryIndex === 0 ? article.gallery.length - 1 : galleryIndex - 1;
    }

    setGalleryIndex(newIndex);
    setSelectedImage(getImageUrl(article.gallery[newIndex], "gallery"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {user && (
          <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </div>
        )}
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading article...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {user && (
          <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </div>
        )}
        <div className="flex justify-center items-center min-h-screen px-4">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Article Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "The article you are looking for does not exist."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors duration-200"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate("/articles")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
              >
                Browse Articles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shareModal = shareModalOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Article
          </h3>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Copy Link */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Copy link
          </p>
          <div className="flex">
            <input
              type="text"
              value={shareUrl || getShortArticleUrl(id)}
              readOnly
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-xl px-3 py-2 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={copyShareUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-xl transition-colors duration-200 flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Share to feed */}
        <div className="mb-6">
          <button
            onClick={shareToFeed}
            disabled={isSharingToFeed}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-xl transition-colors font-medium"
          >
            {isSharingToFeed ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5" />
                <span>Share to your feed</span>
              </>
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Share on social media
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => shareToSocial("whatsapp")}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-green-600 dark:text-green-400 p-3 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium text-xs">WhatsApp</span>
            </button>
            <button
              onClick={() => shareToSocial("facebook")}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-3 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
            >
              <Facebook className="h-5 w-5" />
              <span className="font-medium text-xs">Facebook</span>
            </button>
            <button
              onClick={() => shareToSocial("twitter")}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-3 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
            >
              <Twitter className="h-5 w-5" />
              <span className="font-medium text-xs">Twitter</span>
            </button>
            <button
              onClick={() => shareToSocial("linkedin")}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-3 rounded-md transition-colors border border-gray-200 dark:border-gray-600"
            >
              <Linkedin className="h-5 w-5" />
              <span className="font-medium text-xs">LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Paywall — article has a price and the user hasn't purchased/subscribed
  if (article.locked) {
    const writerName = getUserDisplayName(article.author);
    const monthlyPrice = (article.author && article.author.monthlyPrice) || 1000;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {user && (
          <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </div>
        )}
        <div className="flex justify-center items-center min-h-screen px-4 py-16">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {article.coverImage && (
              <img src={getImageUrl(article.coverImage, 'covers')} alt={article.title} className="w-full h-auto block" />
            )}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Premium Article</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{article.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">by {writerName}</p>
              {article.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">{article.excerpt}…</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handleShare}
                  title="Share"
                  aria-label="Share"
                  className="flex items-center justify-center p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={shareToFeed}
                  disabled={isSharingToFeed}
                  title="Share to feed"
                  aria-label="Share to feed"
                  className="flex items-center justify-center p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <Repeat2 className={`h-5 w-5 ${isSharingToFeed ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">This article is for monthly subscribers. To read the full article:</p>
                <button
                  onClick={() => {
                    if (!user) { setLoginPromptMessage("Please log in to subscribe"); setShowLoginPrompt(true); return; }
                    setBuyMode("monthly");
                    setShowBuyModal(true);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold"
                >
                  Subscribe to {writerName} — {monthlyPrice.toLocaleString()} RWF/mo
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">Unlocks all paid articles from this writer</p>
              </div>
              <button onClick={() => navigate('/articles')} className="text-sm text-gray-500 underline">Back to articles</button>
            </div>
          </div>
        </div>
        <BuyArticleModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          article={article}
          textArticle
          defaultMode={buyMode}
          onPurchased={() => { setShowBuyModal(false); fetchArticle(); }}
        />
        {showLoginPrompt && (
          <LoginPrompt message={loginPromptMessage} onClose={() => setShowLoginPrompt(false)} />
        )}
        {shareModal}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">

      {/* Fixed Desktop Navigation */}
      {user && (
        <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
          <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
      )}

      {/* Fixed Mobile Header */}
      <div className={`${user ? 'md:hidden' : ''} fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Article
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Container */}
      <div className={`flex flex-1 ${user ? 'pt-12 md:pt-16' : 'pt-0'} relative z-10`}>
        {/* Sidebar - Mobile slide-in, Desktop fixed */}
        {user && (
          <Sidebar
            onCreatePost={() => setIsPostModalOpen(true)}
            onCreateStory={() => setIsStoryModalOpen(true)}
            onCreateArticle={() => setModalOpen(true)}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Fixed Right Sidebar - Desktop only */}
        {user && (
          <div className="hidden lg:block fixed right-0 top-16 bottom-0 w-80 z-40">
            <RightSidebar />
          </div>
        )}

        {/* Main Content Area with proper margins for fixed sidebars */}
        <div className={`flex-1 min-w-0 overflow-x-hidden ${user ? 'lg:ml-64 lg:mr-80' : ''} relative`}>
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Back Button - Desktop only */}
            <div className="hidden lg:block mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Articles</span>
              </button>
            </div>

            {/* Article Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {article.title}
                  </h1>

                  {/* Badges and Rewards Display */}
                  {!loadingBadges &&
                    (badges.length > 0 || rewards.length > 0) && (
                      <div className="flex items-center gap-3 mb-6">
                        {badges.map((badge, index) => (
                          <Badge
                            key={`badge-${index}`}
                            badge={badge}
                            size="md"
                            animated={
                              badge.type === "EDITORS_CHOICE" ||
                              badge.type === "TRENDING"
                            }
                          />
                        ))}
                        {rewards.map((reward, index) => (
                          <Badge
                            key={`reward-${index}`}
                            badge={reward}
                            size="md"
                            animated={true}
                          />
                        ))}
                      </div>
                    )}

                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <UserDisplay
                      user={article.author}
                      size="md"
                      showUsername={false}
                      showVerification={true}
                      linkToProfile={true}
                    />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {new Date(article.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{article.views || 0} views</span>
                    </div>
                    {article.category && (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                          {article.category.name}
                        </span>
                      </div>
                    )}
                    {user && user.id === article.authorId && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditModalOpen(true)}
                          title="Edit article"
                          aria-label="Edit article"
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleDelete}
                          title="Delete article"
                          aria-label="Delete article"
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Article Image */}
              {article.image && (
                <div className="mb-6 -mx-4 sm:mx-0">
                  <img
                    src={getImageUrl(article.image, "articles")}
                    alt={article.title}
                    onClick={() => openImageModal(getImageUrl(article.image, "articles"))}
                    className="w-full h-auto block cursor-zoom-in sm:rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none w-full min-w-0 overflow-x-hidden mb-8 prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-4 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-img:max-w-full prose-img:h-auto prose-img:rounded-md prose-img:my-6 prose-img:mx-auto prose-img:block prose-img:cursor-pointer prose-img:hover:opacity-90 prose-img:transition-opacity prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic prose-pre:my-6 prose-hr:my-8">
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="w-full max-w-full overflow-x-hidden break-words [overflow-wrap:anywhere] [&_*]:!max-w-full [&_*]:![white-space:normal] [&_*]:![overflow-wrap:anywhere] [&_table]:!block [&_table]:overflow-x-auto [&_iframe]:!w-full [&_video]:!w-full [&_img]:!w-auto text-gray-900 dark:text-gray-100 leading-relaxed [&_p]:my-4 [&_p]:leading-relaxed [&_p:first-child]:mt-0 [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:my-4 [&_ul]:space-y-2 [&_ol]:my-4 [&_ol]:space-y-2 [&_li]:my-2 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:shadow-sm [&_img]:cursor-pointer [&_img]:hover:opacity-90 [&_img]:transition-opacity [&_br]:my-2 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-700 dark:[&_a]:hover:text-blue-300 [&_strong]:font-bold [&_em]:italic [&_hr]:my-8 [&_hr]:border-gray-300 dark:[&_hr]:border-gray-600"
                onClick={(e) => {
                  // Make images in content clickable to view in modal
                  if (e.target.tagName === 'IMG') {
                    const imgSrc = e.target.src;
                    if (imgSrc) {
                      setSelectedImage(imgSrc);
                      setImageModalOpen(true);
                    }
                  }
                }}
              />
            </div>

            {/* Gallery */}
            {article.gallery && article.gallery.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {article.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        openImageModal(getImageUrl(image, "gallery"), index)
                      }
                      className="aspect-square overflow-hidden rounded-md hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={getImageUrl(image, "gallery")}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tagWrapper, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded text-xs sm:text-sm font-medium"
                    >
                      <Tag className="h-3 w-3" />
                      {tagWrapper.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between py-4 sm:py-6 border-t border-b border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors ${
                    liked
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${liked ? "fill-current" : ""} ${
                      likeAnimation ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="font-medium text-sm sm:text-base">{likes.count}</span>
                </button>

                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">{comments.length}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">{shareCount}</span>
                </button>

                <button
                  onClick={shareToFeed}
                  disabled={isSharingToFeed}
                  title="Share to feed"
                  aria-label="Share to feed"
                  className="flex items-center justify-center p-2 sm:p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 rounded-md transition-colors"
                >
                  <Repeat2 className={`h-4 w-4 sm:h-5 sm:w-5 ${isSharingToFeed ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <ArticleComments
              articleId={id}
              comments={comments}
              setComments={setComments}
              user={user}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      {user?.plan === "PREMIUM" && (
        <div className="fixed bottom-20 right-4 z-50 md:hidden">
          <button
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md w-12 h-12 transition-colors"
            onClick={() => setModalOpen(true)}
            aria-label="Create Article"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Fixed Mobile Navigation at bottom */}

      {/* Share Modal */}
      {shareModal}

      {/* Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black/90 text-white rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {article.gallery && article.gallery.length > 1 && (
              <>
                <button
                  onClick={() => navigateGallery("prev")}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 text-white rounded-md transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigateGallery("next")}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 text-white rounded-md transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <img
              src={selectedImage}
              alt="Gallery image"
              className="block mx-auto max-w-full max-h-[90vh] w-auto h-auto object-contain"
            />

            {article.gallery && article.gallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded text-sm">
                {galleryIndex + 1} / {article.gallery.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <EditArticleModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          article={article}
          onSave={(updatedArticle) => {
            setArticle(updatedArticle);
            setEditModalOpen(false);
            toast.success("Article updated successfully!");
          }}
        />
      )}

      {/* Modals */}
      <CreateArticleModal isOpen={modalOpen} onClose={handleModalClose} />
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt
          message={loginPromptMessage}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
};

export default ArticleView;
