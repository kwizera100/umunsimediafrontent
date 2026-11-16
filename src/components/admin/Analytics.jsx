import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Heart,
  MessageSquare,
  Star,
  Activity,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Globe,
  UserCheck,
  Crown,
  Zap,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from 'recharts';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomLineChart = ({ data, title, color = '#3B82F6', dataKey = 'count' }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          stroke="#6B7280" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => Math.floor(value)}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151', 
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          labelStyle={{ color: '#F9FAFB' }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value) => [Math.floor(value), '']}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const CustomBarChart = ({ data, title, xKey = 'name', yKey = 'value', colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey={xKey} 
          stroke="#6B7280" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#6B7280" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => Math.floor(value)}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151', 
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Bar 
          dataKey={yKey} 
          fill={colors[0]} 
          radius={[4, 4, 0, 0]}
          stroke={colors[0]}
          strokeWidth={1}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  </div>
);

const CustomMultiLineChart = ({ data, title, dataKeys = [] }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          stroke="#6B7280" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => Math.floor(value)}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151', 
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          labelStyle={{ color: '#F9FAFB' }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value) => [Math.floor(value), '']}
        />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line
            key={key.key}
            type="monotone"
            dataKey={key.key}
            stroke={key.color || COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ fill: key.color || COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
            name={key.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const CustomStackedBarChart = ({ data, title, dataKeys = [] }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          stroke="#6B7280" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => Math.floor(value)}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151', 
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          labelStyle={{ color: '#F9FAFB' }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value) => [Math.floor(value), '']}
        />
        <Legend />
        {dataKeys.map((key, index) => (
          <Bar
            key={key.key}
            dataKey={key.key}
            stackId="a"
            fill={key.color || COLORS[index % COLORS.length]}
            name={key.name}
            radius={index === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  </div>
);

const CustomPieChart = ({ data, title }) => {
  const pieData = Object.entries(data).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
    value: value
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: 'none', 
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};


const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const isPositive = change && parseFloat(change) >= 0;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(parseFloat(change))}%
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const TopPerformerCard = ({ title, items, type }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id || index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {type === 'users' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {item.firstName?.[0]}{item.lastName?.[0]}
                </div>
              ) : type === 'clubs' ? (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {item.name?.[0]}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-red-600 flex items-center justify-center text-white text-sm font-medium">
                  <FileText className="h-4 w-4" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {type === 'users' 
                  ? `${item.firstName} ${item.lastName}`
                  : type === 'clubs'
                  ? item.name
                  : item.content?.substring(0, 30) + '...'
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {type === 'users' 
                  ? `${item._count?.posts || 0} posts`
                  : type === 'clubs'
                  ? `${item._count?.members || 0} members`
                  : `${item._count?.likes || 0} likes`
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              #{index + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics(timeframe);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  const { overview, charts, distributions, topPerformers } = analytics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={overview.users.total}
          change={overview.users.growthPercentage}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value={overview.users.active}
          icon={UserCheck}
          color="green"
        />
        <MetricCard
          title="Premium Users"
          value={overview.users.premium}
          icon={Crown}
          color="yellow"
        />
        <MetricCard
          title="Total Posts"
          value={overview.content.posts}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Content & Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Articles"
          value={overview.content.articles}
          icon={FileText}
          color="indigo"
        />
        <MetricCard
          title="Total Likes"
          value={overview.engagement.likes}
          icon={Heart}
          color="red"
        />
        <MetricCard
          title="Messages"
          value={overview.engagement.messages}
          icon={MessageSquare}
          color="blue"
        />
        <MetricCard
          title="Clubs"
          value={overview.clubs.total}
          icon={Users}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomLineChart
          data={charts.userGrowth || []}
          title="User Growth Over Time"
          color="#3B82F6"
          dataKey="users"
        />
        <CustomMultiLineChart
          data={charts.engagementTrends || []}
          title="Engagement Trends"
          dataKeys={[
            { key: 'likes', name: 'Likes', color: '#10B981' },
            { key: 'comments', name: 'Comments', color: '#3B82F6' },
            { key: 'messages', name: 'Messages', color: '#F59E0B' }
          ]}
        />
      </div>

      {/* Content Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomStackedBarChart
          data={charts.contentCreation || []}
          title="Content Creation Activity Over Time"
          dataKeys={[
            { key: 'posts', name: 'Posts', color: '#3B82F6' },
            { key: 'articles', name: 'Articles', color: '#10B981' },
            { key: 'stories', name: 'Stories', color: '#F59E0B' },
            { key: 'comments', name: 'Comments', color: '#EF4444' }
          ]}
        />
        <CustomLineChart
          data={charts.clubGrowth || []}
          title="Club Growth"
          color="#8B5CF6"
          dataKey="clubs"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomPieChart
          data={distributions.plans}
          title="User Plan Distribution"
        />
        <CustomPieChart
          data={distributions.roles}
          title="User Role Distribution"
        />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopPerformerCard
          title="Most Active Users"
          items={topPerformers.users || []}
          type="users"
        />
        <TopPerformerCard
          title="Top Clubs"
          items={topPerformers.clubs || []}
          type="clubs"
        />
        <TopPerformerCard
          title="Popular Content"
          items={topPerformers.content || []}
          type="content"
        />
      </div>

      {/* Additional Insights */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Growth Rate</span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {overview.users.growthPercentage}% increase in new users
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900 dark:text-green-100">Engagement</span>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200">
              {((overview.engagement.likes + overview.engagement.messages) / overview.users.total).toFixed(1)} actions per user
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900 dark:text-purple-100">Premium Rate</span>
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              {((overview.users.premium / overview.users.total) * 100).toFixed(1)}% premium adoption
            </p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Last updated: {new Date(analytics.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default Analytics;