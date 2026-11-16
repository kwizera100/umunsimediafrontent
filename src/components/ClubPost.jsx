import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Send,
  Trash2,
  Edit3,
  Flag,
  ChevronDown,
  ChevronUp,
  Smile,
  X,
  Copy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clubService from '../services/clubService';
import toast from 'react-hot-toast';
import { getShortClubUrl, copyToClipboard } from '../utils/linkShortener';

const ClubPost = ({ post, clubId, onUpdate, isMember = false }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post._count?.clubLikes || 0);
  const [commentsCount, setCommentsCount] = useState(post._count?.clubComments || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const commentInputRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';

  const getAvatarUrl = (user) => {
    if (!user?.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&background=4f46e5&color=ffffff&size=64`;
    }
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  };

  const getPostImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${BASE_URL}/uploads/club-posts/${imageUrl}`;
  };

  const handleLike = async () => {
    if (liking) return;
    
    // Check if user is a member
    if (!isMember) {
      toast.error('🚪 Join the club to like posts!', {
        duration: 4000,
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
        },
      });
      return;
    }
    
    try {
      setLiking(true);
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
      
      // Optimistic update
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      
      await clubService.togglePostLike(clubId, post.id);
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const loadComments = async () => {
    if (loadingComments) return;
    
    try {
      setLoadingComments(true);
      const response = await clubService.getPostComments(clubId, post.id);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    
    if (newShowComments && comments.length === 0) {
      loadComments();
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    // Check if user is a member
    if (!isMember) {
      toast.error('🚪 Join the club to comment on posts!', {
        duration: 4000,
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
        },
      });
      return;
    }
    
    try {
      setSubmittingComment(true);
      const response = await clubService.addPostComment(clubId, post.id, newComment.trim());
      
      // Add new comment to the list
      setComments(prev => [response.data, ...prev]);
      setCommentsCount(prev => prev + 1);
      setNewComment('');
      
      toast.success('💬 Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await clubService.deleteComment(clubId, post.id, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentsCount(prev => prev - 1);
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleCopyLink = () => {
    const postUrl = `${getShortClubUrl(clubId)}#post-${post.id}`;
    copyToClipboard(postUrl).then(() => {
      toast.success('🔗 Link copied to clipboard!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#ffffff',
        },
      });
      setShowShareModal(false);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 shadow-sm hover:shadow-md">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={getAvatarUrl(post.author)}
                alt={post.author.firstName}
                className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.firstName)}&background=4f46e5&color=ffffff&size=64`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-gray-900 dark:text-white hover:text-purple-700 dark:hover:text-purple-400 transition-colors cursor-pointer">
                  {post.author.firstName} {post.author.lastName}
                </h4>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">@{post.author.username}</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
                <div className="py-2">
                  {post.author.id === user.id && (
                    <>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Edit3 className="h-4 w-4 mr-3" />
                        Edit Post
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete Post
                      </button>
                    </>
                  )}
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Flag className="h-4 w-4 mr-3" />
                    Report Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600/50">
            <img
              src={getPostImageUrl(post.image)}
              alt="Post content"
              className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => {
                // Could open in modal for better viewing
                window.open(getPostImageUrl(post.image), '_blank');
              }}
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 ${
                isLiked
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`h-5 w-5 transition-all duration-200 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={toggleComments}
              className="flex items-center gap-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>

            {/* Share Button */}
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Show/Hide Comments Toggle */}
          {commentsCount > 0 && (
            <button
              onClick={toggleComments}
              className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <span className="text-xs">
                {showComments ? 'Hide' : 'Show'} comments
              </span>
              {showComments ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
          {/* Comment Form */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700/30">
            <form onSubmit={handleSubmitComment} className="flex items-start space-x-3">
              <img
                src={getAvatarUrl(user)}
                alt="Your avatar"
                className="w-8 h-8 rounded-full border border-purple-500/30 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-sm"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {newComment.length}/500
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submittingComment ? 'Posting...' : 'Comment'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="ml-2 text-gray-400 text-sm">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">No comments yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Be the first to share your thoughts</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700/30">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start space-x-3">
                      <img
                        src={getAvatarUrl(comment.author)}
                        alt={comment.author.firstName}
                        className="w-8 h-8 rounded-full border border-purple-500/30 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {comment.author.firstName} {comment.author.lastName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                          {comment.author.id === user.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-400 hover:text-red-300 transition-colors ml-auto"
                              title="Delete comment"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Share Post
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Share Options */}
            <div className="p-6 space-y-2">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Copy link</div>
                </div>
              </button>

              {/* Social Media Options */}
              <div className="space-y-2">
                {/* Twitter/X */}
                <button
                  onClick={() => {
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        getShortClubUrl(clubId) + "#post-" + post.id
                      )}&text=${encodeURIComponent(post.content?.slice(0, 200) || "Check out this club post!")}`,
                      "_blank",
                      "width=550,height=420"
                    );
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-black dark:bg-gray-900 rounded-lg">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">Share on X</div>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => {
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        getShortClubUrl(clubId) + "#post-" + post.id
                      )}`,
                      "_blank",
                      "width=600,height=400"
                    );
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">Share on Facebook</div>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(
                        (post.content?.slice(0, 100) || "Check out this club post!") + "\n\n" + getShortClubUrl(clubId) + "#post-" + post.id
                      )}`,
                      "_blank"
                    );
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-green-500 rounded-lg">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">Share on WhatsApp</div>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => {
                    window.open(
                      `https://t.me/share/url?url=${encodeURIComponent(
                        getShortClubUrl(clubId) + "#post-" + post.id
                      )}&text=${encodeURIComponent(post.content?.slice(0, 100) || "Check out this club post!")}`,
                      "_blank"
                    );
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">Share on Telegram</div>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => {
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        getShortClubUrl(clubId) + "#post-" + post.id
                      )}`,
                      "_blank",
                      "width=600,height=400"
                    );
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-blue-700 rounded-lg">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">Share on LinkedIn</div>
                </button>

                {/* Email */}
                <button
                  onClick={() => {
                    window.location.href = `mailto:?subject=${encodeURIComponent(
                      "Check out this club post"
                    )}&body=${encodeURIComponent(
                      (post.content?.slice(0, 200) || "Check out this club post!") + "\n\n" + getShortClubUrl(clubId) + "#post-" + post.id
                    )}`;
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-gray-600 rounded-lg">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">Share via Email</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubPost;