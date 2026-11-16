import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share, MoreHorizontal, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import storyService from '../services/storyService';
import toast from 'react-hot-toast';

const StoryPreviewModal = ({ isOpen, onClose, story, currentSlideIndex = 0, onStoryDeleted }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(currentSlideIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  const timerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(0);

  const slides = story?.slides || [
    { 
      type: 'image', 
      content: story?.user?.avatar, 
      duration: 5000,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      type: 'text', 
      content: `Hello from ${story?.user?.name || 'User'}! 👋`, 
      duration: 3000,
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: '#ffffff',
      fontSize: 'large'
    },
  ];

  const currentSlide = slides[currentIndex] || slides[0];
  const duration = currentSlide?.duration || 5000;

  // Get the actual story data from the current slide
  const currentStoryData = story?.backendData ? story.backendData.find(s => s.id === currentSlide?.storyId) : null;
  const actualStoryId = currentSlide?.storyId || currentStoryData?.id;

  // Enhanced timer management
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (isPaused || isLoading || !isOpen) return;
    
    clearTimer();
    
    timerRef.current = setInterval(() => {
      progressRef.current += 100 / (duration / 100);
      setProgress(progressRef.current);
      
      if (progressRef.current >= 100) {
        if (currentIndex < slides.length - 1) {
          setCurrentIndex(prev => prev + 1);
          progressRef.current = 0;
          setProgress(0);
        } else {
          onClose();
        }
      }
    }, 100);
  }, [isPaused, isLoading, isOpen, duration, currentIndex, slides.length, onClose, clearTimer]);

  // Reset progress when slide changes
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    setIsLoading(true);
    setImageError(false);
    setIsImageLoaded(false);
    
    // Update likes for the current story slide
    if (currentSlide) {
      setLikesCount(currentSlide.likesCount || 0);
      setIsLiked(currentSlide.isLiked || false);
    }
  }, [currentIndex, currentSlide]);

  // Start timer when conditions are met
  useEffect(() => {
    if (isOpen && !isPaused && !isLoading) {
      startTimer();
    } else {
      clearTimer();
    }
    
    return clearTimer;
  }, [isOpen, isPaused, isLoading, startTimer, clearTimer]);

  // Enhanced navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, slides.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Story management functions
  const handleDeleteStory = async () => {
    if (!user || !isStoryOwner || isDeleting) return;
    
    // Get the correct story ID from the current slide
    const storyId = actualStoryId;
    if (!storyId) {
      console.error('No story ID found. Story object:', story, 'Current slide:', currentSlide);
      toast.error('Cannot delete story: Invalid story data');
      return;
    }
    
    console.log('Deleting story with ID:', storyId); // Debug logging
    setIsDeleting(true);
    try {
      await storyService.deleteStory(storyId);
      setShowDeleteConfirm(false);
      // Let the parent handle the success message and modal closing
      if (onStoryDeleted) {
        onStoryDeleted(storyId);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeStory = async () => {
    if (!user || isLiking) return;
    
    // Get the correct story ID from the current slide
    const storyId = actualStoryId;
    if (!storyId) {
      console.error('No story ID found. Story object:', story, 'Current slide:', currentSlide);
      toast.error('Cannot like story: Invalid story data');
      return;
    }
    
    console.log('Liking story with ID:', storyId); // Debug logging
    setIsLiking(true);
    const wasLiked = isLiked;
    
    // Optimistic update
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    try {
      let response;
      if (wasLiked) {
        response = await storyService.unlikeStory(storyId);
      } else {
        response = await storyService.likeStory(storyId);
      }
      
      // Update the actual data if response includes updated counts
      if (response.data) {
        setLikesCount(response.data.likesCount || (wasLiked ? likesCount - 1 : likesCount + 1));
        setIsLiked(response.data.isLiked !== undefined ? response.data.isLiked : !wasLiked);
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSendReply = async () => {
    if (!user || !replyMessage.trim() || isSendingReply) return;
    
    // Get the correct story data for the reply
    const storyAuthorId = currentStoryData?.authorId || story?.user?.id;
    const storyId = actualStoryId;
    
    if (!storyAuthorId || !storyId) {
      console.error('Missing story author ID or story ID for reply');
      toast.error('Cannot send reply: Invalid story data');
      return;
    }
    
    setIsSendingReply(true);
    try {
      // Send direct message to story owner
      await storyService.sendStoryReply(storyAuthorId, {
        message: replyMessage.trim(),
        storyId: storyId
      });
      toast.success('Reply sent!');
      setReplyMessage('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Utility functions
  const formatTimeAgo = (createdAt) => {
    if (!createdAt) {
      console.log('No createdAt provided, using current time');
      return 'Just now';
    }
    
    const now = new Date();
    const storyTime = new Date(createdAt);
    
    // Check if the date is valid
    if (isNaN(storyTime.getTime())) {
      console.log('Invalid date:', createdAt);
      return 'Recently';
    }
    
    const diffInMinutes = Math.floor((now - storyTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const isStoryOwner = user && (currentStoryData?.authorId === user.id || story?.user?.id === user.id);

  // Enhanced click navigation with pause functionality
  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Middle third pauses/resumes
    if (x >= width / 3 && x <= (width * 2) / 3) {
      togglePause();
    } else if (x < width / 3) {
      handlePrevious();
    } else {
      handleNext();
    }
  }, [handlePrevious, handleNext, togglePause]);

  // Enhanced keyboard and touch support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
        case 'Space':
          e.preventDefault();
          togglePause();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'l':
        case 'L':
          handleLikeStory();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handlePrevious, handleNext, togglePause, toggleMute, handleLikeStory]);

  // Touch gesture support
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    
    setTouchStart(null);
  };

  // Auto-hide controls
  useEffect(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Image loading handlers
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    setIsLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  // Show controls on interaction
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
  }, []);

  if (!isOpen || !story) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden select-none"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={showControlsTemporarily}
        style={{ cursor: isPaused ? 'pointer' : 'none' }}
      >
        {/* Enhanced Story Container */}
      <div className="relative w-full h-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto bg-black shadow-2xl">
        
        {/* Enhanced Progress bars */}
        <div className={`absolute top-0 left-0 right-0 flex gap-1.5 lg:gap-2 p-3 lg:p-4 z-30 transition-all duration-300 ${
          showControls 
            ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent transform translate-y-0 opacity-100' 
            : 'transform -translate-y-full opacity-0'
        }`}>
          {slides.map((_, index) => (
            <div 
              key={index} 
              className="flex-1 h-1.5 lg:h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2 lg:hover:h-2.5 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-white to-gray-200 transition-all duration-100 rounded-full shadow-sm"
                style={{ 
                  width: index === currentIndex ? `${Math.min(progress, 100)}%` : 
                         index < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Enhanced Header with user info and controls */}
        <div className={`absolute top-0 left-0 right-0 flex items-center justify-between p-4 lg:p-6 pt-16 lg:pt-20 z-30 transition-all duration-300 ${
          showControls 
            ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent transform translate-y-0 opacity-100' 
            : 'transform -translate-y-full opacity-0'
        }`}>
          <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img 
                src={story.user?.avatar || `https://ui-avatars.com/api/?name=${story.user?.name || 'User'}&background=random&format=svg`}
                alt={story.user?.name}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 lg:border-3 border-white shadow-lg object-cover ring-2 ring-white/20"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${story.user?.name || 'U'}&background=667eea&color=fff&format=svg`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 border-2 border-black rounded-full animate-pulse shadow-lg"></div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm lg:text-lg truncate drop-shadow-sm">
                  {story.user?.name || 'User'}
                </span>
                {story.isLive && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-sm">LIVE</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-white/80 mt-0.5">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(currentSlide?.createdAt || currentStoryData?.createdAt)}</span>
                {slides.length > 1 && (
                  <>
                    <span>•</span>
                    <span>{currentIndex + 1} of {slides.length}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Pause indicator */}
            {isPaused && (
              <div className="text-white/80 p-2 animate-pulse">
                <Pause className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
            )}
            
            {/* Mute toggle */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
            >
              {isMuted ? <VolumeX className="h-4 w-4 lg:h-5 lg:w-5" /> : <Volume2 className="h-4 w-4 lg:h-5 lg:w-5" />}
            </button>
            
            {/* Delete button for story owners */}
            {isStoryOwner && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-full transition-all backdrop-blur-sm"
              >
                <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            )}
            
            {/* More options */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Show options menu
              }}
              className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
            >
              <MoreHorizontal className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
            
            {/* Close button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white p-2 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm hover:rotate-90"
            >
              <X className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Navigation buttons */}
        {currentIndex > 0 && showControls && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white z-30 p-3 lg:p-4 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6 lg:h-8 lg:w-8 drop-shadow-sm" />
          </button>
        )}

        {currentIndex < slides.length - 1 && showControls && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white z-30 p-3 lg:p-4 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronRight className="h-6 w-6 lg:h-8 lg:w-8 drop-shadow-sm" />
          </button>
        )}

        {/* Enhanced Story content with better visibility */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {currentSlide?.type === 'image' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Enhanced loading state */}
              {isLoading && (
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
                      setIsLoading(true);
                    }}
                    className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={currentSlide.content} 
                    alt="story" 
                    className={`w-full h-full object-contain transition-all duration-700 ${
                      isImageLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-90 blur-sm'
                    } drop-shadow-2xl max-w-full max-h-full`}
                    onLoad={() => {
                      console.log('Image loaded successfully:', currentSlide.content);
                      handleImageLoad();
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', currentSlide.content);
                      console.error('Error event:', e);
                      handleImageError();
                    }}
                    style={{ display: isLoading ? 'none' : 'block' }}
                  />
                  
                  {/* Image caption if available */}
                  {currentSlide.caption && isImageLoaded && (
                    <div className="absolute bottom-20 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-center">
                      <p className="text-sm lg:text-base">{currentSlide.caption}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white relative overflow-hidden"
              style={{ 
                background: currentSlide?.background || currentSlide?.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: currentSlide?.textColor || '#ffffff'
              }}
            >
              {/* Enhanced decorative background */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-10 lg:top-16 left-10 lg:left-16 w-32 lg:w-48 h-32 lg:h-48 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 lg:bottom-32 right-16 lg:right-24 w-24 lg:w-36 h-24 lg:h-36 rounded-full bg-white/8 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/3 right-20 lg:right-32 w-16 lg:w-24 h-16 lg:h-24 rounded-full bg-white/6 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
              </div>
              
              <div className="text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-6 lg:px-8 xl:px-12 relative z-10">
                <div 
                  className="leading-relaxed break-words drop-shadow-2xl"
                  style={{
                    fontSize: currentSlide?.fontSize === 'small' ? 'clamp(1.5rem, 5vw, 2rem)' : 
                             currentSlide?.fontSize === 'medium' ? 'clamp(2rem, 6vw, 2.5rem)' : 
                             currentSlide?.fontSize === 'large' ? 'clamp(2.5rem, 7vw, 3.5rem)' : 'clamp(2rem, 6vw, 2.5rem)',
                    fontFamily: currentSlide?.fontFamily || 'Inter, system-ui, sans-serif',
                    fontWeight: currentSlide?.fontWeight || '700',
                    textAlign: currentSlide?.textAlign || 'center',
                    lineHeight: '1.3',
                    wordBreak: 'break-word',
                    textShadow: '0 4px 20px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: (currentSlide?.content || '')
                      .replace(/\n/g, '<br />')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Bottom section with interactive controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 lg:p-6 z-30 transition-all duration-300 ${
          showControls 
            ? 'bg-gradient-to-t from-black/90 via-black/60 to-transparent transform translate-y-0 opacity-100' 
            : 'transform translate-y-full opacity-0'
        }`}>
          
          {/* User info section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
              <img 
                src={story.user?.avatar || `https://ui-avatars.com/api/?name=${story.user?.name || 'User'}&background=random&format=svg`}
                alt={story.user?.name}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white shadow-lg object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${story.user?.name || 'U'}&background=667eea&color=fff&format=svg`;
                }}
              />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-white text-sm lg:text-base truncate block drop-shadow-sm">
                  {story.user?.name || 'User'}
                </span>
                <div className="text-xs lg:text-sm text-white/70">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            {/* Interactive controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Like button with count */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeStory();
                  }}
                  disabled={isLiking}
                  className={`flex items-center gap-2 p-2 lg:p-3 rounded-full backdrop-blur-lg transition-all border shadow-lg hover:scale-110 active:scale-95 ${
                    isLiked 
                      ? 'bg-red-500 text-white border-red-400 shadow-red-500/25' 
                      : 'bg-black/60 text-white hover:bg-black/80 border-white/20 hover:border-white/40'
                  }`}
                >
                  <Heart className={`h-4 w-4 lg:h-5 lg:w-5 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
                  {likesCount > 0 && (
                    <span className="text-xs lg:text-sm font-medium">{likesCount}</span>
                  )}
                </button>

                {/* Message/Reply button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReplyInput(!showReplyInput);
                  }}
                  className="p-2 lg:p-3 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-lg transition-all border border-white/20 hover:border-white/40 shadow-lg hover:scale-110 active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>

                {/* Share button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement share functionality
                    toast.success('Share functionality coming soon!');
                  }}
                  className="p-2 lg:p-3 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-lg transition-all border border-white/20 hover:border-white/40 shadow-lg hover:scale-110 active:scale-95"
                >
                  <Share className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </div>

              {/* Pause/Play button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                className="p-2 lg:p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all backdrop-blur-lg border border-white/20 hover:scale-110 active:scale-95 shadow-lg"
              >
                {isPaused ? <Play className="h-4 w-4 lg:h-5 lg:w-5 ml-0.5" /> : <Pause className="h-4 w-4 lg:h-5 lg:w-5" />}
              </button>
            </div>

            {/* Reply input */}
            {showReplyInput && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={`Reply to ${story.user?.name || 'User'}...`}
                  className="flex-1 bg-black/60 text-white placeholder-white/60 border border-white/20 rounded-full px-4 py-2 text-sm lg:text-base focus:outline-none focus:border-white/60 backdrop-blur-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || isSendingReply}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-full text-sm lg:text-base font-medium transition-colors"
                >
                  {isSendingReply ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Touch feedback areas for mobile */}
        <div className="absolute inset-0 flex lg:hidden pointer-events-none z-20">
          <div 
            className="flex-1 pointer-events-auto flex items-center justify-start pl-4" 
            onTouchEnd={(e) => { 
              e.stopPropagation(); 
              if (currentIndex > 0) {
                const target = e.currentTarget;
                target.style.background = 'rgba(255,255,255,0.1)';
                setTimeout(() => target.style.background = 'transparent', 150);
                handlePrevious();
              }
            }}
          >
            {currentIndex > 0 && (
              <ChevronLeft className="h-8 w-8 text-white/30" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-center">
            {isPaused && (
              <Play className="h-12 w-12 text-white/50" />
            )}
          </div>
          <div 
            className="flex-1 pointer-events-auto flex items-center justify-end pr-4" 
            onTouchEnd={(e) => { 
              e.stopPropagation(); 
              const target = e.currentTarget;
              target.style.background = 'rgba(255,255,255,0.1)';
              setTimeout(() => target.style.background = 'transparent', 150);
              handleNext();
            }}
          >
            <ChevronRight className="h-8 w-8 text-white/30" />
          </div>
        </div>
      </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="text-red-500 mb-4">
              <Trash2 className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Story?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone. Your story will be permanently deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStory}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryPreviewModal; 