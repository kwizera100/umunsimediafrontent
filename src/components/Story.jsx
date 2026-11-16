import React, { useState, useEffect } from 'react';
import { Plus, Heart, Play, Eye, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import storyService from '../services/storyService';
import toast from 'react-hot-toast';

const Story = ({ story, isCreateCard, isYourStory, user, onClick }) => {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (story?.slides && story.slides.length > 0 && !isCreateCard) {
      const storyId = story.slides[0].storyId;
      if (storyId) {
        fetchStoryLikes(storyId);
      }
    }
  }, [story?.slides, isCreateCard]);

  const fetchStoryLikes = async (storyId) => {
    if (!storyId) return;
    
    try {
      const response = await storyService.getStoryLikes(storyId);
      if (response.success) {
        setIsLiked(response.data.userLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Failed to fetch story likes:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser || isLiking || !story?.slides || story.slides.length === 0) return;

    const storyId = story.slides[0].storyId;
    if (!storyId) return;

    setIsLiking(true);
    try {
      const response = await storyService.toggleStoryLike(storyId);
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
        
        if (response.data.liked) {
          toast.success('Story liked!');
        } else {
          toast.success('Story unliked!');
        }
      }
    } catch (error) {
      console.error('Failed to toggle story like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleClick = () => {
    if (onClick && !isCreateCard) {
      onClick(story);
    }
  };

  if (isCreateCard) {
    return (
      <div className="flex flex-col items-center gap-2 lg:gap-3 cursor-pointer group w-16 lg:w-20 xl:w-24">
        <div className="relative w-full h-24 lg:h-32 xl:h-36 rounded-xl lg:rounded-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex flex-col items-center justify-center shadow-lg overflow-hidden border-2 border-gray-600 hover:border-blue-500 transition-all duration-300 group-hover:shadow-blue-500/30 group-hover:shadow-xl group-hover:scale-105">
          {/* Enhanced background with better user avatar display */}
          <div className="absolute inset-0 rounded-xl lg:rounded-2xl overflow-hidden">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}&background=667eea&color=fff&format=svg`}
              alt={user?.firstName || 'User'}
              className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-300 scale-110 group-hover:scale-125"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}&background=random&format=svg`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
          
          {/* Enhanced plus icon with better positioning */}
          <div className="absolute bottom-2 lg:bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-full p-2 lg:p-2.5 shadow-lg border-2 border-white/30 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 text-white drop-shadow-sm" />
          </div>
          
          {/* Enhanced hover text */}
          <div className="absolute top-2 lg:top-3 right-2 lg:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="text-white text-xs bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20 shadow-lg">
              Create
            </div>
          </div>
          
          {/* Floating sparkles effect */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-3 left-3 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-5 right-4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-6 left-4 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
          </div>
        </div>
        <span className="text-xs lg:text-sm font-medium text-gray-300 mt-1 text-center group-hover:text-white transition-colors duration-300 leading-tight">Create story</span>
      </div>
    );
  }

  if (isYourStory) {
    const lastImage = story.slides && story.slides.length > 0 ? story.slides[0].content : story.user.avatar;
    return (
      <div className="flex flex-col items-center gap-2 lg:gap-3 cursor-pointer group w-16 lg:w-20 xl:w-24" onClick={handleClick}>
        <div className="relative w-full h-24 lg:h-32 xl:h-36 rounded-xl lg:rounded-2xl shadow-lg overflow-hidden border-2 border-blue-500 hover:border-blue-400 transition-all duration-300 group-hover:shadow-blue-500/40 group-hover:shadow-xl group-hover:scale-105">
          {/* Enhanced image container with better loading */}
          <div className="relative w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20">
            <img
              src={lastImage}
              alt={story.user.name}
              className="w-full h-full object-cover rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = story.user.avatar || `https://ui-avatars.com/api/?name=${story.user.name || 'You'}&background=667eea&color=fff&format=svg`;
              }}
              onLoad={(e) => {
                e.target.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s' }}
            />
            {/* Loading placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20 rounded-xl lg:rounded-2xl">
              <div className="animate-pulse text-blue-400 text-lg">📷</div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 rounded-xl lg:rounded-2xl" />
          
          {/* Enhanced play button with better animation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="bg-white/25 backdrop-blur-md rounded-full p-2 lg:p-3 border border-white/40 shadow-2xl hover:bg-white/35 transition-colors">
              <Play className="h-3 w-3 lg:h-4 lg:w-4 text-white ml-0.5 drop-shadow-lg" />
            </div>
          </div>

          {/* Enhanced user avatar with border animation */}
          <div className="absolute top-1.5 lg:top-2 left-1.5 lg:left-2 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-blue-500 bg-gray-800 shadow-lg overflow-hidden group-hover:border-blue-400 transition-colors">
            <img
              src={story.user.avatar}
              alt={story.user.name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${story.user.name || 'You'}&background=blue&color=fff&format=svg`;
              }}
            />
          </div>
          
          {/* Enhanced new indicator */}
          {story.isNew && (
            <div className="absolute top-1.5 lg:top-2 right-1.5 lg:right-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-400 rounded-full animate-ping"></div>
              </div>
            </div>
          )}
          
          {/* Enhanced stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-xl lg:rounded-b-2xl">
            <div className="flex items-center justify-between text-white text-xs lg:text-sm">
              <div className="flex items-center gap-2">
                {likesCount > 0 && (
                  <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5 backdrop-blur-sm">
                    <Heart className="h-2.5 w-2.5 lg:h-3 lg:w-3 fill-current text-red-400" />
                    <span className="font-medium">{likesCount}</span>
                  </div>
                )}
                {viewsCount > 0 && (
                  <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5 backdrop-blur-sm">
                    <Eye className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    <span className="font-medium">{viewsCount}</span>
                  </div>
                )}
              </div>
              {story.slides && story.slides.length > 1 && (
                <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-400 rounded-full"></div>
                  <span className="font-medium">{story.slides.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs lg:text-sm font-medium text-gray-300 mt-1 text-center group-hover:text-white transition-colors duration-300 leading-tight">Your story</span>
      </div>
    );
  }

  const lastImage = story.slides && story.slides.length > 0 ? story.slides[0].content : story.user.avatar;
  return (
    <div className="flex flex-col items-center gap-2 lg:gap-3 cursor-pointer group w-16 lg:w-20 xl:w-24" onClick={handleClick}>
      <div className={`relative w-full h-24 lg:h-32 xl:h-36 rounded-xl lg:rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 ${
        isLiked 
          ? 'border-2 border-red-500 hover:border-red-400 group-hover:shadow-red-500/30' 
          : 'border-2 border-purple-500 hover:border-purple-400 group-hover:shadow-purple-500/30'
      }`}>
        {/* Enhanced image container with loading state */}
        <div className="relative w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <img
            src={lastImage}
            alt={story.user.name}
            className="w-full h-full object-cover rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = story.user.avatar || `https://ui-avatars.com/api/?name=${story.user.name || 'User'}&background=purple&color=fff&format=svg`;
            }}
            onLoad={(e) => {
              e.target.style.opacity = '1';
            }}
            style={{ opacity: 0, transition: 'opacity 0.3s' }}
          />
          {/* Loading placeholder */}
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/20 rounded-xl lg:rounded-2xl">
            <div className="animate-pulse text-purple-400 text-lg">📷</div>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 rounded-xl lg:rounded-2xl" />
        
        {/* Enhanced play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
          <div className="bg-white/25 backdrop-blur-md rounded-full p-2 lg:p-3 border border-white/40 shadow-2xl hover:bg-white/35 transition-colors">
            <Play className="h-3 w-3 lg:h-4 lg:w-4 text-white ml-0.5 drop-shadow-lg" />
          </div>
        </div>

        {/* Enhanced user avatar */}
        <div className={`absolute top-1.5 lg:top-2 left-1.5 lg:left-2 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 ${
          isLiked ? 'border-red-500' : 'border-purple-500'
        } bg-gray-800 shadow-lg overflow-hidden group-hover:border-opacity-80 transition-all`}>
          <img
            src={story.user.avatar}
            alt={story.user.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${story.user.name || 'U'}&background=purple&color=fff&format=svg`;
            }}
          />
        </div>
        
        {/* Enhanced new indicator */}
        {story.isNew && (
          <div className="absolute top-1.5 lg:top-2 right-1.5 lg:right-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-400 rounded-full animate-ping"></div>
            </div>
          </div>
        )}
        
        {/* Enhanced like button with better animation */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`absolute bottom-1.5 lg:bottom-2 right-1.5 lg:right-2 p-1.5 lg:p-2 rounded-full shadow-lg transition-all duration-300 border ${
            isLiked 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/50 border-red-400 scale-110' 
              : 'bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 hover:text-white border-gray-600 hover:border-gray-500'
          } ${
            isLiking 
              ? 'opacity-50 cursor-not-allowed animate-pulse' 
              : 'hover:scale-125 active:scale-95 transform'
          }`}
        >
          <Heart className={`w-2.5 h-2.5 lg:w-3 lg:h-3 ${
            isLiked ? 'fill-current animate-pulse' : ''
          } drop-shadow-sm transition-all duration-200`} />
        </button>
        
        {/* Enhanced story count indicator */}
        {story.slides && story.slides.length > 1 && (
          <div className="absolute bottom-1.5 lg:bottom-2 left-1.5 lg:left-2 w-4 h-4 lg:w-5 lg:h-5 bg-black/90 backdrop-blur-sm rounded-full border border-white/40 flex items-center justify-center shadow-lg">
            <span className="text-xs lg:text-sm text-white font-bold drop-shadow-sm">{story.slides.length}</span>
          </div>
        )}
        
        {/* Enhanced gradient effect on hover */}
        <div className={`absolute inset-0 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
          isLiked 
            ? 'bg-gradient-to-t from-red-500 to-pink-500' 
            : 'bg-gradient-to-t from-purple-500 to-blue-500'
        }`} />
      </div>
      <span className="text-xs lg:text-sm font-medium text-gray-300 mt-1 truncate w-full text-center group-hover:text-white transition-colors duration-300 leading-tight">
        {story.user.name}
      </span>
    </div>
  );
};

export default Story;