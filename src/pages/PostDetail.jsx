import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MoreHorizontal,
  Share2,
  Flag,
  X,
  Copy,
  Send,
  Edit3,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import postService from "../services/postService";
import PostCard from "../components/PostCard";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import RightSidebar from "../components/RightSidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import BoostPostModal from "../components/BoostPostModal";
import MediaPreviewModal from "../components/MediaPreviewModal";
import { getShortPostUrl, getShortenedPostUrl, copyToClipboard, copyShortLink } from "../utils/linkShortener";
import resolveMediaUrl from "../utils/mediaUrl";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteContent, setQuoteContent] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaStartIndex, setMediaStartIndex] = useState(0);
  const actionHandledRef = useRef(false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    // Handle navigation-initiated actions like repost and boost
    if (!id || actionHandledRef.current) return;
    const action = location.state?.action;
    if (!action) return;

    const clearState = () => {
      actionHandledRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      // allow future actions
      setTimeout(() => {
        actionHandledRef.current = false;
      }, 0);
    };

    if (action === "boost") {
      setShowBoostModal(true);
      clearState();
    }

    if (action === "repost") {
      setShowRepostModal(true);
      clearState();
    }

    if (action === "edit") {
      setEditContent(post?.content || "");
      setShowEditModal(true);
      clearState();
    }

    if (action === "delete") {
      setShowDeleteConfirm(true);
      clearState();
    }

    if (action === "share") {
      setShowShareModal(true);
      clearState();
    }
  }, [id, location.state, navigate, location.pathname]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getPost(id);

      if (response.success) {
        setPost(response.data);
      } else {
        setError(response.message || "Post not found");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.message || "Failed to load post");
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // If no meaningful history, go home
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToggleRepost = async () => {
    try {
      const res = await postService.toggleRepost(id);
      await fetchPost();
      if (res?.isReposted || res?.success) {
        toast.success("Reposted");
      } else if (res?.unreposted) {
        toast.success("Repost removed");
      } else {
        toast.success("Repost updated");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to toggle repost");
    } finally {
      setShowRepostModal(false);
    }
  };

  const handleQuoteSubmit = async () => {
    if (!quoteContent.trim()) return;
    try {
      const res = await postService.quoteRepost(id, quoteContent.trim());
      if (res?.success) {
        toast.success("Quote reposted!");
        setQuoteContent("");
        setShowQuoteModal(false);
        await fetchPost();
      } else {
        toast.success("Quote reposted");
        setQuoteContent("");
        setShowQuoteModal(false);
        await fetchPost();
      }
    } catch (err) {
      toast.error(err?.message || "Failed to quote repost");
    }
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim()) {
      toast.error("Please enter some content");
      return;
    }
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("content", editContent.trim());
      await postService.updatePost(id, formData);
      setShowEditModal(false);
      toast.success("Post updated successfully!");
      await fetchPost();
    } catch (error) {
      toast.error("Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await postService.deletePost(id);
      toast.success("Post deleted successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyLink = async () => {
    toast.loading('Shortening link...', { id: 'copy-link' });
    const shortUrl = await copyShortLink(getShortPostUrl(id));
    toast.success(`Link copied: ${shortUrl}`, { id: 'copy-link' });
    setShowShareModal(false);
  };

  const handleShareToSocial = async (platform) => {
    toast.loading('Shortening link...', { id: 'share-link' });
    const shortUrl = await getShortenedPostUrl(id);
    toast.dismiss('share-link');
    const text = post?.content?.slice(0, 200) || 'Check out this post!';
    const textShort = post?.content?.slice(0, 100) || 'Check out this post!';
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(textShort + '\n\n' + shortUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(textShort)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shortUrl)}&title=${encodeURIComponent(textShort)}`,
      email: `mailto:?subject=${encodeURIComponent('Check out this post')}&body=${encodeURIComponent(text + '\n\n' + shortUrl)}`,
    };
    if (platform === 'email') {
      window.location.href = urls[platform];
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {user && <Navbar onMenuToggle={toggleSidebar} />}
        {user && <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />}
        {/* Main Content */}
        <main className={`${user ? 'lg:ml-64 lg:mr-80' : ''} px-0 sm:px-4 lg:px-6 ${user ? 'pt-24 lg:pt-6' : 'pt-6'} pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen`}>
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          </div>
        </main>
        {/* Right Sidebar - Desktop */}
        {user && (
          <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
            <RightSidebar />
          </div>
        )}
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {user && <Navbar onMenuToggle={toggleSidebar} />}
        {user && <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />}
        {/* Main Content */}
        <main className={`${user ? 'lg:ml-64 lg:mr-80' : ''} px-0 sm:px-4 lg:px-6 ${user ? 'pt-24 lg:pt-6' : 'pt-6'} pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen`}>
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Post Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                  {error || "The post you are looking for does not exist."}
                </p>
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </main>
        {/* Right Sidebar - Desktop */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
          <RightSidebar />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && <Navbar onMenuToggle={toggleSidebar} />}
      {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      {/* Main Content */}
      <main className={`${user ? 'lg:ml-64 lg:mr-80' : ''} px-0 sm:px-4 lg:px-6 ${user ? 'pt-24 lg:pt-6' : 'pt-6'} pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 mt-6 lg:mt-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Post
              </h1>
            </div>
          </div>

          {/* Media Viewer Grid (Detail page) */}
          {(function () {
            if (!post) return null;
            const hasOwnMedia =
              (post?.images && post.images.length > 0) ||
              (post?.videos && post.videos.length > 0);
            const original =
              post?.originalPost || post?.original || post?.sourcePost;
            const mediaSource =
              post?.isRepost && !post?.quotedPost && !hasOwnMedia && original
                ? original
                : post;
            const media =
              [
                ...(mediaSource?.image
                  ? [{ url: resolveMediaUrl(mediaSource.image), type: "image" }]
                  : []),
                ...(mediaSource?.images?.map((img) => ({
                  url: resolveMediaUrl(typeof img === "string" ? img : img.url),
                  type: "image",
                })) || []),
                ...(mediaSource?.videos?.map((vid) => ({
                  url: resolveMediaUrl(typeof vid === "string" ? vid : vid.url),
                  type: "video",
                })) || []),
              ].filter((m) => m.url) || [];
            if (media.length === 0) return null;
            const getGridCols = (count) => {
              if (count === 1) return "grid-cols-1";
              if (count === 2) return "grid-cols-2";
              return "grid-cols-2";
            };
            return (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
                {media.length === 1 ? (
                  // Single media: show fully without cropping
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {media[0].type === "video" ? (
                      <video
                        src={media[0].url}
                        className="w-full max-h-[70vh] object-contain bg-black"
                        preload="metadata"
                        playsInline
                        controls
                      />
                    ) : (
                      <img
                        src={media[0].url}
                        alt="media-0"
                        className="w-full h-auto max-h-[70vh] object-contain cursor-pointer"
                        onClick={() => {
                          setMediaStartIndex(0);
                          setShowMediaModal(true);
                        }}
                      />
                    )}
                  </div>
                ) : (
                <div
                  className={`grid gap-2 sm:gap-3 rounded-xl sm:rounded-2xl overflow-hidden ${getGridCols(
                    Math.min(media.length, 4)
                  )}`}
                >
                  {media.slice(0, 4).map((m, idx) => {
                    const isVideo = m.type === "video";
                    // For videos on detail: render playable video directly (like reposted videos)
                    if (isVideo) {
                      return (
                        <div
                          key={`media-${idx}`}
                          className="relative overflow-hidden rounded-lg sm:rounded-xl bg-black aspect-square"
                        >
                          <video
                            src={m.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            playsInline
                            controls
                          />
                        </div>
                      );
                    }
                    // Images: keep modal preview on click
                    return (
                      <div
                        key={`media-${idx}`}
                        className="relative cursor-pointer group overflow-hidden rounded-lg sm:rounded-xl bg-black aspect-square"
                        onClick={() => {
                          setMediaStartIndex(idx);
                          setShowMediaModal(true);
                        }}
                      >
                        <img
                          src={m.url}
                          alt={`media-${idx}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    );
                  })}
                  {media.length > 4 && (
                    <div
                      className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold cursor-pointer rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => {
                        setMediaStartIndex(0);
                        setShowMediaModal(true);
                      }}
                    >
                      +{media.length - 4}
                    </div>
                  )}
                </div>
                )}
              </div>
            );
          })()}

          {/* Post */}
          <PostCard
            hideMedia={true}
            post={(function () {
              // For simple reposts without quote, include original media if this post has none
              const hasOwnMedia =
                (post?.images && post.images.length > 0) ||
                (post?.videos && post.videos.length > 0);
              if (post?.isRepost && !post?.quotedPost && !hasOwnMedia) {
                const original =
                  post.originalPost || post.original || post.sourcePost;
                if (original) {
                  return {
                    ...post,
                    images:
                      Array.isArray(post.images) && post.images.length > 0
                        ? post.images
                        : original.images || [],
                    videos:
                      Array.isArray(post.videos) && post.videos.length > 0
                        ? post.videos
                        : original.videos || [],
                  };
                }
              }
              return post;
            })()}
          />
        </div>
      </main>
      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
        <RightSidebar />
      </div>
      {/* Boost Modal */}
      <BoostPostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        postId={post?.id}
        onBoostSuccess={(data) => {
          // Update local post state to reflect boost
          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  isBoosted: true,
                  boostLevel: data?.boost?.level ?? prev.boostLevel,
                  boostExpiresAt: data?.boost?.expiresAt ?? prev.boostExpiresAt,
                }
              : prev
          );
        }}
      />
      {/* Repost Modal */}
      {showRepostModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRepostModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Repost
              </h3>
              <button
                onClick={() => setShowRepostModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                {/* simple close icon using × to avoid extra imports */}
                <span className="text-gray-500 dark:text-gray-400 text-xl leading-none">
                  &times;
                </span>
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                {post?.content}
              </p>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Reposts: {post?._count?.reposts ?? 0}
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleToggleRepost}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-200 dark:border-gray-600"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                  ↻
                </span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Repost / Unrepost
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowRepostModal(false);
                  setShowQuoteModal(true);
                }}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-200 dark:border-gray-600"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                  ❝
                </span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Quote Post
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quote Modal */}
      {showQuoteModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuoteModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-lg relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Quote Post
              </h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <span className="text-gray-500 dark:text-gray-400 text-xl leading-none">
                  &times;
                </span>
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-900 dark:text-white">
                {post?.content}
              </p>
            </div>
            <textarea
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none"
              rows={4}
              maxLength={280}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleQuoteSubmit}
                disabled={!quoteContent.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                Quote Post
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md relative shadow-2xl transform transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Share this post
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Choose a platform to share
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Share Options */}
            <div className="p-4 sm:p-6 space-y-3">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 p-4 text-left bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 rounded-xl transition-all duration-200 border border-blue-200 dark:border-blue-800 group"
              >
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Copy Link
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Copy post URL to clipboard
                  </div>
                </div>
              </button>

              {/* Social Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Twitter/X */}
                <button
                  onClick={() => handleShareToSocial('twitter')}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-2 sm:p-3 bg-black dark:bg-gray-900 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    X (Twitter)
                  </div>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShareToSocial('facebook')}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-2 sm:p-3 bg-blue-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    Facebook
                  </div>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleShareToSocial('whatsapp')}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-2 sm:p-3 bg-green-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    WhatsApp
                  </div>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => handleShareToSocial('telegram')}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-2 sm:p-3 bg-blue-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    Telegram
                  </div>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleShareToSocial('linkedin')}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-2 sm:p-3 bg-blue-700 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    LinkedIn
                  </div>
                </button>

                {/* Reddit */}
                <button
                  onClick={() => handleShareToSocial('reddit')}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-2 sm:p-3 bg-orange-600 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    Reddit
                  </div>
                </button>
              </div>

              {/* Email Share */}
              <button
                onClick={() => handleShareToSocial('email')}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
              >
                <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                  <Send className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Share via Email
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Send to your contacts
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all animate-slideUp border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Post
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update your post content below
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="relative">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px] leading-relaxed"
                  rows={8}
                  placeholder="Share your thoughts, ideas, or updates..."
                  maxLength={5000}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {editContent.length > 0 && (
                      <span className={editContent.length > 4500 ? "text-orange-500" : "text-gray-500"}>
                        {editContent.length.toLocaleString()} / 5,000 characters
                      </span>
                    )}
                  </div>
                  {editContent.trim() && editContent.trim() !== post?.content?.trim() && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Changes detected
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={!editContent.trim() || isUpdating || editContent.trim() === post?.content?.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Post
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Media Preview Modal */}
      {post &&
        (function () {
          const hasOwnMedia =
            (post?.images && post.images.length > 0) ||
            (post?.videos && post.videos.length > 0);
          const original =
            post?.originalPost || post?.original || post?.sourcePost;
          const mediaSource =
            post?.isRepost && !post?.quotedPost && !hasOwnMedia && original
              ? original
              : post;
          const media =
            [
              ...(mediaSource?.image
                ? [{ url: resolveMediaUrl(mediaSource.image), type: "image" }]
                : []),
              ...(mediaSource?.images?.map((img) => ({
                url: resolveMediaUrl(typeof img === "string" ? img : img.url),
                type: "image",
              })) || []),
              ...(mediaSource?.videos?.map((vid) => ({
                url: resolveMediaUrl(typeof vid === "string" ? vid : vid.url),
                type: "video",
              })) || []),
            ].filter((m) => m.url) || [];
          if (media.length === 0) return null;
          return (
            <MediaPreviewModal
              isOpen={showMediaModal}
              onClose={() => setShowMediaModal(false)}
              media={media}
              currentIndex={mediaStartIndex}
              post={post}
              likeCount={post?._count?.likes || 0}
              commentCount={post?._count?.comments || 0}
              repostCount={post?._count?.reposts || 0}
              isLiked={post?.isLiked || false}
              isReposted={post?.isReposted || false}
            />
          );
        })()}
    </div>
  );
};

export default PostDetail;
