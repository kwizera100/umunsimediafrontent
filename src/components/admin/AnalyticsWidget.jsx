import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const AnalyticsWidget = () => {
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuickStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics('7d');
      setQuickStats(response.data);
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quickStats) return null;

  const { overview } = quickStats;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Analytics Snapshot</h3>
        </div>
        <button
          onClick={fetchQuickStats}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm opacity-90">Users</span>
          </div>
          <div className="text-2xl font-bold">{overview.users.total.toLocaleString()}</div>
          <div className="text-xs opacity-75">
            +{overview.users.new} this week
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-sm opacity-90">Active</span>
          </div>
          <div className="text-2xl font-bold">{overview.users.active.toLocaleString()}</div>
          <div className="text-xs opacity-75">
            {((overview.users.active / overview.users.total) * 100).toFixed(1)}% engagement
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm opacity-90">Growth</span>
          </div>
          <div className="text-2xl font-bold">{overview.users.growthPercentage}%</div>
          <div className="text-xs opacity-75">week over week</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm opacity-90">Content</span>
          </div>
          <div className="text-2xl font-bold">
            {(overview.content.newPosts + overview.content.newArticles).toLocaleString()}
          </div>
          <div className="text-xs opacity-75">new this week</div>
        </div>
      </div>

      <Link
        to="/admin/analytics"
        className="flex items-center justify-center space-x-2 w-full bg-white/20 hover:bg-white/30 rounded-lg py-3 px-4 transition-colors"
      >
        <span className="font-medium">View Detailed Analytics</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default AnalyticsWidget;