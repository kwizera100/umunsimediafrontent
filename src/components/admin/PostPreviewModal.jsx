import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Heart, 
  MessageSquare, 
  MapPin,
  Trash2,
  Crown,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

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

const PostPreviewModal = ({ postId, onClose, onPostAction }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPostDetails(postId);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
      toast.error('Failed to fetch post details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deletePost(postId);
      toast.success('Post deleted successfully');
      onPostAction && onPostAction('delete', postId);
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setActionLoading(false);
    }
  };

  const getPostImage = (post) => {
    // Check for single image
    if (post?.image) {
      if (post.image.startsWith('http')) return post.image;
      // Check if it's already in posts directory
      if (post.image.startsWith('posts/')) {
        return `${BASE_URL}/uploads/${post.image}`;
      }
      // Otherwise, assume it's in posts directory
      return `${BASE_URL}/uploads/posts/${post.image}`;
    }
    
    // Check for multiple images
    if (post?.images && post.images.length > 0) {
      const firstImage = post.images[0];
      if (firstImage.url) {
        if (firstImage.url.startsWith('http')) return firstImage.url;
        // Check if it's already in posts directory
        if (firstImage.url.startsWith('posts/')) {
          return `${BASE_URL}/uploads/${firstImage.url}`;
        }
        // Otherwise, assume it's in posts directory
        return `${BASE_URL}/uploads/posts/${firstImage.url}`;
      }
    }
    
    return null;
  };

  const getPostImages = (post) => {
    const images = [];
    
    console.log('Post data:', post);
    console.log('BASE_URL:', BASE_URL);
    
    // Add single image if exists
    if (post?.image) {
      let imageUrl;
      if (post.image.startsWith('http')) {
        imageUrl = post.image;
      } else if (post.image.startsWith('posts/')) {
        imageUrl = `${BASE_URL}/uploads/${post.image}`;
      } else {
        imageUrl = `${BASE_URL}/uploads/posts/${post.image}`;
      }
      console.log('Single image URL:', imageUrl);
      images.push({
        url: imageUrl,
        id: 'single'
      });
    }
    
    // Add multiple images if exist
    if (post?.images && post.images.length > 0) {
      console.log('Multiple images found:', post.images);
      post.images.forEach((img, index) => {
        if (img.url) {
          let imageUrl;
          if (img.url.startsWith('http')) {
            imageUrl = img.url;
          } else if (img.url.startsWith('posts/')) {
            imageUrl = `${BASE_URL}/uploads/${img.url}`;
          } else {
            imageUrl = `${BASE_URL}/uploads/posts/${img.url}`;
          }
          console.log(`Image ${index} URL:`, imageUrl);
          images.push({
            url: imageUrl,
            id: img.id || `multi-${index}`
          });
        }
      });
    }
    
    console.log('Final images array:', images);
    return images;
  };

  const getUserAvatar = (user) => {
    if (!user) return '';
    if (user.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar;
      return `${BASE_URL}/uploads/avatars/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;
  };

  if (!postId) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-black dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : post ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={getUserAvatar(post.author)}
                    alt={`${post.author?.firstName} ${post.author?.lastName}`}
                    className="h-16 w-16 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${post.author?.firstName}+${post.author?.lastName}&background=random`;
                    }}
                  />
                  {/* Online status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {post.author?.firstName} {post.author?.lastName}
                    </h3>
                    {post.author?.plan === 'PREMIUM' && (
                      <span className="inline-flex items-center text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </span>
                    )}
                    {post.author?.isStudent && (
                      <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        🎓 Student
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <MapPin className="h-4 w-4" />
                        <span>{post.location}</span>
                      </>
                    )}
                    {post.feeling && (
                      <>
                        <span>•</span>
                        <span>{post.feeling}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-4">
                {post.content && (
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}

                {/* Post Images */}
                {(() => {
                  const images = getPostImages(post);
                  console.log('Images to display:', images);
                  if (images.length === 0) {
                    console.log('No images to display');
                    return null;
                  }
                  
                  return (
                    <div className="space-y-3">
                      {images.length === 1 ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                          <img
                            src={images[0].url}
                            alt="Post content"
                            className="w-full h-auto max-h-96 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center hidden">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {images.map((image, index) => (
                            <div key={image.id} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                              <img
                                src={image.url}
                                alt={`Post content ${index + 1}`}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center hidden">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                              {index === 2 && images.length > 3 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <span className="text-white font-semibold text-lg">
                                    +{images.length - 3} more
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center space-x-6 py-3 border-t border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">{post._count?.likes || 0}</span>
                  <span className="text-sm">likes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">{post._count?.comments || 0}</span>
                  <span className="text-sm">comments</span>
                </div>
              </div>

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Comments</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <img
                          src={getUserAvatar(comment.author)}
                          alt={`${comment.author?.firstName} ${comment.author?.lastName}`}
                          className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${comment.author?.firstName}+${comment.author?.lastName}&background=random`;
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {comment.author?.firstName} {comment.author?.lastName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                            {comment.author?.plan === 'PREMIUM' && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Post not found</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {post && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span>Post ID: {post.id}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeletePost}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{actionLoading ? 'Deleting...' : 'Delete Post'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPreviewModal;