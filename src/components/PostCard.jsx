import React, { useState, useEffect, useRef, useReducer } from "react";
import {
  Heart,
  MessageSquare,
  Share,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Send,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  X,
  Smile,
  Play,
  Eye,
  Repeat2,
  Quote,
  Zap,
  Image,
  Video,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Heart as HeartSolid } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import socketService from "../services/socketService";
import postService from "../services/postService";
import Avatar from "./Avatar";
import useViewTracking from "../hooks/useViewTracking";
import BoostButton from "./BoostButton";
import VerificationBadge from "./VerificationBadge";
import LoginPrompt from "./LoginPrompt";
import { getShortPostUrl, getShortenedPostUrl, copyToClipboard, copyShortLink } from "../utils/linkShortener";
import resolveMediaUrl from "../utils/mediaUrl";

const PostCard = ({ post, hideMedia = false, showUsername = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Core state
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(post?.isReposted || false);
  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(post?.views || 0);
  const [repostCount, setRepostCount] = useState(post._count?.reposts || 0);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  
  // Comments state
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState({});
  
  // Modal states
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  
  // Edit state
  const [quoteContent, setQuoteContent] = useState("");
  const [editContent, setEditContent] = useState(post?.content || "");
  const [editLocation, setEditLocation] = useState(post?.location || "");
  const [editFeeling, setEditFeeling] = useState(post?.feeling || "");
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editVideoPreviews, setEditVideoPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [removedVideoIds, setRemovedVideoIds] = useState([]);
  const [clearImageFlag, setClearImageFlag] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [showEditLocationInput, setShowEditLocationInput] = useState(false);
  const [showEditFeelingInput, setShowEditFeelingInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // UI state
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  
  // Refs - NO global event listeners
  const dropdownRef = useRef(null);
  const viewRef = useViewTracking(post?.id, "post", {
    threshold: 0.5,
    enabled: !!post?.id,
    onViewTracked: (data) => {
      // Update view count whenever we get view data (even if already viewed)
      if (data && data.views !== undefined && data.views !== null) {
        setViewCount(data.views);
      }
    },
  });
  const hasRefreshedCountsRef = useRef(false);

  // One-time refresh to ensure counts and isReposted are up-to-date after actions on detail page
  useEffect(() => {
    if (!post?.id || hasRefreshedCountsRef.current) return;
    hasRefreshedCountsRef.current = true;
    (async () => {
      try {
        const res = await postService.getPost(post.id);
        const fresh = res?.data || res;
        if (fresh?._count?.reposts !== undefined) {
          setRepostCount(fresh._count.reposts);
        }
        if (fresh?.isReposted !== undefined) {
          setIsReposted(!!fresh.isReposted);
        }
        // Update view count from fresh post data
        if (fresh?.views !== undefined && fresh.views !== null) {
          setViewCount(fresh.views);
        }
      } catch (e) {
        // ignore refresh errors
      }
    })();
  }, [post?.id]);

  // Update view count when post prop changes
  useEffect(() => {
    if (post?.views !== undefined && post.views !== null) {
      setViewCount(post.views);
    }
  }, [post?.views]);

  // Combine images and videos (resolve relative paths against the backend)
  const allMedia = [
    ...(post.image
      ? [{ url: resolveMediaUrl(post.image), type: "image" }]
      : []),
    ...(post.images?.map((img) => ({
      url: resolveMediaUrl(typeof img === "string" ? img : img.url),
      type: "image",
    })) || []),
    ...(post.videos?.map((vid) => ({
      url: resolveMediaUrl(typeof vid === "string" ? vid : vid.url),
      type: "video",
    })) || []),
  ].filter((m) => m.url);

  // Fetch comments
  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const res = await postService.getComments(post.id);
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (Array.isArray(res?.comments)) arr = res.comments;
      else if (Array.isArray(res?.data?.comments)) arr = res.data.comments;
      setComments(arr);
    } catch (err) {
      setCommentsError("Failed to load comments.");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  // Socket listeners - no document listeners
  useEffect(() => {
    const handleLikeUpdate = (data) => {
      if (data.postId === post.id) {
        setLikeCount(data.likeCount);
        if (data.userId === user?.id && data.isLiked !== undefined) {
          setIsLiked(data.isLiked);
        }
      }
    };
    
    const handleCommentUpdate = (data) => {
      if (data.postId === post.id) {
        setCommentCount(data.commentCount);
        if (showComments) fetchComments();
      }
    };

    const handleRepost = (data) => {
      if (data.originalPostId === post.id && data.repostPost) {
        setRepostCount((prev) => prev + 1);
      }
    };

    const handleUnrepost = (data) => {
      if (data.originalPostId === post.id) {
        setRepostCount((prev) => Math.max(0, prev - 1));
        if (data.userId === user?.id) {
          setIsReposted(false);
        }
      }
    };

    const handleQuoteRepost = (data) => {
      // When someone quote-reposts this post, bump the repost count
      if (data.originalPostId === post.id && data.quotePost) {
        setRepostCount((prev) => prev + 1);
        // If the current user is the one who quote-reposted, mark as reposted
        if (data.userId === user?.id) {
          setIsReposted(true);
        }
      }
    };

    socketService.on("post-like-updated", handleLikeUpdate);
    socketService.on("post-comment-updated", handleCommentUpdate);
    socketService.on("post-reposted", handleRepost);
    socketService.on("post-unreposted", handleUnrepost);
    socketService.on("post-quote-reposted", handleQuoteRepost);

    return () => {
      socketService.off("post-like-updated", handleLikeUpdate);
      socketService.off("post-comment-updated", handleCommentUpdate);
      socketService.off("post-reposted", handleRepost);
      socketService.off("post-unreposted", handleUnrepost);
      socketService.off("post-quote-reposted", handleQuoteRepost);
    };
  }, [post.id, user?.id, showComments]);

  // Dropdown closing using ref click-outside - ONLY when dropdown is open
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      // NEVER interfere with navigation - check first
      if (
        e.target.closest("a") ||
        e.target.closest('[data-navigation="true"]') ||
        e.target.closest("nav")
      ) {
        return; // Let navigation work
      }

      // Only close dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    // Small delay to avoid immediate closure
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Body scroll lock for modals
  useEffect(() => {
    const anyModalOpen =
      showShareModal ||
      showEditModal ||
      showDeleteConfirm ||
      showRepostModal ||
      showQuoteModal;

    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [
    showShareModal,
    showEditModal,
    showDeleteConfirm,
    showRepostModal,
    showQuoteModal,
  ]);

  // Safety check
  if (!post) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Post data is missing
        </p>
      </div>
    );
  }

  // Utility functions
  const formatTime = (dateString) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (postUser) => {
    if (!postUser) return "Unknown User";
    if (postUser.firstName && postUser.lastName) {
      return `${postUser.firstName} ${postUser.lastName}`;
    }
    return postUser.username || "Unknown User";
  };

  const rawContent = post?.content || "";
  const articleRepostMatch = rawContent.match(/^\u{1F501} Reposted article by (.+)\n/u);
  const isArticleShare =
    !!articleRepostMatch ||
    (rawContent.startsWith("\u{1F4F0}") && rawContent.includes("Read the full article:"));
  const articleOriginalAuthor = articleRepostMatch?.[1]?.trim();

  const getDisplayText = () => {
    const content = articleRepostMatch ? rawContent.slice(articleRepostMatch[0].length) : rawContent;
    if (!content || content === "undefined") return "";
    if (!isTextExpanded && content.length > 200) {
      return content.substring(0, 200) + "...";
    }
    return content;
  };

  const renderContentWithMentions = () => {
    const text = getDisplayText();
    if (!text) return null;
    // Split by either URLs or @mentions
    const parts = text.split(/(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      const mentionMatch = part.match(/^@([a-zA-Z0-9_]+)$/);
      if (mentionMatch) {
        const username = mentionMatch[1];
        return (
          <Link
            key={`mention-${i}`}
            to={`/u/${username}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {part}
          </Link>
        );
      }
      // Match URLs
      const urlMatch = part.match(/^https?:\/\/[^\s]+/);
      if (urlMatch) {
        return (
          <a
            key={`url-${i}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={`text-${i}`}>{part}</span>;
    });
  };

  // Handlers
  const handleLike = async (e) => {
    e?.stopPropagation();
    if (!user) {
      setLoginPromptMessage("Please log in to like posts");
      setShowLoginPrompt(true);
      return;
    }
    try {
      const res = await postService.toggleLike(post.id);
      setIsLiked(res.isLiked !== undefined ? res.isLiked : !isLiked);
      if (typeof res.likeCount === "number") setLikeCount(res.likeCount);
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await postService.toggleSavePost(post.id);
      setIsSaved(response.data.saved);
    } catch (err) {
      console.error("Failed to save post", err);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    if (!user) {
      setLoginPromptMessage("Please log in to comment on posts");
      setShowLoginPrompt(true);
      return;
    }
    try {
      await postService.addComment(post.id, comment.trim());
      setComment("");
    } catch (err) {
      setCommentsError("Failed to add comment.");
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    if (!user) {
      setLoginPromptMessage("Please log in to reply to comments");
      setShowLoginPrompt(true);
      return;
    }
    try {
      await postService.addComment(post.id, replyContent.trim(), parentId);
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      setCommentsError("Failed to add reply.");
    }
  };

  const handleRepost = async () => {
    if (!user) {
      setLoginPromptMessage("Please log in to repost");
      setShowLoginPrompt(true);
      return;
    }
    
    // Redirect to post detail page for repost action
    navigate(`/p/${post.id}`, { state: { action: 'repost' } });
  };

  const handleQuoteSubmit = async () => {
    if (!quoteContent.trim() || !user) return;
    try {
      const res = await postService.quoteRepost(post.id, quoteContent.trim());
      if (res.success) {
        setQuoteContent("");
        setShowQuoteModal(false);
        toast.success("Quote reposted!");
      }
    } catch (err) {
      toast.error("Failed to quote repost");
    }
  };

  const handleShare = () => {
    navigate(`/p/${post.id}`, { state: { action: 'share' } });
    setShowDropdown(false);
  };

  const handleEdit = () => {
    // Initialize edit state with current post data
    setEditContent(post?.content || "");
    setEditLocation(post?.location || "");
    setEditFeeling(post?.feeling || "");
    setEditImages([]);
    setEditVideos([]);
    setEditImagePreviews([]);
    setEditVideoPreviews([]);
    // Preload existing media so it shows clearly in the edit modal
    const imgs = Array.isArray(post?.images) ? [...post.images] : [];
    if (post?.image && imgs.length === 0) {
      imgs.push({ id: null, url: post.image, legacy: true });
    }
    setExistingImages(imgs);
    setExistingVideos(Array.isArray(post?.videos) ? [...post.videos] : []);
    setRemovedImageIds([]);
    setRemovedVideoIds([]);
    setClearImageFlag(false);
    setShowEditLocationInput(!!post?.location);
    setShowEditFeelingInput(!!post?.feeling);
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleEditImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + editImages.length + existingImages.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    setEditImages([...editImages, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEditVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video file too large. Maximum 50MB allowed.');
        return;
      }
      setEditVideos([file]);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditVideoPreviews([e.target.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImage = (index) => {
    setEditImages(editImages.filter((_, i) => i !== index));
    setEditImagePreviews(editImagePreviews.filter((_, i) => i !== index));
  };

  const removeEditVideo = () => {
    setEditVideos([]);
    setEditVideoPreviews([]);
  };

  const removeExistingImage = (img) => {
    setExistingImages((prev) => prev.filter((i) => i !== img));
    if (img.legacy) {
      setClearImageFlag(true);
    } else if (img.id) {
      setRemovedImageIds((prev) => [...prev, img.id]);
    }
  };

  const removeExistingVideo = (vid) => {
    setExistingVideos((prev) => prev.filter((v) => v !== vid));
    if (vid.id) {
      setRemovedVideoIds((prev) => [...prev, vid.id]);
    }
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim() && editImages.length === 0 && editVideos.length === 0 && existingImages.length === 0 && existingVideos.length === 0) {
      toast.error("Please add some content or media");
      return;
    }
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("content", editContent.trim());
      // Always send location/feeling so they can be cleared
      formData.append("location", editLocation.trim());
      formData.append("feeling", editFeeling.trim());
      
      // Add new images
      editImages.forEach((image) => {
        formData.append("images", image);
      });
      
      // Add new videos
      editVideos.forEach((video) => {
        formData.append("videos", video);
      });
      
      // Granular media updates: tell backend which existing media to remove
      formData.append("removedImageIds", JSON.stringify(removedImageIds));
      formData.append("removedVideoIds", JSON.stringify(removedVideoIds));
      if (clearImageFlag) {
        formData.append("clearImage", "true");
      }

      const res = await postService.updatePost(post.id, formData);
      setShowEditModal(false);
      toast.success("Post updated successfully!");

      // Update the local post object from the server response so the UI
      // reflects changes immediately without reloading the page
      const updated = res?.data;
      if (updated) {
        post.content = updated.content;
        post.location = updated.location;
        post.feeling = updated.feeling;
        post.image = updated.image;
        post.images = updated.images;
        post.videos = updated.videos;
      } else {
        post.content = editContent.trim();
        post.location = editLocation.trim() || undefined;
        post.feeling = editFeeling.trim() || undefined;
      }
      forceUpdate();
    } catch (error) {
      toast.error(error.message || "Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    navigate(`/p/${post.id}`, { state: { action: 'delete' } });
    setShowDropdown(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      toast.success("Post deleted successfully!");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyLink = async () => {
    toast.loading('Shortening link...', { id: 'copy-link' });
    const shortUrl = await copyShortLink(getShortPostUrl(post.id));
    toast.success(`Link copied: ${shortUrl}`, { id: 'copy-link' });
    setShowShareModal(false);
  };

  const handleShareToSocial = async (platform) => {
    toast.loading('Shortening link...', { id: 'share-link' });
    const shortUrl = await getShortenedPostUrl(post.id);
    toast.dismiss('share-link');
    const text = post.content?.slice(0, 200) || 'Check out this post!';
    const textShort = post.content?.slice(0, 100) || 'Check out this post!';
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

  const openMediaPreview = () => {
    navigate(`/p/${post.id}`);
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Build comment tree
  function buildCommentTree(flatComments) {
    const idToComment = {};
    const rootComments = [];
    flatComments.forEach((comment) => {
      idToComment[comment.id] = { ...comment, replies: [] };
    });
    flatComments.forEach((comment) => {
      if (comment.parentId && idToComment[comment.parentId]) {
        idToComment[comment.parentId].replies.push(idToComment[comment.id]);
      } else {
        rootComments.push(idToComment[comment.id]);
      }
    });
    return rootComments;
  }

  // Render comments
  const renderComments = (commentsArr, depth = 0) => (
    <div className="space-y-3">
      {commentsArr.map((c) => (
        <div
          key={c.id}
          className={`${
            depth === 0
              ? "border-l-4 border-blue-500/40 bg-white dark:bg-gray-800/50 pl-4 pb-3 rounded-r-lg"
              : "ml-6 border-l-2 border-blue-400/30 bg-gray-50 dark:bg-gray-800/30 rounded-lg py-2 px-3 pb-0"
          } ${replyingTo === c.id ? "ring-2 ring-blue-500/50 shadow-md" : ""} transition-all duration-200`}
        >
          <div
            className={`flex gap-3 ${
              depth === 0
                ? "shadow-sm rounded-lg p-3 bg-white dark:bg-gray-800/50 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-all"
                : "shadow rounded-lg p-3 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
            }`}
          >
            <img
              src={
                c.author?.avatar ||
                "https://ui-avatars.com/api/?name=" +
                  (c.author?.username || "User") +
                  "&background=random"
              }
              alt={c.author?.username || "User"}
              className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2.5 border border-gray-200 dark:border-gray-600">
                <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {c.author?.firstName || c.author?.username || "User"}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {c.content}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => {
                      setReplyingTo(c.id);
                      setReplyContent("");
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Reply
                  </button>
                  {c.replies && c.replies.length > 0 && (
                    <button
                      onClick={() => toggleReplies(c.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      {showReplies[c.id]
                        ? "Hide Replies"
                        : `Show Replies (${c.replies.length})`}
                    </button>
                  )}
                </div>
              </div>
              {replyingTo === c.id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReply(c.id);
                  }}
                  className="flex items-center gap-2 mt-3 bg-white dark:bg-gray-700/50 rounded-lg px-3 py-2.5 shadow-sm border-2 border-blue-200 dark:border-blue-800"
                >
                  <img
                    src={
                      user?.avatar ||
                      "https://ui-avatars.com/api/?name=" +
                        (user?.username || "U")
                    }
                    alt={user?.username || "U"}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
                  />
                  <input
                    type="text"
                    className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md text-sm"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 transition-colors text-sm font-medium"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </button>
                </form>
              )}
              {c.replies && c.replies.length > 0 && showReplies[c.id] && (
                <div className="mt-3">
                  {renderComments(c.replies, depth + 1)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const previewComments = buildCommentTree(comments).slice(0, 2);

  // Media grid helpers
  const getMediaGridLayout = (mediaCount) => {
    if (mediaCount === 1) return "grid-cols-1";
    if (mediaCount === 2) return "grid-cols-2";
    if (mediaCount === 3) return "grid-cols-2 grid-rows-2";
    if (mediaCount >= 4) return "grid-cols-2 grid-rows-2";
    return "grid-cols-1";
  };

  const getMediaItemSize = (index, totalCount) => {
    if (totalCount === 1) return "col-span-1 row-span-1";
    if (totalCount === 2) return "col-span-1 row-span-1";
    if (totalCount === 3) {
      if (index === 0) return "col-span-1 row-span-2";
      return "col-span-1 row-span-1";
    }
    if (totalCount >= 4) {
      if (index === 0) return "col-span-1 row-span-2";
      return "col-span-1 row-span-1";
    }
    return "col-span-1 row-span-1";
  };

  return (
    <>
      <div
        ref={(el) => {
          if (viewRef) {
            viewRef.urrent = el;
          }
        }}
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300"
      >
        {/* Twitter-like Layout: Avatar column + Content column */}
        <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 relative">
          {/* Left Column - Avatar (Fixed Width) */}
          <div className="absolute left-3 top-3 sm:static flex-shrink-0">
            <Avatar
              user={post.author}
              alt={getUserDisplayName(post.author)}
              className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-200 dark:border-gray-700"
              textClassName="text-sm font-semibold"
            />
          </div>

          {/* Right Column - All Content (Flexible Width) */}
          <div className="flex-1 min-w-0">
            {/* Repost Indicator - Above user info */}
            {post.isRepost && (
              <div className="flex items-center gap-2 mb-1 pl-12 sm:pl-0 text-gray-500 dark:text-gray-400 text-xs">
                <Repeat2 className="h-3 w-3" />
                <span>
                  Reposted by{" "}
                  {post.repostedBy
                    ? getUserDisplayName(post.repostedBy)
                    : getUserDisplayName(post.author)}
                </span>
              </div>
            )}

            {isArticleShare && !post.isRepost && !post.quotedPost && (
              <div className="flex items-center gap-2 mb-1 pl-12 sm:pl-0 text-green-600 dark:text-green-400 text-xs font-medium">
                <Repeat2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {getUserDisplayName(post.author)}{" "}
                  {articleOriginalAuthor ? (
                    <>
                      reposted an article by{" "}
                      {articleOriginalAuthor.startsWith("@") ? (
                        <Link
                          to={`/u/${articleOriginalAuthor.slice(1)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                        >
                          {articleOriginalAuthor}
                        </Link>
                      ) : (
                        articleOriginalAuthor
                      )}
                    </>
                  ) : (
                    "shared an article"
                  )}
                </span>
              </div>
            )}

            {post.quotedPost && (
              <div className="flex items-center gap-2 mb-1 pl-12 sm:pl-0 text-gray-500 dark:text-gray-400 text-xs">
                <Repeat2 className="h-3 w-3" />
                <span>
                  {post.content ? "Quote reposted" : "Reposted"} by{" "}
                  {getUserDisplayName(post.author)}
                </span>
              </div>
            )}

            {/* User Info Row */}
            <div className="flex items-center justify-between mb-1 pl-12 sm:pl-0 min-h-[40px] sm:min-h-0">
              <div className="flex items-center gap-1 flex-wrap min-w-0">
                <Link
                  to={`/profile/${post.author?.username || ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="font-bold text-gray-900 dark:text-white text-[15px] hover:underline truncate inline-flex items-center gap-1"
                >
                  {getUserDisplayName(post.author)}
                  {post.author?.plan === "PREMIUM" &&
                    post.author?.planExpiresAt &&
                    new Date(post.author.planExpiresAt) > new Date() && (
                      <VerificationBadge size="sm" />
                    )}
                </Link>
                {showUsername && (
                  <span className="text-gray-500 dark:text-gray-400 text-[15px] truncate">
                    @{post.author?.username || "unknown"}
                  </span>
                )}
                <span className="text-gray-500 dark:text-gray-400 text-[15px]">·</span>
                <span className="text-gray-500 dark:text-gray-400 text-[15px]">
                  {formatTime(post.createdAt)}
                </span>
              </div>

              {/* More Options Dropdown */}
              <div
                ref={dropdownRef}
                className="relative flex-shrink-0 z-[100]"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="More options"
                  aria-expanded={showDropdown}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>

                {showDropdown && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-[99] sm:hidden"
                      onClick={() => setShowDropdown(false)}
                    />
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 sm:w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] overflow-hidden animate-fade-in animate-slide-in-from-top">
                      <div className="py-1">
                        {user && user.id === post.authorId && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                                setShowDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                              <Edit3 className="h-4 w-4 flex-shrink-0" />
                              <span>Edit Post</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                                setShowDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 flex-shrink-0" />
                              <span>Delete Post</span>
                            </button>
                            <hr className="border-gray-200 dark:border-gray-700 my-1" />
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare();
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                        >
                          <Share className="h-4 w-4 flex-shrink-0" />
                          <span>Share Post</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sponsored Label */}
            {post.isBoosted &&
              post.boostExpiresAt &&
              new Date(post.boostExpiresAt) > new Date() && (
                <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>Sponsored</span>
                </div>
              )}

            {/* Post Text Content */}
            {post.content && post.content !== "undefined" && (
              <div className="text-gray-900 dark:text-white text-[15px] sm:text-base leading-relaxed mb-3 whitespace-pre-line break-words">
                {renderContentWithMentions()}
                {post.content.length > 200 && !isTextExpanded && (
                  <button
                    onClick={() => setIsTextExpanded(true)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-1 font-medium transition-colors mt-1"
                  >
                    Show more
                  </button>
                )}
              </div>
            )}

            {/* Quoted Post (for quote or simple reposts with embedded original) */}
            {post.quotedPost && (
              <div
                onClick={() => navigate(`/p/${post.quotedPost.id}`)}
                className="block border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 mb-3 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {post.quotedPost.author?.avatar ? (
                    <img
                      src={post.quotedPost.author.avatar}
                      alt={getUserDisplayName(post.quotedPost.author)}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {post.quotedPost.author?.firstName?.charAt(0) ||
                        post.quotedPost.author?.username?.charAt(0) ||
                        "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* USE LINK FOR NAVIGATION */}
                      <Link
                        to={`/profile/${post.quotedPost.author?.username || ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex items-center gap-1 hover:underline"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {getUserDisplayName(post.quotedPost.author)}
                        </span>
                        {post.quotedPost.author?.plan === "PREMIUM" &&
                          post.quotedPost.author?.planExpiresAt &&
                          new Date(post.quotedPost.author.planExpiresAt) > new Date() && (
                            <VerificationBadge size="sm" />
                          )}
                      </Link>
                      {showUsername && (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          @{post.quotedPost.author?.username || "unknown"}
                        </span>
                      )}
                    </div>
                    {post.quotedPost.content && (
                      <p className="text-gray-900 dark:text-white text-sm leading-relaxed mb-2">
                        {post.quotedPost.content}
                      </p>
                    )}
                    {(post.quotedPost.images && post.quotedPost.images.length > 0) ||
                      (post.quotedPost.videos && post.quotedPost.videos.length > 0) ? (
                      <div className={`grid gap-1 rounded-lg overflow-hidden ${(post.quotedPost.images?.length || 0) > 1 ? "grid-cols-2" : ""}`}>
                        {post.quotedPost.images?.slice(0, 4).map((image, index) => (
                          <img
                            key={`qi-${index}`}
                            src={resolveMediaUrl(typeof image === "string" ? image : image.url)}
                            alt={`Quoted post image ${index + 1}`}
                            className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900 rounded-md"
                          />
                        ))}
                        {post.quotedPost.videos?.slice(0, 2).map((video, index) => (
                          <div key={`qv-${index}`} className="relative w-full bg-black rounded-md overflow-hidden">
                            <video
                              src={resolveMediaUrl(typeof video === "string" ? video : video.url)}
                              className="w-full h-auto max-h-96 object-contain"
                              preload="metadata"
                              controls
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* Feeling and Location */}
            {(post.feeling || post.location) && (
              <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                {post.feeling && (
                  <div className="flex items-center gap-1">
                    <Smile className="h-3 w-3 text-yellow-500" />
                    <span>Feeling {post.feeling}</span>
                  </div>
                )}
                {post.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span>at {post.location}</span>
                  </div>
                )}
              </div>
            )}

          {/* Media Grid - Same vertical alignment as text */}
          {!hideMedia && allMedia.length > 0 && (
            <div className="mb-3">
              {allMedia.length === 1 ? (
                // Single media: show fully without cropping
                <div
                  className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 w-full cursor-pointer bg-gray-100 dark:bg-gray-800"
                  onClick={() => openMediaPreview()}
                >
                  {allMedia[0].type === "video" ? (
                    <video
                      src={allMedia[0].url}
                      className="w-full max-h-[70vh] object-contain bg-black"
                      preload="metadata"
                      controls
                    />
                  ) : (
                    <img
                      src={allMedia[0].url}
                      alt="post-media-0"
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  )}
                </div>
              ) : (
                // Multiple media: square cells so every image is visible
                <div
                  className={`grid gap-1 rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 w-full ${getMediaGridLayout(
                    allMedia.length
                  )}`}
                >
                  {allMedia.slice(0, 4).map((media, idx) => {
                    const isVideo = media.type === "video";
                    const isLast = idx === 3 && allMedia.length > 4;
                    return (
                      <div
                        key={`${media.type}-${idx}`}
                        className="relative cursor-pointer group overflow-hidden hover:opacity-90 transition-all duration-300 aspect-square"
                        onClick={() => openMediaPreview()}
                      >
                        {isVideo ? (
                          <div className="relative w-full h-full bg-black">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                              <div className="bg-white bg-opacity-90 rounded-full p-2">
                                <Play className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt={`post-media-${idx}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {isLast && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold">
                            +{allMedia.length - 4}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

            {/* Action Bar - Interaction Buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 gap-1 sm:gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user && !showComments) {
                    setLoginPromptMessage("Please log in to view comments");
                    setShowLoginPrompt(true);
                    return;
                  }
                  setShowComments(!showComments);
                }}
                className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 -ml-2 sm:-ml-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group flex-1 sm:flex-initial justify-center"
              >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {commentCount}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/p/${post.id}`, { state: { action: 'repost' } });
            }}
            className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl transition-all duration-200 group flex-1 sm:flex-initial justify-center ${
              isReposted
                ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
            }`}
          >
            <Repeat2 className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 ${isReposted ? "fill-current" : ""}`} />
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                isReposted
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
              }`}
            >
              {repostCount}
            </span>
          </button>

          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl transition-all duration-200 group flex-1 sm:flex-initial justify-center ${
              isLiked
                ? "text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                : "text-gray-500 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400"
            }`}
          >
            {isLiked ? (
              <HeartSolid className="h-4 w-4 sm:h-5 sm:w-5 fill-current transition-transform group-hover:scale-110" />
            ) : (
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
            )}
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                isLiked
                  ? "text-pink-600 dark:text-pink-400"
                  : "text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400"
              }`}
            >
              {likeCount}
            </span>
          </button>

          {user && user.id === post.authorId && (
            <button className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {viewCount}
              </span>
            </button>
          )}

          {user && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (user.id !== post.authorId) {
                  toast.error('Only the post owner can boost this post');
                  return;
                }
                const isPremium = user.plan === 'PREMIUM' && user.planExpiresAt && new Date(user.planExpiresAt) > new Date();
                if (!isPremium) {
                  toast.error('Subscribe to Premium to boost your posts');
                  navigate('/subscription');
                  return;
                }
                navigate(`/p/${post.id}`, { state: { action: 'boost' } });
              }}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group"
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 group-hover:text-yellow-500" />
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-yellow-500">
                Boost
              </span>
            </button>
          )}
            </div>

            {/* Comment Input */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Avatar
                  user={user}
                  alt={user?.firstName || user?.username || "User"}
                  className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm"
                  textClassName="text-xs font-semibold"
                />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 min-w-0 px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleComment();
                    }}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim()}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-3 sm:px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex-shrink-0 min-w-[48px] min-h-[44px] font-semibold text-sm"
                    aria-label="Post comment"
                  >
                    <Send className="h-5 w-5" />
                    <span className="sm:hidden">Post</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setLoginPromptMessage("Please log in to comment on posts");
                    setShowLoginPrompt(true);
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                >
                  Log in to comment
                </button>
              </div>
            )}

            {/* Comments Preview */}
            {showComments && (
              <div className="space-y-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Loading comments...</span>
                </div>
              </div>
            ) : commentsError ? (
              <div className="text-red-500 dark:text-red-400 text-sm text-center py-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                {commentsError}
              </div>
            ) : previewComments.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-3">{renderComments(previewComments)}</div>
            )}

            {commentCount > 2 && (
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/p/${post.id}`);
                  }}
                className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                View all {commentCount} comments →
              </button>
            )}
              </div>
            )}
          </div> {/* Close Right Column (flex-1 min-w-0) */}
        </div> {/* Close Main Flex Container */}
      </div> {/* Close Outer Post Card */}

      {/* Modals */}
      {showRepostModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRepostModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Repost
              </h3>
              <button
                onClick={() => setShowRepostModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                {post.content}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleRepost();
                  setShowRepostModal(false);
                }}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-200 dark:border-gray-600"
              >
                <Repeat2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {isReposted ? "Unrepost" : "Repost"}
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
                <Quote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

      {showQuoteModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuoteModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Quote Post
              </h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-900 dark:text-white">
                {post.content}
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Share this post
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
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

            {/* Share Options Grid */}
            <div className="p-6 space-y-3">
              {/* Copy Link - Special styling */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 p-4 text-left bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 rounded-xl transition-all duration-200 border border-blue-200 dark:border-blue-800 group"
              >
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">Copy Link</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Copy post URL to clipboard</div>
                </div>
              </button>

              {/* Social Media Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Twitter/X */}
                <button
                  onClick={() => handleShareToSocial('twitter')}
                  className="flex flex-col items-center gap-3 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-3 bg-black dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">X (Twitter)</div>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShareToSocial('facebook')}
                  className="flex flex-col items-center gap-3 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-3 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Facebook</div>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleShareToSocial('whatsapp')}
                  className="flex flex-col items-center gap-3 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">WhatsApp</div>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => handleShareToSocial('telegram')}
                  className="flex flex-col items-center gap-3 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Telegram</div>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleShareToSocial('linkedin')}
                  className="flex flex-col items-center gap-3 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-3 bg-blue-700 rounded-xl group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">LinkedIn</div>
                </button>

                {/* Reddit */}
                <button
                  onClick={() => handleShareToSocial('reddit')}
                  className="flex flex-col items-center gap-3 p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-3 bg-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Reddit</div>
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
                  <div className="font-medium text-gray-900 dark:text-white">Share via Email</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Send to your contacts</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && post && post.id && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all animate-slideUp border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col"
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
                    Update your post content, media, location, and feeling
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
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative mb-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px] leading-relaxed"
                  rows={6}
                  placeholder="Share your thoughts, ideas, or updates..."
                  maxLength={5000}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {editContent.length > 0 && (
                      <span className={editContent.length > 4500 ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}>
                        {editContent.length.toLocaleString()} / 5,000 characters
                      </span>
                    )}
                  </div>
                  {(editContent.trim() !== post?.content?.trim() || editLocation !== (post?.location || "") || editFeeling !== (post?.feeling || "") || editImages.length > 0 || editVideos.length > 0) && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Changes detected
                    </div>
                  )}
                </div>
              </div>

              {/* Feeling Input */}
              {showEditFeelingInput && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={editFeeling}
                    onChange={(e) => setEditFeeling(e.target.value)}
                    placeholder="How are you feeling? (e.g., Happy, Excited, Grateful)"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                  />
                </div>
              )}

              {/* Location Input */}
              {showEditLocationInput && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Add location (e.g., New York, NY)"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                  />
                </div>
              )}

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={img.id || `existing-${index}`} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img
                        src={resolveMediaUrl(typeof img === "string" ? img : img.url)}
                        alt={`Current image ${index + 1}`}
                        className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New image previews */}
              {editImagePreviews.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  {editImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-blue-300 dark:border-blue-700">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditImage(index)}
                        className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing videos */}
              {existingVideos.map((vid, index) => (
                <div key={vid.id || `existing-vid-${index}`} className="mb-4 relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <video
                    src={resolveMediaUrl(typeof vid === "string" ? vid : vid.url)}
                    className="w-full h-56 object-cover"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingVideo(vid)}
                    className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
                    aria-label="Remove video"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {editVideoPreviews.length > 0 && (
                <div className="mb-4 relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <video
                    src={editVideoPreviews[0]}
                    className="w-full h-56 object-cover"
                    controls
                  />
                  <button
                    type="button"
                    onClick={removeEditVideo}
                    className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
                    aria-label="Remove video"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer border border-gray-200 dark:border-gray-600">
                  <Image className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditImageSelect}
                    className="hidden"
                    disabled={isUpdating || editVideos.length > 0}
                  />
                </label>

                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer border border-gray-200 dark:border-gray-600">
                  <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleEditVideoSelect}
                    className="hidden"
                    disabled={isUpdating || editImages.length > 0}
                  />
                </label>

                <button
                  onClick={() => setShowEditFeelingInput(!showEditFeelingInput)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                    showEditFeelingInput
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  disabled={isUpdating}
                >
                  <Smile className="h-5 w-5" />
                  <span className="text-sm font-medium">Feeling</span>
                </button>

                <button
                  onClick={() => setShowEditLocationInput(!showEditLocationInput)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                    showEditLocationInput
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  disabled={isUpdating}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm font-medium">Location</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={(!editContent.trim() && editImages.length === 0 && editVideos.length === 0) || isUpdating}
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt
          message={loginPromptMessage}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </>
  );
};

export default PostCard;

