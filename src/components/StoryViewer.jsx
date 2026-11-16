import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Send,
  Smile,
  Clock,
  Eye,
  Pause,
  Play,
  MoreHorizontal,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import storyService from '../services/storyService';
import toast from 'react-hot-toast';

const StoryViewer = ({ 
  stories = [], 
  currentStoryIndex = 0, 
  onClose, 
  onNext, 
  onPrevious 
}) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState('');
  const [reactions, setReactions] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  
  const messageInputRef = useRef(null);
  const timerRef = useRef(null);
  const progressRef = useRef(0);
  
  const currentStory = stories[currentStoryIndex];
  const duration = currentStory?.type === 'text' ? 5000 : 8000; // 5s for text, 8s for images
  const hasNext = currentStoryIndex < stories.length - 1;
  const hasPrevious = currentStoryIndex > 0;

  const reactions_list = ['❤️', '😍', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '✨'];

  // Calculate time remaining
  const timeRemaining = useCallback(() => {
    if (!currentStory?.createdAt) return '24h';
    const created = new Date(currentStory.createdAt);
    const now = new Date();
    const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    const remaining = expires - now;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [currentStory?.createdAt]);

  // Clear timer function
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset state when story changes
  useEffect(() => {
    clearTimer();
    setProgress(0);
    progressRef.current = 0;
    setShowReactionPicker(false);
    setShowMessageInput(false);
    setMessage('');
    setIsImageLoading(currentStory?.type === 'image');
    setImageError(false);
    
    if (currentStory?.id) {
      loadStoryData();
      markAsViewed();
    }
  }, [currentStoryIndex, currentStory?.id]);

  const loadStoryData = async () => {
    try {
      const response = await storyService.getStoryLikes(currentStory.id);
      if (response.success) {
        setIsLiked(response.data.isLiked || false);
        setLikesCount(response.data.likesCount || 0);
        setViewCount(response.data.viewsCount || 0);
        // Load viewers if it's own story
        if (isOwnStory) {
          setViewersList(response.data.viewers || []);
        }
      }
    } catch (error) {
      console.error('Error loading story data:', error);
      setIsLiked(false);
      setLikesCount(0);
      setViewCount(0);
      setViewersList([]);
    }
  };

  const markAsViewed = async () => {
    try {
      await storyService.viewStory(currentStory.id);
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  // Start timer function
  const startTimer = useCallback(() => {
    if (isPaused || !currentStory) return;
    if (currentStory.type === 'image' && isImageLoading) return;

    clearTimer();
    
    const interval = 100; // Update every 100ms
    const increment = 100 / (duration / interval);

    timerRef.current = setInterval(() => {
      progressRef.current += increment;
      setProgress(progressRef.current);

      if (progressRef.current >= 100) {
        clearTimer();
        if (hasNext) {
          onNext();
        } else {
          onClose();
        }
      }
    }, interval);
  }, [isPaused, currentStory, isImageLoading, duration, hasNext, onNext, onClose, clearTimer]);

  // Start timer when conditions are met
  useEffect(() => {
    if (!isPaused && currentStory && (!isImageLoading || currentStory.type === 'text')) {
      startTimer();
    }
    
    return clearTimer;
  }, [isPaused, currentStory, isImageLoading, startTimer, clearTimer]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    clearTimer();
    if (hasNext) {
      onNext();
    } else {
      onClose();
    }
  }, [hasNext, onNext, onClose, clearTimer]);

  const handlePrevious = useCallback(() => {
    clearTimer();
    if (hasPrevious) {
      onPrevious();
    }
  }, [hasPrevious, onPrevious, clearTimer]);

  const handleClose = useCallback(() => {
    clearTimer();
    onClose();
  }, [onClose, clearTimer]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const jumpToStory = useCallback((index) => {
    if (index >= 0 && index < stories.length && index !== currentStoryIndex) {
      clearTimer();
      onNext ? onNext(index - currentStoryIndex) : null;
    }
    setShowThumbnails(false);
  }, [stories.length, currentStoryIndex, clearTimer, onNext]);

  const toggleControls = useCallback(() => {
    setIsControlsVisible(prev => !prev);
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showReactionPicker && !showMessageInput) {
        setIsControlsVisible(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showReactionPicker, showMessageInput]);

  const handleClick = useCallback((e) => {
    if (showReactionPicker || showMessageInput) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Left third = previous, right third = next, middle = pause/play
    if (x < width / 3 && hasPrevious) {
      handlePrevious();
    } else if (x > (width * 2) / 3) {
      handleNext();
    } else {
      togglePause();
    }
  }, [hasPrevious, handlePrevious, handleNext, togglePause, showReactionPicker, showMessageInput]);

  const handleLike = async () => {
    if (!currentStory?.id || isLiking) return;
    
    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      const response = await storyService.toggleStoryLike(currentStory.id);
      if (response.success) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
        toast.success(response.data.isLiked ? '❤️ Liked!' : '💔 Unliked');
      } else {
        // Revert on failure
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
        toast.error('Failed to update like');
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReaction = async (emoji) => {
    try {
      setReactions(prev => [...prev, { emoji, userId: user.id, userName: user.firstName }]);
      setShowReactionPicker(false);
      toast.success(`Reacted with ${emoji}`);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setMessage('');
      setShowMessageInput(false);
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Keyboard handlers
  const handleKeyPress = useCallback((e) => {
    if (showMessageInput && messageInputRef.current === document.activeElement) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case ' ':
        e.preventDefault();
        togglePause();
        break;
    }
  }, [handleClose, handlePrevious, handleNext, togglePause, showMessageInput, handleSendMessage]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Image loading handlers
  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageError(true);
  }, []);

  // Preload image
  useEffect(() => {
    if (currentStory?.type === 'image' && currentStory?.image) {
      setIsImageLoading(true);
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = currentStory.image;
    }
  }, [currentStory, handleImageLoad, handleImageError]);

  if (!currentStory) return null;

  const isOwnStory = currentStory.author?.id === user?.id;

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center select-none overflow-hidden"
      onClick={toggleControls}
    >
      {/* Enhanced Story Container with proper alignment */}
      <div className="relative w-full h-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto flex flex-col shadow-2xl">
        {/* Container backdrop for better visual separation */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black/10 to-gray-900/20 pointer-events-none" />
        {/* Enhanced Progress bars */}
        <div className={`absolute top-0 left-0 right-0 flex gap-1 p-3 lg:p-4 z-30 transition-all duration-300 ${
          isControlsVisible 
            ? 'bg-gradient-to-b from-black/80 via-black/20 to-transparent transform translate-y-0' 
            : 'transform -translate-y-full'
        }`}>
          {stories.map((_, index) => (
            <div 
              key={index} 
              className="flex-1 h-1.5 lg:h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2 lg:hover:h-2.5 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                jumpToStory(index);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-white to-gray-300 transition-all duration-100 rounded-full shadow-sm"
                style={{ 
                  width: index === currentStoryIndex ? `${Math.min(progress, 100)}%` : 
                         index < currentStoryIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Enhanced Header */}
        <div className={`absolute top-0 left-0 right-0 flex items-center justify-between p-4 lg:p-6 pt-16 lg:pt-20 z-30 transition-all duration-300 ${
          isControlsVisible 
            ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent transform translate-y-0' 
            : 'transform -translate-y-full'
        }`}>
          <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img 
                src={currentStory.author?.avatar || `https://ui-avatars.com/api/?name=${currentStory.author?.firstName || 'User'}&background=667eea&color=fff`}
                alt={`${currentStory.author?.firstName} ${currentStory.author?.lastName}`}
                className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-2 lg:border-3 border-white shadow-lg object-cover ring-2 ring-white/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 border-2 border-black rounded-full animate-pulse"></div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="font-semibold text-white text-sm lg:text-lg truncate drop-shadow-sm">
                  {currentStory.author?.firstName} {currentStory.author?.lastName}
                </span>
                {isOwnStory && (
                  <span className="text-xs lg:text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 lg:px-3 py-0.5 lg:py-1 rounded-full flex-shrink-0 shadow-sm">You</span>
                )}
              </div>
              <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-white/80 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{timeRemaining()}</span>
                </div>
                {viewCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isOwnStory) {
                        setShowViewersModal(true);
                        setIsPaused(true);
                      }
                    }}
                    className={`flex items-center gap-1 ${isOwnStory ? 'hover:bg-white/20 px-2 py-1 rounded-lg transition-colors cursor-pointer' : ''}`}
                  >
                    <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span>{viewCount} {isOwnStory && viewCount > 0 ? 'views' : ''}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Thumbnails button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowThumbnails(!showThumbnails);
              }}
              className="text-white/80 hover:text-white p-2 lg:p-3 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
            >
              <MoreHorizontal className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
            
            {/* Pause indicator */}
            {isPaused && (
              <div className="text-white/80 p-1 lg:p-2 animate-pulse">
                <Pause className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
            )}
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-white p-2 lg:p-3 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm hover:rotate-90"
            >
              <X className="h-5 w-5 lg:h-7 lg:w-7" />
            </button>
          </div>
        </div>

        {/* Enhanced Story Thumbnails Panel with better visibility */}
        {showThumbnails && (
          <div className="absolute top-20 lg:top-24 right-4 lg:right-6 z-40 bg-black/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 max-w-xs lg:max-w-sm w-80 lg:w-96 border border-white/20 shadow-2xl animate-in slide-in-from-right-2 duration-300">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-white font-semibold text-sm lg:text-base flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                All Stories ({stories.length})
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowThumbnails(false);
                }}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-96 lg:max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/5 pr-2">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {stories.map((story, index) => (
                  <div 
                    key={story.id}
                    className={`relative cursor-pointer group rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 ${
                      index === currentStoryIndex 
                        ? 'ring-2 lg:ring-3 ring-blue-500 shadow-lg shadow-blue-500/25 scale-105' 
                        : 'hover:ring-2 hover:ring-white/50 hover:shadow-xl'
                    }`}
                    onClick={() => jumpToStory(index)}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900">
                      {story.type === 'image' ? (
                        <>
                          <img 
                            src={story.image} 
                            alt="Story thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const fallbackBg = `linear-gradient(135deg, hsl(${Math.floor(Math.random() * 360)}, 60%, 60%), hsl(${Math.floor(Math.random() * 360)}, 60%, 40%))`;
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = fallbackBg;
                              e.target.parentElement.innerHTML += `<div class="flex items-center justify-center h-full text-white text-xs font-medium">📷</div>`;
                            }}
                            onLoad={(e) => {
                              e.target.style.opacity = '1';
                            }}
                            style={{ opacity: 0, transition: 'opacity 0.3s' }}
                          />
                          {/* Loading placeholder */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 group-hover:bg-gray-700 transition-colors">
                            <div className="animate-pulse text-white/40 text-lg">📷</div>
                          </div>
                        </>
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center p-2 lg:p-3 group-hover:scale-110 transition-all duration-300"
                          style={{ 
                            background: story.backgroundColor || story.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          <span 
                            className="text-white text-xs lg:text-sm font-medium text-center leading-tight drop-shadow-sm"
                            style={{
                              fontFamily: story.fontFamily || 'Inter, sans-serif',
                              fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                              wordBreak: 'break-word'
                            }}
                          >
                            {(story.content || story.text || 'Text Story').substring(0, 30)}{(story.content || story.text || '').length > 30 ? '...' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/20 group-hover:to-black/10 transition-all duration-300" />
                    
                    {/* Enhanced story info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <img 
                          src={story.author?.avatar || `https://ui-avatars.com/api/?name=${story.author?.firstName || 'User'}&background=random&format=svg`}
                          alt={story.author?.firstName}
                          className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white/30 shadow-sm"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${story.author?.firstName || 'U'}&background=667eea&color=fff&format=svg`;
                          }}
                        />
                        <span className="text-white text-xs lg:text-sm truncate font-medium drop-shadow-sm">
                          {story.author?.firstName || 'User'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced current indicator */}
                    {index === currentStoryIndex && (
                      <div className="absolute top-2 lg:top-3 right-2 lg:right-3">
                        <div className="relative">
                          <div className="w-3 h-3 lg:w-4 lg:h-4 bg-blue-500 rounded-full animate-pulse shadow-lg" />
                          <div className="absolute inset-0 w-3 h-3 lg:w-4 lg:h-4 bg-blue-400 rounded-full animate-ping" />
                        </div>
                      </div>
                    )}
                    
                    {/* Play indicator on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 lg:p-3 border border-white/30 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="h-3 w-3 lg:h-4 lg:w-4 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation buttons for Desktop */}
        {hasPrevious && isControlsVisible && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 lg:left-8 xl:left-12 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white z-30 p-3 lg:p-4 xl:p-5 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all items-center justify-center hover:scale-110 active:scale-95 shadow-lg hidden lg:flex"
          >
            <ChevronLeft className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 drop-shadow-sm" />
          </button>
        )}

        {hasNext && isControlsVisible && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 lg:right-8 xl:right-12 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white z-30 p-3 lg:p-4 xl:p-5 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all items-center justify-center hover:scale-110 active:scale-95 shadow-lg hidden lg:flex"
          >
            <ChevronRight className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 drop-shadow-sm" />
          </button>
        )}

        {/* Enhanced Story content with better sizing */}
        <div 
          className="relative w-full h-full flex items-center justify-center cursor-pointer bg-black"
          onClick={handleClick}
        >
          {currentStory.type === 'image' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Enhanced loading state */}
              {isImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 lg:h-20 lg:w-20 border-4 border-white/20 border-t-white mb-6"></div>
                    <div className="absolute inset-0 rounded-full h-16 w-16 lg:h-20 lg:w-20 border-4 border-transparent border-t-blue-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                  </div>
                  <p className="text-white/80 text-base lg:text-lg font-medium">Loading story...</p>
                  <div className="mt-2 flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
              
              {/* Enhanced error state */}
              {imageError ? (
                <div className="flex flex-col items-center justify-center text-white p-8 lg:p-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mx-4 border border-gray-700">
                  <div className="text-6xl lg:text-8xl mb-6 opacity-60 animate-pulse">📷</div>
                  <p className="text-xl lg:text-2xl font-semibold mb-3">Failed to load image</p>
                  <p className="text-sm lg:text-base text-white/70 text-center max-w-sm lg:max-w-md leading-relaxed">The image could not be displayed. Please check your connection and try again.</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageError(false);
                      setIsImageLoading(true);
                    }}
                    className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <img 
                    src={currentStory.image} 
                    alt="Story content" 
                    className={`w-full h-full object-contain transition-all duration-700 ${
                      isImageLoading ? 'opacity-0 scale-90 blur-sm' : 'opacity-100 scale-100 blur-0'
                    } drop-shadow-2xl max-w-full max-h-full`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ 
                      display: isImageLoading ? 'none' : 'block',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  
                  {/* Enhanced text overlay for image stories */}
                  {currentStory.content && !isImageLoading && (
                    <div className="absolute bottom-24 lg:bottom-32 left-0 right-0 p-4 lg:p-8">
                      <div className="bg-black/70 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-6 mx-auto max-w-md lg:max-w-lg border border-white/20 shadow-2xl">
                        <p className="text-white text-center text-sm lg:text-lg font-medium leading-relaxed drop-shadow-sm">
                          {currentStory.content}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white relative overflow-hidden"
              style={{ 
                background: currentStory.backgroundColor || currentStory.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: currentStory.textColor || currentStory.color || '#ffffff'
              }}
            >
              {/* Enhanced decorative background elements */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-10 lg:top-16 left-10 lg:left-16 w-32 lg:w-48 h-32 lg:h-48 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 lg:bottom-32 right-16 lg:right-24 w-24 lg:w-36 h-24 lg:h-36 rounded-full bg-white/8 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/3 right-20 lg:right-32 w-16 lg:w-24 h-16 lg:h-24 rounded-full bg-white/6 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-2/3 left-1/4 w-20 lg:w-32 h-20 lg:h-32 rounded-full bg-white/4 blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
              </div>
              
              <div className="text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-6 lg:px-8 xl:px-12 relative z-10">
                <div 
                  className="leading-relaxed break-words drop-shadow-2xl"
                  style={{
                    fontSize: currentStory.fontSize === 'small' ? 'clamp(1.2rem, 4vw, 1.8rem)' : 
                             currentStory.fontSize === 'medium' ? 'clamp(1.6rem, 5vw, 2.4rem)' : 
                             currentStory.fontSize === 'large' ? 'clamp(2rem, 6vw, 3.2rem)' : 'clamp(1.6rem, 5vw, 2.4rem)',
                    fontFamily: currentStory.fontFamily || currentStory.font || 'Inter, system-ui, sans-serif',
                    fontWeight: currentStory.fontWeight || currentStory.weight || '600',
                    fontStyle: currentStory.fontStyle || currentStory.style || 'normal',
                    textAlign: currentStory.textAlign || currentStory.align || 'center',
                    textDecoration: currentStory.textDecoration || 'none',
                    textTransform: currentStory.textTransform || 'none',
                    lineHeight: currentStory.lineHeight || '1.4',
                    letterSpacing: currentStory.letterSpacing || '0.02em',
                    wordBreak: 'break-word',
                    textShadow: currentStory.textShadow || '0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
                    background: currentStory.textGradient ? currentStory.textGradient : 'transparent',
                    WebkitBackgroundClip: currentStory.textGradient ? 'text' : 'initial',
                    WebkitTextFillColor: currentStory.textGradient ? 'transparent' : 'inherit',
                    filter: currentStory.textFilter || 'none',
                    transform: currentStory.textTransform || 'none'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: (currentStory.content || currentStory.text || '')
                      .replace(/\n/g, '<br />')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/__(.*?)__/g, '<u>$1</u>')
                  }}
                />
              </div>
            </div>
          )}

        {/* Touch areas for mobile */}
        <div className="absolute inset-0 flex lg:hidden pointer-events-none">
          <div 
            className="flex-1 pointer-events-auto" 
            onTouchEnd={(e) => { 
              e.stopPropagation(); 
              if (hasPrevious) handlePrevious(); 
            }}
          ></div>
          <div className="flex-1"></div>
          <div 
            className="flex-1 pointer-events-auto" 
            onTouchEnd={(e) => { 
              e.stopPropagation(); 
              handleNext(); 
            }}
          ></div>
        </div>
      </div>

        {/* Enhanced Bottom actions for Desktop */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 lg:p-6 xl:p-8 z-30 transition-all duration-300 ${
          isControlsVisible 
            ? 'bg-gradient-to-t from-black/90 via-black/60 to-transparent transform translate-y-0' 
            : 'transform translate-y-full'
        }`}>
          {/* Enhanced Reactions display */}
          {reactions.length > 0 && (
            <div className="mb-4 lg:mb-6 flex flex-wrap gap-2 lg:gap-3">
              {reactions.slice(-5).map((reaction, index) => (
                <div key={index} className="bg-black/80 backdrop-blur-lg rounded-full px-3 lg:px-4 py-1 lg:py-2 text-white text-sm lg:text-base flex items-center gap-2 lg:gap-3 border border-white/20 shadow-lg animate-in slide-in-from-bottom-2">
                  <span className="text-base lg:text-lg animate-bounce">{reaction.emoji}</span>
                  <span className="font-medium">{reaction.userName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Action buttons */}
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
              {/* Enhanced Like button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                disabled={isLiking}
                className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-full backdrop-blur-lg transition-all border shadow-lg hover:scale-105 active:scale-95 ${
                  isLiked 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-red-500/25' 
                    : 'bg-black/60 text-white hover:bg-black/80 border-white/20 hover:border-white/40'
                } ${isLiking ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
              >
                <Heart className={`h-5 w-5 lg:h-6 lg:w-6 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
                <span className="text-sm lg:text-base font-medium">{likesCount}</span>
              </button>

              {/* Enhanced Reaction picker */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReactionPicker(!showReactionPicker);
                  }}
                  className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-lg transition-all border border-white/20 hover:border-white/40 shadow-lg hover:scale-105 active:scale-95"
                >
                  <Smile className="h-5 w-5 lg:h-6 lg:w-6" />
                </button>
                
                {showReactionPicker && (
                  <div className="absolute bottom-full left-0 mb-3 lg:mb-4 bg-black/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 flex gap-3 lg:gap-4 border border-white/30 shadow-2xl animate-in slide-in-from-bottom-2 zoom-in-95">
                    {reactions_list.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(emoji);
                        }}
                        className="text-2xl lg:text-3xl hover:scale-125 transition-transform p-2 lg:p-3 hover:bg-white/10 rounded-lg lg:rounded-xl active:scale-150"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Message button */}
              {!isOwnStory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessageInput(!showMessageInput);
                    setTimeout(() => messageInputRef.current?.focus(), 100);
                  }}
                  className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-lg transition-all border border-white/20 hover:border-white/40 shadow-lg hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
                </button>
              )}
            </div>

            {/* Enhanced Pause/Play button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className="p-3 lg:p-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all backdrop-blur-lg border border-white/20 hover:scale-110 active:scale-95 shadow-lg"
            >
              {isPaused ? <Play className="h-5 w-5 lg:h-6 lg:w-6 ml-0.5" /> : <Pause className="h-5 w-5 lg:h-6 lg:w-6" />}
            </button>
          </div>

          {/* Enhanced Message input */}
          {showMessageInput && (
            <div className="flex gap-3 lg:gap-4 items-center">
              <input
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${currentStory.author?.firstName}...`}
                className="flex-1 px-4 lg:px-6 py-3 lg:py-4 bg-black/70 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm lg:text-base"
                maxLength={200}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4 lg:px-6 py-3 lg:py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-full transition-all flex-shrink-0 disabled:opacity-50"
              >
                <Send className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Story counter */}
        <div className={`absolute top-20 lg:top-24 left-4 lg:left-6 z-30 transition-all duration-300 ${
          isControlsVisible ? 'transform translate-x-0' : 'transform -translate-x-full'
        }`}>
          <div className="bg-black/60 backdrop-blur-lg rounded-full px-4 lg:px-6 py-2 lg:py-3 text-white text-sm lg:text-base border border-white/20 shadow-lg">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full animate-pulse" />
              <span className="font-medium">{currentStoryIndex + 1} / {stories.length}</span>
            </div>
          </div>
        </div>

        {/* Touch feedback areas for mobile */}
        <div className="absolute inset-0 flex lg:hidden pointer-events-none z-20">
          <div 
            className="flex-1 pointer-events-auto flex items-center justify-center" 
            onTouchEnd={(e) => { 
              e.stopPropagation(); 
              if (hasPrevious) {
                // Visual feedback
                const target = e.currentTarget;
                target.style.background = 'rgba(255,255,255,0.1)';
                setTimeout(() => target.style.background = 'transparent', 150);
                handlePrevious();
              }
            }}
          >
            {hasPrevious && (
              <ChevronLeft className="h-8 w-8 text-white/20" />
            )}
          </div>
          <div className="flex-1" />
          <div 
            className="flex-1 pointer-events-auto flex items-center justify-center" 
            onTouchEnd={(e) => { 
              e.stopPropagation(); 
              // Visual feedback
              const target = e.currentTarget;
              target.style.background = 'rgba(255,255,255,0.1)';
              setTimeout(() => target.style.background = 'transparent', 150);
              handleNext();
            }}
          >
            <ChevronRight className="h-8 w-8 text-white/20" />
          </div>
        </div>
      </div>

      {/* WhatsApp-Style Viewers Modal */}
      {showViewersModal && isOwnStory && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center z-[9999] p-4"
          onClick={() => {
            setShowViewersModal(false);
            setIsPaused(false);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-3xl lg:rounded-3xl w-full lg:w-[500px] max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Viewers
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {viewCount} {viewCount === 1 ? 'view' : 'views'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewersModal(false);
                    setIsPaused(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Viewers List */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              {viewersList && viewersList.length > 0 ? (
                <div className="space-y-2">
                  {viewersList.map((viewer, index) => (
                    <div 
                      key={viewer.id || index}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={viewer.avatar || viewer.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewer.name || viewer.user?.firstName || 'User')}&background=4f46e5&color=ffffff&size=96`}
                          alt={viewer.name || viewer.user?.firstName}
                          className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewer.name || viewer.user?.firstName || 'User')}&background=4f46e5&color=ffffff&size=96`;
                          }}
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {viewer.name || `${viewer.user?.firstName || ''} ${viewer.user?.lastName || ''}`.trim() || 'Unknown User'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {viewer.viewedAt ? new Date(viewer.viewedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : 'Just now'}
                        </p>
                      </div>

                      {/* View indicator */}
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No views yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Share your story to get more views!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;