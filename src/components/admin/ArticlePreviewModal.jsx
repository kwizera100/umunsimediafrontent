import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Eye, 
  Heart, 
  MessageSquare, 
  Tag,
  Trash2,
  Crown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Utility function to convert HTML to plain text
const stripHtmlTags = (html) => {
  if (!html) return '';
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  // Get text content and clean up extra whitespace
  return tempDiv.textContent || tempDiv.innerText || '';
};

const ArticlePreviewModal = ({ isOpen, onClose, articleId, onArticleAction }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && articleId) {
      fetchArticleDetails();
    }
  }, [isOpen, articleId]);

  const fetchArticleDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArticle(data.data.article);
      } else {
        console.error('Failed to fetch article details');
      }
    } catch (error) {
      console.error('Error fetching article details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onArticleAction && onArticleAction('deleted', { id: articleId });
        onClose();
      } else {
        console.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'STANDARD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-black dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Article Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : article ? (
          <div className="p-6">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{article.title}</h1>
              
              {/* Author Info */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  {article.author.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {article.author.firstName} {article.author.lastName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(article.author.plan)}`}>
                      {article.author.plan}
                    </span>
                    {article.author.isStudent && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Student
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>@{article.author.username}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Published {formatTimeAgo(article.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {article.articleTags && article.articleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.articleTags.map((articleTag) => (
                    <span
                      key={articleTag.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {articleTag.tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Statistics */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.readCount || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{article._count.articleLikes} likes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{article._count.comments} comments</span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content</h4>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  {stripHtmlTags(article.content)}
                </div>
              </div>
            </div>

            {/* Article Images */}
            {article.images && article.images.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {article.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Article image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Comments */}
            {article.comments && article.comments.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Comments</h4>
                <div className="space-y-4">
                  {article.comments.slice(0, 5).map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {comment.author.avatar ? (
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.author.firstName} {comment.author.lastName}
                          </span>
                          <span className="text-sm text-gray-500">
                            @{comment.author.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {article.comments.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      ...and {article.comments.length - 5} more comments
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{article.readCount || 0}</div>
                <div className="text-sm text-blue-700">Views</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-900">{article._count.articleLikes}</div>
                <div className="text-sm text-red-700">Likes</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{article._count.comments}</div>
                <div className="text-sm text-green-700">Comments</div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Actions</h4>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Article</span>
                </button>
                
                <button
                  onClick={handleDeleteArticle}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{actionLoading ? 'Deleting...' : 'Delete Article'}</span>
                </button>

                <button
                  onClick={() => alert('Feature coming soon: Flag/Unflag article')}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Flag Article</span>
                </button>

                <button
                  onClick={() => alert('Feature coming soon: Feature/Unfeature article')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Feature Article</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Failed to load article details</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ArticlePreviewModal;