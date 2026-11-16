import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  BookOpen,
  Users,
  Activity,
  Clock,
  Calendar,
  Target,
  Award,
  Zap,
  RefreshCw,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import analyticsService from '../services/analyticsService';
import PostAnalytics from './PostAnalytics';
import ArticleAnalytics from './ArticleAnalytics';

const AnalyticsDashboard = ({ userId, timeframe = '30d' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentType, setContentType] = useState('all'); // 'all', 'posts', 'articles'
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    // Set up real-time updates every 60 seconds
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [userId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userAnalytics, trendingContent, engagementTrends] = await Promise.all([
        analyticsService.getUserAnalytics(userId, timeframe),
        analyticsService.getTrendingContent(userId, contentType, 10),
        analyticsService.getEngagementTrends(userId, timeframe)
      ]);
      
      setAnalytics({
        ...userAnalytics,
        trendingContent,
        engagementTrends,
        lastUpdated: new Date()
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIndicator = (current, previous = 0) => {
    if (current > previous) {
      return { icon: ArrowUp, color: 'text-green-400', text: 'Up' };
    } else if (current < previous) {
      return { icon: ArrowDown, color: 'text-red-400', text: 'Down' };
    } else {
      return { icon: Minus, color: 'text-gray-500 dark:text-gray-400', text: 'Stable' };
    }
  };

  const getEngagementRate = () => {
    if (!analytics) return 0;
    const totalViews = (analytics.totalPostViews || 0) + (analytics.totalArticleViews || 0);
    const totalEngagements = (analytics.totalPostLikes || 0) + (analytics.totalArticleLikes || 0) + 
                            (analytics.totalComments || 0) + (analytics.totalShares || 0);
    
    if (totalViews === 0) return 0;
    return Math.round((totalEngagements / totalViews) * 100);
  };

  const getPerformanceScore = () => {
    if (!analytics) return 0;
    const engagementRate = getEngagementRate();
    const contentCount = (analytics.totalPosts || 0) + (analytics.totalArticles || 0);
    const avgEngagement = contentCount > 0 ? ((analytics.totalPostLikes || 0) + (analytics.totalArticleLikes || 0)) / contentCount : 0;
    
    // Calculate performance score
    const baseScore = Math.min(engagementRate * 1.5, 40); // Max 40 points for engagement
    const contentScore = Math.min(contentCount * 2, 30); // Max 30 points for content volume
    const avgScore = Math.min(avgEngagement * 3, 30); // Max 30 points for average engagement
    
    return Math.round(baseScore + contentScore + avgScore);
  };

  const getPerformanceLevel = (score) => {
    if (score >= 85) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-600/20' };
    if (score >= 70) return { level: 'Very Good', color: 'text-blue-400', bg: 'bg-blue-600/20' };
    if (score >= 50) return { level: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-600/20' };
    if (score >= 30) return { level: 'Average', color: 'text-orange-400', bg: 'bg-orange-600/20' };
    return { level: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-600/20' };
  };

  const handleContentSelect = (content) => {
    setSelectedContent(content);
  };

  const handleBackToOverview = () => {
    setSelectedContent(null);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-8">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  // If a specific content is selected, show its detailed analytics
  if (selectedContent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowDown className="h-4 w-4 rotate-90" />
            Back to Overview
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedContent.type === 'post' ? 'Post' : 'Article'} Analytics
          </div>
        </div>
        
        {selectedContent.type === 'post' ? (
          <PostAnalytics 
            postId={selectedContent.id} 
            userId={userId} 
            timeframe={timeframe} 
          />
        ) : (
          <ArticleAnalytics 
            articleId={selectedContent.id} 
            userId={userId} 
            timeframe={timeframe} 
          />
        )}
      </div>
    );
  }

  const performanceScore = getPerformanceScore();
  const performanceLevel = getPerformanceLevel(performanceScore);
  const engagementRate = getEngagementRate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-600/20 rounded-xl">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => window.location.reload()} // This would need proper state management
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(analytics.totalViews, analytics.previousTotalViews);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-4 w-4 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {((analytics.totalPostViews || 0) + (analytics.totalArticleViews || 0)).toLocaleString()}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Total Views</p>
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-600/20 rounded-lg">
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(analytics.totalLikes, analytics.previousTotalLikes);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-4 w-4 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {((analytics.totalPostLikes || 0) + (analytics.totalArticleLikes || 0)).toLocaleString()}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Total Likes</p>
          </div>
        </div>

        {/* Total Comments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(analytics.totalComments, analytics.previousTotalComments);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-4 w-4 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(analytics.totalComments || 0).toLocaleString()}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Total Comments</p>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(engagementRate, analytics.previousEngagementRate);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-4 w-4 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{engagementRate}%</p>
            <p className="text-gray-500 dark:text-gray-400">Engagement Rate</p>
          </div>
        </div>
      </div>

      {/* Performance Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Overall Performance</h3>
          <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="text-center lg:text-left">
            <div className="text-5xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {performanceScore}/100
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${performanceLevel.bg} ${performanceLevel.color}`}>
              <Award className="h-5 w-5 mr-2" />
              {performanceLevel.level}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${performanceScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Based on engagement rate, content volume, and audience interaction
            </p>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Posts Performance</h3>
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics.totalPosts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Views</span>
              <span className="font-semibold text-gray-900 dark:text-white">{(analytics.totalPostViews || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
              <span className="font-semibold text-gray-900 dark:text-white">{(analytics.totalPostLikes || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Engagement</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.totalPosts > 0 ? Math.round((analytics.totalPostLikes || 0) / analytics.totalPosts) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Articles Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Articles Performance</h3>
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Articles</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analytics.totalArticles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Views</span>
              <span className="font-semibold text-gray-900 dark:text-white">{(analytics.totalArticleViews || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
              <span className="font-semibold text-gray-900 dark:text-white">{(analytics.totalArticleLikes || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Engagement</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.totalArticles > 0 ? Math.round((analytics.totalArticleLikes || 0) / analytics.totalArticles) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Content */}
      {analytics.trendingContent && analytics.trendingContent.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Performing Content</h3>
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="space-y-4">
            {analytics.trendingContent.slice(0, 5).map((content, index) => (
              <div 
                key={content.id} 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleContentSelect(content)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-600/20 rounded-full">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {content.type === 'post' ? (
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {content.title || content.content || 'Untitled'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {content.type === 'post' ? 'Post' : 'Article'} • {new Date(content.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{content.views || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{content.likes || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{content.comments || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Comments</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
