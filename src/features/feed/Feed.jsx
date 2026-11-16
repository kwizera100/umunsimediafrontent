import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "../../components/PostCard";
import QuickPost from "../../components/QuickPost";
import CreatePostModal from "../../components/CreatePostModal";
import PremiumUpgradePrompt from "../../components/PremiumUpgradePrompt";
import postService from "../../services/postService";
import { getAllArticles } from "../../services/articleService";
import { mediaHouseService } from "../../services/mediaHouseService";
import BuyArticleModal from "../../components/BuyArticleModal";
import socketService from "../../services/socketService";
import { Plus, MessageSquare, Clock, BookOpen, ArrowRight, ShoppingCart, Share2 } from "lucide-react";
import toast from "react-hot-toast";

const Feed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(true);
  const [suggestedArticles, setSuggestedArticles] = useState([]);
  const [marketArticles, setMarketArticles] = useState([]);
  const [buyingArticle, setBuyingArticle] = useState(null);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
    fetchSuggestedArticles();
    fetchMarketArticles();
  }, []);

  const fetchMarketArticles = async () => {
    try {
      const res = await mediaHouseService.getMarketplace();
      const arts = res.data || res || [];
      if (Array.isArray(arts)) setMarketArticles(arts);
    } catch (e) {
      // marketplace unavailable — silently skip
    }
  };

  const fetchSuggestedArticles = async () => {
    try {
      const res = await getAllArticles();
      const articles = res.data || res.articles || res || [];
      if (Array.isArray(articles) && articles.length > 0) {
        // Shuffle and pick 3-5 random articles
        const shuffled = [...articles].sort(() => Math.random() - 0.5);
        setSuggestedArticles(shuffled.slice(0, 5));
      }
    } catch (error) {
      console.log("Could not fetch suggested articles");
    }
  };

  // Handle route changes - refresh posts when returning to home
  useEffect(() => {
    console.log("Feed component detected route change to:", location.pathname);
    if (location.pathname === "/") {
      console.log("Feed component refreshing posts for home page");
      fetchPosts();
    }
  }, [location.pathname]);

  useEffect(() => {
    // Listen for real-time post like/comment updates
    const handleUpdate = () => {
      fetchPosts(1); // Refetch first page for simplicity
    };

    // Listen for repost events
    const handleRepost = (data) => {
      console.log("Repost event received:", data);
      if (data.repostPost) {
        // Add the new repost post to the beginning of the feed
        setPosts((prev) => [data.repostPost, ...prev]);
      }
    };

    // Listen for un-repost events
    const handleUnrepost = (data) => {
      console.log("Unrepost event received:", data);
      // Remove repost posts from feed (posts with empty content and quotedPostId)
      setPosts((prev) =>
        prev.filter(
          (post) =>
            !(post.content === "" && post.quotedPostId === data.originalPostId)
        )
      );
    };

    // Listen for quote repost events
    const handleQuoteRepost = (data) => {
      console.log("Quote repost event received:", data);
      if (data.quotePost) {
        setPosts((prev) => [data.quotePost, ...prev]);
      }
    };

    socketService.on("post-like-updated", handleUpdate);
    socketService.on("post-comment-updated", handleUpdate);
    socketService.on("post-reposted", handleRepost);
    socketService.on("post-unreposted", handleUnrepost);
    socketService.on("post-quote-reposted", handleQuoteRepost);

    return () => {
      socketService.off("post-like-updated", handleUpdate);
      socketService.off("post-comment-updated", handleUpdate);
      socketService.off("post-reposted", handleRepost);
      socketService.off("post-unreposted", handleUnrepost);
      socketService.off("post-quote-reposted", handleQuoteRepost);
    };
  }, []);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postService.getPosts(pageNum, 10);

      if (response.success) {
        const now = new Date();
        const sorted = [...response.data.posts].sort((a, b) => {
          const aBoosted = a.isBoosted && a.boostExpiresAt && new Date(a.boostExpiresAt) > now;
          const bBoosted = b.isBoosted && b.boostExpiresAt && new Date(b.boostExpiresAt) > now;
          if (aBoosted !== bBoosted) return aBoosted ? -1 : 1; // boosted first
          // fallback to recency
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        if (pageNum === 1) {
          setPosts(sorted);
        } else {
          setPosts((prev) => [...prev, ...sorted]);
        }
        setHasMore(response.data.posts.length === 10);
        setPage(pageNum);
      } else {
        toast.error(response.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Fetch posts error:", error);
      toast.error(error.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleQuickPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="">
      <QuickPost onCreatePost={handleQuickPost} />

      {/* Premium Upgrade Prompt - Show to non-premium users */}
      {user?.plan !== 'PREMIUM' && showPremiumPrompt && (
        <div className="mb-4 sm:mb-6">
          <PremiumUpgradePrompt 
            variant="banner" 
            onDismiss={() => setShowPremiumPrompt(false)}
          />
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="w-full">
          <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-6 lg:p-8 text-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-500 mx-auto mb-3 lg:mb-4"></div>
            <p className="text-gray-400 text-sm lg:text-base">
              Loading posts...
            </p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="w-full">
          <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-6 lg:p-8 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center mb-3 lg:mb-4">
              <div className="p-2 lg:p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-400 mb-4 lg:mb-6 text-sm lg:text-base">
              Be the first to share something with your network!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-500/20 font-semibold text-sm lg:text-base"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4 inline mr-2" />
              Create your first post
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {posts.map((post, idx) => (
            <React.Fragment key={post.id}>
              <div className="w-full">
                <PostCard post={post} />
              </div>
              {/* Insert article suggestion after every 2 posts */}
              {(idx + 1) % 2 === 0 && suggestedArticles.length > 0 && suggestedArticles[Math.floor((idx + 1) / 2 - 1) % suggestedArticles.length] && (
                <SuggestedArticleCard article={suggestedArticles[Math.floor((idx + 1) / 2 - 1) % suggestedArticles.length]} onClick={() => navigate(`/articles/${suggestedArticles[Math.floor((idx + 1) / 2 - 1) % suggestedArticles.length].id}`)} />
              )}
              {/* Insert a paid market article after every 3 posts */}
              {(idx + 1) % 3 === 0 && marketArticles.length > 0 && marketArticles[Math.floor((idx + 1) / 3 - 1) % marketArticles.length] && (
                <MarketArticleCard
                  article={marketArticles[Math.floor((idx + 1) / 3 - 1) % marketArticles.length]}
                  currentUser={user}
                  onBuy={(art) => setBuyingArticle(art)}
                />
              )}
            </React.Fragment>
          ))}

          {hasMore && (
            <div className="mt-4 lg:mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full px-4 lg:px-6 py-2.5 lg:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center text-sm lg:text-base shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                    Load More Posts
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreatePost}
      />

      {/* Buy Article Modal */}
      <BuyArticleModal
        isOpen={!!buyingArticle}
        onClose={() => setBuyingArticle(null)}
        article={buyingArticle}
        onPurchased={() => {
          setBuyingArticle(null);
          fetchMarketArticles();
        }}
      />
    </div>
  );
};

export default Feed;

// Suggested Article Card Component
const SuggestedArticleCard = ({ article, onClick }) => {
  const coverImage = article.coverImage || article.featuredImage || null;
  const title = article.title || '';
  const excerpt = article.excerpt || article.summary || article.description || '';
  const author = article.author || article.writer || null;
  const authorName = author
    ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username || ''
    : '';

  return (
    <div
      onClick={onClick}
      className="w-full cursor-pointer group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-none sm:rounded-2xl border-y sm:border border-blue-200 dark:border-blue-900/40 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100/60 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-900/40">
        <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Suggested Article</span>
      </div>
      <div className="flex flex-col sm:flex-row">
        {coverImage && (
          <div className="sm:w-32 sm:flex-shrink-0">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-32 sm:h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            {authorName && (
              <span className="text-xs text-gray-500 dark:text-gray-500">by {authorName}</span>
            )}
            <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
              Read <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Market Article Card — a paid article for sale in the feed
const MarketArticleCard = ({ article, currentUser, onBuy }) => {
  const [showPreview, setShowPreview] = useState(false);
  const cover = article.coverImage || null;
  const writer = article.writer || {};
  const writerName = `${writer.firstName || ''} ${writer.lastName || ''}`.trim() || writer.username || 'Writer';
  const isOwner = currentUser && currentUser.id === article.writerId;

  const formatRWF = (amount) =>
    new Intl.NumberFormat("rw-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(amount);

  const handleShare = async () => {
    const url = `${window.location.origin}/marketplace?article=${article.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.excerpt, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      }
    } catch (e) { /* user cancelled share */ }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl border-y sm:border border-amber-300 dark:border-amber-700/60 overflow-hidden shadow-sm">
      {/* Header badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/40">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Article for Sale</span>
        </div>
        <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatRWF(article.price)}</span>
      </div>

      {cover && (
        <img src={cover} alt={article.title} className="w-full h-44 object-cover" loading="lazy" />
      )}

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2">{article.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {writerName}</p>

        {/* Preview — summary added by the owner */}
        {article.excerpt && (
          <p className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${showPreview ? '' : 'line-clamp-2'}`}>
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2 mt-4">
          {article.excerpt && article.excerpt.length > 120 && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {showPreview ? 'Show Less' : 'Preview'}
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {!isOwner && (
            <button
              onClick={() => onBuy(article)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" /> Buy — {formatRWF(article.price)}
            </button>
          )}
        </div>
        {isOwner && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This is your article on sale — you earn 70% per sale.</p>
        )}
      </div>
    </div>
  );
};
