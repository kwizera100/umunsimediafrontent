import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getShortPostUrl, copyToClipboard } from "../utils/linkShortener";

const MediaPreviewModal = ({
  isOpen,
  onClose,
  media,
  currentIndex = 0,
  post = null,
  onLike = null,
  onComment = null,
  onRepost = null,
  isLiked = false,
  likeCount = 0,
  commentCount = 0,
  repostCount = 0,
  isReposted = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressBarRef = useRef(null);
  const modalRef = useRef(null);

  // Calculate modal position to open near the clicked post
  useEffect(() => {
    if (isOpen) {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate centered position with slight upward bias (like Twitter)
      const top = Math.max(50, viewportHeight * 0.1); // 10% from top, minimum 50px
      const left = Math.max(20, viewportWidth * 0.1); // 10% from left, minimum 20px
      
      setModalPosition({ top, left });
    }
  }, [isOpen]);

  // Reset state when modal opens/closes or media changes
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex);
      setIsPlaying(false);
      setIsMuted(true);
      setShowControls(true);
      setVideoProgress(0);
      setCurrentTime(0);
      setIsFullscreen(false);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex]);

  // Handle video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      if (video.duration) {
        setVideoDuration(video.duration);
        setCurrentTime(video.currentTime);
        setVideoProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setVideoProgress(0);
      setCurrentTime(0);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeIndex]);

  // Auto-hide controls for videos
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // NOTE: Do not return early before all hooks are declared to preserve hook order

  const handlePrevious = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsPlaying(false);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % media.length);
    setIsPlaying(false);
  };

  const handlePlayPause = (e) => {
    e?.stopPropagation();
    if (isVideo) {
      const video = videoRef.current;
      if (video) {
        if (isPlaying) {
          video.pause();
        } else {
          video.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const handleMuteToggle = (e) => {
    e?.stopPropagation();
    if (isVideo) {
      const video = videoRef.current;
      if (video) {
        video.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (isVideo && videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * videoDuration;

      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setVideoProgress(percentage * 100);
    }
  };

  const handleFullscreen = (e) => {
    e?.stopPropagation();
    const element = modalRef.current;
    
    if (!element) return;

    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleDownload = (e) => {
    e?.stopPropagation();
    const link = document.createElement("a");
    link.href = currentMedia.url;
    link.download = `media-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const handleShare = (e) => {
    e?.stopPropagation();
    const shareUrl = post?.id ? getShortPostUrl(post.id) : window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Check out this media",
        url: shareUrl,
      });
    } else {
      copyToClipboard(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Escape":
        if (document.fullscreenElement) {
          handleFullscreen();
        } else {
          onClose();
        }
        break;
      case "ArrowLeft":
        handlePrevious();
        break;
      case "ArrowRight":
        handleNext();
        break;
      case " ":
        e.preventDefault();
        handlePlayPause();
        break;
      case "m":
        handleMuteToggle();
        break;
      case "f":
        handleFullscreen();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, activeIndex, isPlaying, isMuted]);

  // Safe guard AFTER hooks are declared to avoid hook order changes
  if (!isOpen || !media || media.length === 0) return null;

  const currentMedia = media[activeIndex];
  const isVideo = currentMedia.type === "video";

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMediaClick = (e) => {
    if (isVideo) {
      handlePlayPause(e);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 animate-fadeIn overflow-y-auto py-8"
      onClick={handleBackdropClick}
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      {/* Main Modal Container - Twitter-style popup */}
      <div
        ref={modalRef}
        className="relative bg-black rounded-2xl shadow-2xl max-w-4xl w-full mx-4 my-auto animate-scaleIn"
        style={{ 
          maxHeight: '90vh',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar - Twitter-style */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          
          {/* Media Counter */}
          {media.length > 1 && (
            <div className="text-white text-sm font-medium">
              {activeIndex + 1} / {media.length}
            </div>
          )}
          
          <div className="w-9"></div> {/* Spacer for balance */}
        </div>

        {/* Media Content Area */}
        <div className="relative">
          {/* Navigation Arrows - Show only when multiple media */}
          {media.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Media Display */}
          <div className="flex items-center justify-center min-h-[400px] max-h-[60vh] bg-black">
            {isVideo ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="w-full h-full max-h-[60vh] object-contain"
                  preload="metadata"
                  muted={isMuted}
                  onClick={handleMediaClick}
                  playsInline
                />

                {/* Video Controls Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}
                  onMouseEnter={() => {
                    setShowControls(true);
                    if (controlsTimeoutRef.current) {
                      clearTimeout(controlsTimeoutRef.current);
                    }
                  }}
                  onMouseMove={() => {
                    setShowControls(true);
                    if (controlsTimeoutRef.current) {
                      clearTimeout(controlsTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isPlaying) {
                      controlsTimeoutRef.current = setTimeout(() => {
                        setShowControls(false);
                      }, 2000);
                    }
                  }}
                >
                  {/* Central Play/Pause Button */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <button
                      onClick={handlePlayPause}
                      className="p-4 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${
                      showControls ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    {/* Progress Bar */}
                    <div
                      ref={progressBarRef}
                      className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 group"
                      onClick={handleProgressClick}
                    >
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-100 relative group-hover:bg-blue-400"
                        style={{ width: `${videoProgress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg" />
                      </div>
                    </div>

                    {/* Control Buttons Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePlayPause}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5 text-white" />
                          ) : (
                            <Play className="h-5 w-5 text-white ml-0.5" />
                          )}
                        </button>

                        <button
                          onClick={handleMuteToggle}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5 text-white" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-white" />
                          )}
                        </button>

                        <span className="text-white text-sm font-medium min-w-[80px]">
                          {formatTime(currentTime)} / {formatTime(videoDuration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownload}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                          title="Download"
                        >
                          <Download className="h-5 w-5 text-white" />
                        </button>
                        
                        <button
                          onClick={handleShare}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                          title="Share"
                        >
                          <Share2 className="h-5 w-5 text-white" />
                        </button>

                        <button
                          onClick={handleFullscreen}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                          title="Fullscreen"
                        >
                          <Maximize2 className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={currentMedia.url}
                alt={`Media ${activeIndex + 1}`}
                className="w-full h-full max-h-[60vh] object-contain cursor-zoom-in"
                onClick={handleFullscreen}
              />
            )}
          </div>
        </div>

        {/* Post Info Section - Twitter-style */}
        {post && (
          <div className="border-t border-gray-800 p-4 bg-black">
            <div className="flex items-start gap-3">
              <img
                src={
                  post.author?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    post.author?.firstName || 'User'
                  )}+${encodeURIComponent(
                    post.author?.lastName || ''
                  )}&background=1d4ed8&color=ffffff`
                }
                alt={post.author?.firstName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-white text-[15px] leading-tight">
                    {post.author?.firstName} {post.author?.lastName}
                  </span>
                  <span className="text-gray-400 text-[15px] leading-tight">
                    @{post.author?.username}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-400 text-[15px]">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {/* Sponsored label */}
                {post.isBoosted &&
                  post.boostExpiresAt &&
                  new Date(post.boostExpiresAt) > new Date() && (
                    <div className="mb-2 text-xs text-gray-400 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      <span>Sponsored</span>
                    </div>
                  )}
                
                <p className="text-white text-[15px] leading-snug mb-3 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Post Stats */}
                <div className="flex items-center gap-4 text-gray-400 text-[13px]">
                  {commentCount > 0 && (
                    <span>
                      <strong className="text-white">{commentCount}</strong> comments
                    </span>
                  )}
                  {repostCount > 0 && (
                    <span>
                      <strong className="text-white">{repostCount}</strong> reposts
                    </span>
                  )}
                  {likeCount > 0 && (
                    <span>
                      <strong className="text-white">{likeCount}</strong> likes
                    </span>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between max-w-md mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComment?.();
                    }}
                    className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors duration-200 group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors duration-200">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span className="text-xs">{commentCount}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRepost?.();
                    }}
                    className={`flex items-center gap-1 transition-colors duration-200 group ${
                      isReposted
                        ? "text-green-500"
                        : "text-gray-400 hover:text-green-500"
                    }`}
                  >
                    <div className={`p-2 rounded-full transition-colors duration-200 ${
                      isReposted 
                        ? "bg-green-500/10" 
                        : "group-hover:bg-green-500/10"
                    }`}>
                      <Repeat2
                        className={`h-4 w-4 ${isReposted ? "fill-current" : ""}`}
                      />
                    </div>
                    <span className="text-xs">{repostCount}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike?.();
                    }}
                    className={`flex items-center gap-1 transition-colors duration-200 group ${
                      isLiked
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <div className={`p-2 rounded-full transition-colors duration-200 ${
                      isLiked 
                        ? "bg-red-500/10" 
                        : "group-hover:bg-red-500/10"
                    }`}>
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                      />
                    </div>
                    <span className="text-xs">{likeCount}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors duration-200 group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors duration-200">
                      <Share2 className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 hidden md:block">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">→</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Space</kbd>
            <span>Play/Pause</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">M</kbd>
            <span>Mute</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">F</kbd>
            <span>Fullscreen</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MediaPreviewModal;