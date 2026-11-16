import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  AlertCircle,
  Calendar,
  Crown,
  Zap,
  DollarSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import AnalyticsWidget from '../../components/admin/AnalyticsWidget';
import toast from 'react-hot-toast';
import { Settings, Loader2, Download, Mail, Send } from 'lucide-react';

// Initialize Categories Button Component
const InitializeCategoriesButton = () => {
  const [initializing, setInitializing] = useState(false);

  const handleInitialize = async () => {
    if (!confirm('This will create default article categories. Continue?')) {
      return;
    }

    try {
      setInitializing(true);
      const response = await adminService.initializeCategories();
      if (response.success || response.categories) {
        toast.success(`Successfully initialized ${response.categories?.length || 10} categories!`);
        // Refresh the page after a short delay to show updated categories
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.success('Categories initialized successfully!');
      }
    } catch (error) {
      console.error('Error initializing categories:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to initialize categories. They may already exist.');
      }
    } finally {
      setInitializing(false);
    }
  };

  return (
    <button
      onClick={handleInitialize}
      disabled={initializing}
      className="block w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {initializing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initializing...</span>
        </>
      ) : (
        <>
          <Settings className="h-4 w-4" />
          <span>Initialize Article Categories</span>
        </>
      )}
    </button>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      totalMessages: 0,
      totalPosts: 0,
      totalArticles: 0,
      totalClubs: 0,
      totalStories: 0
    },
    growth: {
      newUsers: 0,
      activeUsers: 0
    },
    activity: {
      recentMessages: 0,
      recentPosts: 0,
      recentArticles: 0
    },
    plans: {
      FREE: 0,
      PREMIUM: 0
    }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [boostUsers, setBoostUsers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [loadingBoostUsers, setLoadingBoostUsers] = useState(false);
  const [installations, setInstallations] = useState({ total: 0, last7d: 0, recent: [] });
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch chart data
  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const response = await adminService.getUserGrowthData({ period: timeRange });
      
      if (response.success) {
        setChartData(response.data.chartData || []);
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      toast.error('Failed to load chart data');
    } finally {
      setChartLoading(false);
    }
  };

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity({ limit: 10 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activityResponse.success) {
        setRecentActivity(activityResponse.data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
    fetchSubscribers();
    fetchBoostUsers();
    fetchInstallations();
  }, [timeRange]);

  const fetchSubscribers = async () => {
    try {
      setLoadingSubscribers(true);
      const response = await adminService.getSubscribers({ limit: 5 });
      if (response.success) {
        setSubscribers(response.data.subscribers || []);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const fetchBoostUsers = async () => {
    try {
      setLoadingBoostUsers(true);
      const response = await adminService.getBoostUsers({ limit: 5 });
      if (response.success) {
        setBoostUsers(response.data.boostUsers || []);
      }
    } catch (error) {
      console.error('Failed to fetch boost users:', error);
    } finally {
      setLoadingBoostUsers(false);
    }
  };

  const fetchInstallations = async () => {
    try {
      setLoadingInstallations(true);
      const response = await adminService.getInstallations();
      if (response.success) {
        setInstallations(response.data || { total: 0, last7d: 0, recent: [] });
      }
    } catch (error) {
      console.error('Failed to fetch installations:', error);
    } finally {
      setLoadingInstallations(false);
    }
  };

  const handleEmailAllUsers = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Please enter both a subject and a message');
      return;
    }
    if (!confirm(`Send this email to ALL registered users?\n\nSubject: ${emailSubject}`)) {
      return;
    }
    try {
      setSendingEmail(true);
      const response = await adminService.emailAllUsers(emailSubject.trim(), emailMessage.trim());
      if (response.success) {
        const { sent, failed, total } = response.data || {};
        toast.success(`Email sent to ${sent}/${total} users${failed ? ` (${failed} failed)` : ''}`);
        setEmailSubject('');
        setEmailMessage('');
      } else {
        toast.error(response.message || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Failed to email all users:', error);
      toast.error(error.response?.data?.message || 'Failed to send emails');
    } finally {
      setSendingEmail(false);
    }
  };

  const formatRWF = (amount) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {changeType === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}% from last week
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ item }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'USER_REGISTERED':
          return <UserPlus className="h-4 w-4 text-green-500" />;
        case 'POST_CREATED':
          return <FileText className="h-4 w-4 text-blue-500" />;
        case 'ARTICLE_CREATED':
          return <FileText className="h-4 w-4 text-indigo-500" />;
        case 'CLUB_CREATED':
          return <Users className="h-4 w-4 text-purple-500" />;
        case 'user_reported':
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'message_sent':
          return <MessageSquare className="h-4 w-4 text-indigo-500" />;
        default:
          return <Activity className="h-4 w-4 text-gray-500" />;
      }
    };

    const formatTime = (timestamp) => {
      const now = new Date();
      const time = new Date(timestamp);
      const diffInMinutes = Math.floor((now - time) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    };

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(item.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-white">{item.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(item.timestamp)}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.firstName}! Here's what's happening in your app.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/analytics"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Activity className="h-4 w-4" />
            <span>View Analytics</span>
          </Link>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.overview?.totalUsers || 0}
          change={stats.growth?.newUsers || 0}
          changeType="up"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats.growth?.activeUsers || 0}
          change={Math.round((stats.growth?.activeUsers / stats.overview?.totalUsers * 100) || 0)}
          changeType="up"
          icon={Eye}
          color="green"
        />
        <StatCard
          title="Total Messages"
          value={stats.overview?.totalMessages || 0}
          change={stats.activity?.recentMessages || 0}
          changeType="up"
          icon={MessageSquare}
          color="purple"
        />
        <StatCard
          title="Total Posts"
          value={stats.overview?.totalPosts || 0}
          change={stats.activity?.recentPosts || 0}
          changeType="up"
          icon={FileText}
          color="orange"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {timeRange === '24h' ? 'Last 24 hours' : 
                 timeRange === '7d' ? 'Last 7 days' : 
                 timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </span>
            </div>
          </div>
          
          {chartLoading ? (
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No data available for the selected period</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="period" 
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
                    formatter={(value) => [Math.floor(value), '']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Total Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="premium" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Premium Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    name="Students"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="verifiedStudents" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    name="Verified Students"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Analytics Widget */}
        <div className="lg:col-span-2">
          <AnalyticsWidget />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Articles</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.overview?.totalArticles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Clubs</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.overview?.totalClubs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Posts</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.overview?.totalPosts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Stories</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.overview?.totalStories || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              View All Users
            </Link>
            <Link
              to="/admin/posts"
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Moderate Content
            </Link>
            <Link
              to="/admin/analytics"
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              View Analytics
            </Link>
            <InitializeCategoriesButton />
          </div>
        </div>
      </div>

      {/* App Installations and Email All Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Installations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">App Installations</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {installations.last7d} this week
            </span>
          </div>

          {loadingInstallations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{installations.total}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">total installs</span>
              </div>
              {installations.recent.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No installations recorded yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {installations.recent.slice(0, 10).map((inst) => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm"
                    >
                      <span className="text-gray-900 dark:text-white truncate">
                        {inst.user ? `${inst.user.firstName || ''} ${inst.user.lastName || ''}`.trim() || `@${inst.user.username}` : 'Guest'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {inst.platform || 'device'} &middot; {formatDate(inst.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Email All Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email All Users</h3>
          </div>
          <form onSubmit={handleEmailAllUsers} className="space-y-3">
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Write your message to all Umunsi Media users..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={sendingEmail}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending to all users...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Email to All Users</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Subscribers and Boost Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Subscribers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium Subscribers</h3>
            </div>
            <Link
              to="/admin/users?plan=PREMIUM"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </Link>
          </div>
          
          {loadingSubscribers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : subscribers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No active subscribers</p>
          ) : (
            <div className="space-y-3">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {subscriber.firstName?.charAt(0) || subscriber.username?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {subscriber.firstName} {subscriber.lastName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        @{subscriber.username}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(subscriber.planExpiresAt)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {subscriber.planType || "Premium"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boost Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Boost Users</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {boostUsers.length} active
            </span>
          </div>
          
          {loadingBoostUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          ) : boostUsers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No boost users yet</p>
          ) : (
            <div className="space-y-3">
              {boostUsers.map((boostUser, index) => (
                <div
                  key={boostUser.user?.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {boostUser.user?.firstName?.charAt(0) || boostUser.user?.username?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {boostUser.user?.firstName} {boostUser.user?.lastName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {boostUser.boostCount} boost{boostUser.boostCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatRWF(boostUser.totalSpent)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Total spent
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;