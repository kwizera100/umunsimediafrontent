import React, { useEffect, useState } from 'react';
import { getArticleComments, addArticleComment } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Send, User } from 'lucide-react';
import CommentItem from './CommentItem';
import socketService from '../services/socketService';
import Avatar from './Avatar';
import LoginPrompt from './LoginPrompt';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';
const defaultAvatar = '/default-avatar.png'; // Place a default avatar in public folder

const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || 'Unknown User';
};

// Avatar handled by Avatar component

const ArticleComments = ({ articleId, comments: propComments }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Always fetch comments on mount if not provided
  useEffect(() => {
    let mounted = true;
    const fetchComments = async () => {
      setLoading(true);
      try {
        let initialComments = propComments;
        if (!initialComments) {
          initialComments = await getArticleComments(articleId);
        }
        if (mounted) {
          setComments(initialComments);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load comments.');
          setLoading(false);
        }
      }
    };
    fetchComments();
    return () => { mounted = false; };
  }, [articleId, propComments]);

  useEffect(() => {
    if (!articleId) return;
    // Listen for real-time comment updates
    const handleCommentUpdate = (data) => {
      if (data.articleId === articleId) {
        setComments(data.comments);
      }
    };
    socketService.on('article-comment-updated', handleCommentUpdate);
    return () => {
      socketService.off('article-comment-updated', handleCommentUpdate);
    };
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setSubmitting(true);
    try {
      await addArticleComment(articleId, { content });
      setContent('');
      // Do NOT call fetchComments(); real-time event will update comments
    } catch (err) {
      setError('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Comments ({comments.length})
        </h3>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex items-start gap-3">
              <Avatar user={user} alt={getUserDisplayName(user)} className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {content.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={!content.trim() || submitting}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Please log in to leave a comment
            </p>
            <button
              onClick={() => setShowLoginPrompt(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Log In to Comment
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-gray-400">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No comments yet</p>
              <p className="text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt
          message="Please log in to comment on articles"
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
};

export default ArticleComments; 