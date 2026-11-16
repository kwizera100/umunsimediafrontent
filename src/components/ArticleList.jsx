import React, { useEffect, useState } from 'react';
import { getAllArticles, getArticlesByTag } from '../services/articleService';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Tag, Calendar, User, Eye, BookOpen } from 'lucide-react';
import socketService from '../services/socketService';
import useViewTracking from '../hooks/useViewTracking';
import Badge from './Badge';
import badgeService from '../services/badgeService';
import UserDisplay from './UserDisplay';

// Article Card Component with view tracking
export const ArticleCard = ({ article, onTagClick }) => {
  const [viewCount, setViewCount] = useState(article.views || 0);
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // Helper function to normalize image URLs
  const getImageUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL, return as is
    if (url.startsWith('http')) return url;
    // If it's a relative path, construct the full URL
    return `https://fggg.space/${url.replace(/^\/+/, '')}`;
  };
  
  // View tracking hook
  const viewRef = useViewTracking(article.id, 'article', {
    threshold: 0.5,
    enabled: !!article.id,
    onViewTracked: (data) => {
      if (data.views !== undefined) {
        setViewCount(data.views);
      }
    }
  });

  // Load badges and rewards for this article
  useEffect(() => {
    const loadBadgesAndRewards = async () => {
      try {
        setLoadingBadges(true);
        const [badgesData, rewardsData] = await Promise.all([
          badgeService.getArticleBadges(article.id),
          badgeService.getArticleRewards(article.id)
        ]);
        
        const processedBadges = badgesData.map(item => item.badge || item) || [];
        const processedRewards = rewardsData.map(item => item.reward || item) || [];
        
        setBadges(processedBadges);
        setRewards(processedRewards);
      } catch (error) {
        console.error('Error loading badges:', error);
        setBadges([]);
        setRewards([]);
      } finally {
        setLoadingBadges(false);
      }
    };

    loadBadgesAndRewards();
  }, [article.id]);

  return (
    <div ref={viewRef} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Article Image */}
      {article.image && (
        <div className="w-full h-48 sm:h-56 overflow-hidden">
          <img
            src={getImageUrl(article.image)}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Category Badge */}
        {article.category && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {article.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {article.title}
        </h3>

        {/* Badges and Rewards Display */}
        {!loadingBadges && (badges.length > 0 || rewards.length > 0) && (
          <div className="flex items-center gap-2 mb-3">
            {badges.slice(0, 3).map((badge, index) => (
              <Badge 
                key={`badge-${index}`} 
                badge={badge} 
                size="sm" 
                animated={badge.type === 'EDITORS_CHOICE' || badge.type === 'TRENDING'}
              />
            ))}
            {rewards.slice(0, 2).map((reward, index) => (
              <Badge 
                key={`reward-${index}`} 
                badge={reward} 
                size="sm" 
                animated={true}
              />
            ))}
            {(badges.length > 3 || rewards.length > 2) && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                +{(badges.length - 3) + (rewards.length - 2)} more
              </span>
            )}
          </div>
        )}

        {/* Content Preview */}
        <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 [&_img]:hidden">
          {article.content ? (
            <div dangerouslySetInnerHTML={{
              __html: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + (article.content.length > 150 ? '...' : '')
            }} />
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">No preview available</span>
          )}
        </div>

        {/* Author */}
        <div className="mb-4">
          <UserDisplay 
            user={article.author} 
            size="md"
            showVerification={true}
            linkToProfile={true}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link 
            to={`/articles/${article.id}`}
            className="flex items-center hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <Heart className="h-4 w-4 mr-1" />
            <span>{article.likeCount || 0}</span>
          </Link>
          <Link 
            to={`/articles/${article.id}`}
            className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>{article.commentCount || 0}</span>
          </Link>
          <span className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {viewCount}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(article.createdAt).toLocaleDateString()}
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <Link 
            to={`/articles/${article.id}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md text-sm font-medium transition-colors text-center"
          >
            Read Article
          </Link>
        </div>
      </div>
    </div>
  );
};

const ArticleList = ({ tag, onTagClick }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      let data;
      if (tag) {
        data = await getArticlesByTag(tag);
      } else {
        data = await getAllArticles();
      }
      setArticles(data);
    } catch (err) {
      setError('Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [tag]);

  useEffect(() => {
    // Listen for real-time like/comment updates
    const handleUpdate = () => {
      fetchArticles();
    };
    socketService.on('article-like-updated', handleUpdate);
    socketService.on('article-comment-updated', handleUpdate);
    return () => {
      socketService.off('article-like-updated', handleUpdate);
      socketService.off('article-comment-updated', handleUpdate);
    };
  }, [tag]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-6">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-8">
          <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Be the first to share an article with the community!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {articles.map(article => (
        <div key={article.id} className="w-full">
          <ArticleCard 
            article={article} 
            onTagClick={onTagClick} 
          />
        </div>
      ))}
    </div>
  );
};

export default ArticleList; 