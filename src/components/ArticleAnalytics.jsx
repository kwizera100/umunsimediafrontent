import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Activity,
  Clock,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Target,
  Award,
  BookOpen,
  Timer,
  Calendar
} from 'lucide-react';
import analyticsService from '../services/analyticsService';

const ArticleAnalytics = ({ articleId, userId, timeframe = '30d' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [articleId, userId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [articleData, engagementData] = await Promise.all([
        analyticsService.getDetailedArticleAnalytics(articleId),
        analyticsService.getArticleEngagementMetrics(articleId)
      ]);
      
      setAnalytics({
        ...articleData,
        ...engagementData,
        lastUpdated: new Date()
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching article analytics:', err);
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
    const views = analytics.views || 0;
    const likes = analytics.likes || 0;
    const comments = analytics.comments || 0;
    const shares = analytics.shares || 0;
    const totalEngagement = likes + comments + shares;
    
    // Calculate engagement rate based on views and interactions
    if (views === 0) return 0;
    
    return Math.min(Math.round((totalEngagement / views) * 100), 100);
  };

  const getReadTime = () => {
    if (!analytics || !analytics.readTime) return 'N/A';
    return `${analytics.readTime} min read`;
  };

  const getPerformanceScore = () => {
    if (!analytics) return 0;
    const engagementRate = getEngagementRate();
    const views = analytics.views || 0;
    const likes = analytics.likes || 0;
    const comments = analytics.comments || 0;
    const shares = analytics.shares || 0;
    const totalEngagement = likes + comments + shares;
    const readTime = analytics.readTime || 0;
    
    // Calculate performance score based on views, engagement rate, and read time
    const viewsScore = Math.min(views / 20, 40); // Max 40 points for views (articles get more views)
    const engagementScore = Math.min(engagementRate * 0.3, 30); // Max 30 points for engagement rate
    const interactionScore = Math.min(totalEngagement * 2, 20); // Max 20 points for interactions
    const readTimeScore = Math.min(readTime * 2, 10); // Max 10 points for read time
    
    return Math.round(viewsScore + engagementScore + interactionScore + readTimeScore);
  };

  const getPerformanceLevel = (score) => {
    if (score >= 85) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-600/20' };
    if (score >= 70) return { level: 'Very Good', color: 'text-blue-400', bg: 'bg-blue-600/20' };
    if (score >= 50) return { level: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-600/20' };
    if (score >= 30) return { level: 'Average', color: 'text-orange-400', bg: 'bg-orange-600/20' };
    return { level: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-600/20' };
  };

  const getCompletionRate = () => {
    if (!analytics || !analytics.views || !analytics.completionRate) return 0;
    return Math.round(analytics.completionRate * 100);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const performanceScore = getPerformanceScore();
  const performanceLevel = getPerformanceLevel(performanceScore);
  const engagementRate = getEngagementRate();
  const completionRate = getCompletionRate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Article Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Zap className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Views */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(analytics.views, analytics.previousViews);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-3 w-3 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.views || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
          </div>
        </div>

        {/* Likes */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-600/20 rounded-lg">
              <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(analytics.likes, analytics.previousLikes);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-3 w-3 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.likes || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Likes</p>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
              <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(analytics.comments, analytics.previousComments);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-3 w-3 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.comments || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comments</p>
          </div>
        </div>

        {/* Shares */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-600/20 rounded-lg">
              <Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1">
              {(() => {
                const trend = getTrendIndicator(analytics.shares, analytics.previousShares);
                const IconComponent = trend.icon;
                return IconComponent && (
                  <IconComponent 
                    className={`h-3 w-3 ${trend.color}`} 
                  />
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.shares || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shares</p>
          </div>
        </div>
      </div>

      {/* Additional Article Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Read Time */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-600/20 rounded-lg">
              <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{getReadTime()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average read time</p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-600/20 rounded-lg">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion rate</p>
            </div>
          </div>
        </div>

        {/* Published Date */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-600/20 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.publishedAt ? new Date(analytics.publishedAt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement Rate</h4>
            <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {engagementRate}%
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {(analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0)} interactions out of {analytics.views || 0} views
              </p>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(engagementRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Score</h4>
            <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {performanceScore}/100
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${performanceLevel.bg} ${performanceLevel.color}`}>
                <Award className="h-4 w-4 mr-1" />
                {performanceLevel.level}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${performanceScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Behavior */}
      {analytics.readingBehavior && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reading Behavior</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {analytics.readingBehavior.averageTimeOnPage || 0}s
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. time on page</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {analytics.readingBehavior.bounceRate || 0}%
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bounce rate</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {analytics.readingBehavior.returnVisitors || 0}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Return visitors</p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Insights */}
      {analytics.insights && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insights</h4>
          <div className="space-y-3">
            {analytics.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="p-1 bg-purple-100 dark:bg-purple-600/20 rounded-full">
                  <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleAnalytics;
