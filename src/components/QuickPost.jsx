import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Image, Video, Smile, MapPin, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import postService from '../services/postService';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import MentionInput from './MentionInput';

const QuickPost = ({ onCreatePost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [showFeelingInput, setShowFeelingInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Create object URLs once per selection — recreating them on every render
  // (e.g. while typing) breaks the previews.
  const imagePreviewUrls = useMemo(
    () => selectedImages.map((f) => URL.createObjectURL(f)),
    [selectedImages]
  );
  const videoPreviewUrl = useMemo(
    () => (selectedVideo ? URL.createObjectURL(selectedVideo) : null),
    [selectedVideo]
  );

  // Revoke object URLs when they change or on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviewUrls]);
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && selectedImages.length === 0 && !selectedVideo) || loading) return;

    setLoading(true);
    try {
      // Prepare post data object
      const postData = {
        content: content.trim(),
      };
      
      // Add optional fields
      if (feeling) postData.feeling = feeling;
      if (location) postData.location = location;
      if (taggedUsers.length > 0) postData.taggedUserIds = taggedUsers.map((u) => u.id);
      
      // Handle media uploads
      if (selectedImages.length > 0) {
        postData.images = selectedImages;
      }
      
      if (selectedVideo) {
        postData.video = selectedVideo;
      }

      const response = await postService.createPost(postData);
      
      if (response.success) {
        toast.success('Post created successfully!');
        onCreatePost(response.data);
        // Reset form
        setContent('');
        setSelectedImages([]);
        setSelectedVideo(null);
        setFeeling('');
        setLocation('');
        setShowFeelingInput(false);
        setShowLocationInput(false);
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl lg:rounded-xl border-y sm:border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 mb-4 lg:mb-6 w-full hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-2xl">
      <div className="flex items-start gap-3 lg:gap-4">
        <div className="hidden sm:block flex-shrink-0">
          <Avatar
            user={user}
            alt={user?.firstName || user?.username || "User"}
            className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-gray-200 dark:border-gray-700 shadow-sm"
            textClassName="text-base lg:text-lg font-bold"
          />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="sm:hidden flex-shrink-0">
              <Avatar
                user={user}
                alt={user?.firstName || user?.username || "User"}
                className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700"
                textClassName="text-sm font-bold"
              />
            </div>
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm">
              <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-white" />
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Create a Post</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <MentionInput
                value={content}
                onChange={setContent}
                onMentionsChange={setTaggedUsers}
                placeholder="Share your thoughts... Type @ to tag someone"
                className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm lg:text-base leading-relaxed transition-all"
                rows={4}
                disabled={loading}
                maxLength={2000}
              />
              {content.length > 0 && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
                  {content.length.toLocaleString()} / 2,000
                </div>
              )}
            </div>
            
            {/* Feeling Input */}
            {showFeelingInput && (
              <div className="mt-3">
                <input
                  type="text"
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="How are you feeling? (e.g., Happy, Excited, Grateful)"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-all"
                />
              </div>
            )}
            
            {/* Location Input */}
            {showLocationInput && (
              <div className="mt-3">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location (e.g., New York, NY)"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-all"
                />
              </div>
            )}
            
            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={imagePreviewUrls[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Selected Video Preview */}
            {selectedVideo && (
              <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <video
                  src={videoPreviewUrl}
                  className="w-full h-56 object-cover"
                  controls
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-sm"
                  aria-label="Remove video"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {/* Image Upload */}
              <label className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                selectedImages.length > 0
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <Image className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={loading || selectedVideo}
                />
              </label>
              
              {/* Video Upload */}
              <label className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                selectedVideo
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <Video className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                  disabled={loading || selectedImages.length > 0}
                />
              </label>
              
              {/* Feeling Button */}
              <button 
                type="button"
                onClick={() => setShowFeelingInput(!showFeelingInput)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${
                  showFeelingInput 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400' 
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                disabled={loading}
              >
                <Smile className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Feeling</span>
              </button>
              
              {/* Location Button */}
              <button 
                type="button"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${
                  showLocationInput 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400' 
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                disabled={loading}
              >
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Location</span>
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && selectedImages.length === 0 && !selectedVideo) || loading}
              className="flex items-center gap-2 px-5 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none text-sm lg:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="hidden sm:inline">Posting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPost; 