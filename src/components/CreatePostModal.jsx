import React, { useState, useEffect } from 'react';
import { X, Image, Smile, MapPin, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import postService from '../services/postService';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import MentionInput from './MentionInput';

const CreatePostModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState('');
  const [feeling, setFeeling] = useState('');
  const [showFeelingInput, setShowFeelingInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);

  const emojis = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '💯', '✨', '🚀', '💪', '😍', '🎯', '💡', '🌟', '🎊'];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setImage(null);
      setImagePreview('');
      setLocation('');
      setFeeling('');
      setShowFeelingInput(false);
      setShowLocationInput(false);
      setLoading(false);
      setTaggedUsers([]);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!content.trim() && !image) {
      toast.error('Please add some content or an image');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        content: content.trim() || undefined,
        location: location.trim() || undefined,
        feeling: feeling.trim() || undefined,
        image: image || undefined,
        taggedUserIds: taggedUsers.length > 0 ? taggedUsers.map(u => u.id) : undefined,
      };

      const response = await postService.createPost(postData);
      
      if (response.success) {
        toast.success('Post created successfully!');
        onSave(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const addEmoji = (emoji) => {
    setContent(prev => prev + emoji);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all animate-slideUp border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Create Post
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Share your thoughts, ideas, or updates with your network
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={loading}
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content Section - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar
              user={user}
              alt={user?.firstName || user?.username || "User"}
              className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700 shadow-sm"
              textClassName="text-base font-semibold"
            />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Public</div>
            </div>
          </div>

          {/* Content Input */}
          <div className="relative mb-4">
            <MentionInput
              value={content}
              onChange={setContent}
              onMentionsChange={setTaggedUsers}
              placeholder="What's on your mind? Share your thoughts, ideas, or experiences... Type @ to tag someone"
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px] leading-relaxed min-h-[120px]"
              rows={6}
              disabled={loading}
              maxLength={2000}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {content.length > 0 && (
                  <span className={content.length > 4500 ? "text-orange-500" : "text-gray-500"}>
                    {content.length.toLocaleString()} / 2,000 characters
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Feeling Input */}
          {showFeelingInput && (
            <div className="mb-4">
              <input
                type="text"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="How are you feeling? (e.g., Happy, Excited, Grateful)"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                disabled={loading}
              />
            </div>
          )}

          {/* Location Input */}
          {showLocationInput && (
            <div className="mb-4">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (e.g., New York, NY)"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                disabled={loading}
              />
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-4 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <img 
                src={imagePreview} 
                alt="preview" 
                className="w-full max-h-96 object-cover" 
              />
              <button 
                onClick={() => { setImage(null); setImagePreview(''); }}
                className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
                disabled={loading}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Image Upload */}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer group border border-gray-200 dark:border-gray-600">
              <Image className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </label>

            {/* Feeling Button */}
            <button
              onClick={() => setShowFeelingInput(!showFeelingInput)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                showFeelingInput
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              disabled={loading}
            >
              <Smile className="h-5 w-5" />
              <span className="text-sm font-medium">Feeling</span>
            </button>

            {/* Location Button */}
            <button
              onClick={() => setShowLocationInput(!showLocationInput)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${
                showLocationInput
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              disabled={loading}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">Location</span>
            </button>

            {/* Emoji Picker */}
            <div className="relative ml-auto">
              <button
                onClick={() => setShowFeelingInput(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300"
                disabled={loading}
              >
                <Smile className="h-5 w-5" />
              </button>
              {/* Emoji picker would go here if needed */}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={(!content.trim() && !image) || loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
