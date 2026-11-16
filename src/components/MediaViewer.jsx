import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

const MediaViewer = ({ media, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia.type === 'video' || currentMedia.url?.includes('.mp4') || currentMedia.url?.includes('.webm');

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, media.length]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1);
      setIsVideoPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
      setIsVideoPlaying(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-${currentIndex + 1}${isVideo ? '.mp4' : '.jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn bg-black/70 backdrop-blur-sm"
    >
      {/* Modal Container */}
      <div 
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full' 
            : 'w-full max-w-5xl h-[85vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 via-black/50 to-transparent p-4">
          <div className="flex justify-between items-center">
            {/* Counter */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                <span className="text-white font-medium text-sm">
                  {currentIndex + 1} / {media.length}
                </span>
              </div>
              {isVideo && (
                <div className="bg-red-500/90 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <span className="text-white font-medium text-xs uppercase">Video</span>
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-2">
              {!isVideo && (
                <>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110"
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110"
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>
                  {zoom !== 1 && (
                    <button
                      onClick={() => setZoom(1)}
                      className="px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-xs font-medium transition-all hover:scale-110"
                      title="Reset Zoom"
                    >
                      {Math.round(zoom * 100)}%
                    </button>
                  )}
                </>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all hover:scale-110"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all hover:scale-110"
                title="Download"
              >
                <Download size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-red-500/80 backdrop-blur-md hover:bg-red-600 text-white transition-all hover:scale-110"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Media Display Area */}
        <div className="relative w-full h-full flex items-center justify-center bg-gray-950">
          {/* Previous Button */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all hover:scale-110 shadow-lg"
              title="Previous (←)"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          )}

          {/* Media Content */}
          <div className="flex items-center justify-center w-full h-full p-8">
            {isVideo ? (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-xl shadow-2xl"
                style={{ maxHeight: isFullscreen ? '100%' : '75vh' }}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
            ) : (
              <div className="flex items-center justify-center overflow-auto">
                <img
                  src={currentMedia.url}
                  alt={`Media ${currentIndex + 1}`}
                  className="rounded-xl shadow-2xl object-contain transition-transform duration-200"
                  style={{ 
                    transform: `scale(${zoom})`,
                    maxWidth: '100%',
                    maxHeight: isFullscreen ? '100%' : '75vh',
                    cursor: zoom > 1 ? 'move' : 'default'
                  }}
                />
              </div>
            )}
          </div>

          {/* Next Button */}
          {currentIndex < media.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all hover:scale-110 shadow-lg"
              title="Next (→)"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {media.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4">
            <div className="flex gap-2 justify-center items-center overflow-x-auto max-w-full px-4 scrollbar-hide">
              {media.map((item, index) => {
                const itemIsVideo = item.type === 'video' || item.url?.includes('.mp4') || item.url?.includes('.webm');
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(1);
                      setIsVideoPlaying(false);
                    }}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all shadow-lg ${
                      index === currentIndex
                        ? 'border-blue-500 scale-110 ring-2 ring-blue-400/50'
                        : 'border-white/30 hover:border-white/60 hover:scale-105'
                    }`}
                  >
                    {itemIsVideo ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white drop-shadow-lg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Active Indicator */}
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
      
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MediaViewer;
