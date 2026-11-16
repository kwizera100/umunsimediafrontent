import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  User, 
  Eye, 
  Calendar, 
  Filter, 
  Search,
  Download,
  Clock,
  UserPlus,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';

  const getUserAvatar = (user) => {
    if (!user) return 'https://ui-avatars.com/api/?name=User&background=random&format=svg';
    if (user.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar;
      if (user.avatar.startsWith('uploads/')) return `${BASE_URL}/${user.avatar}`;
      if (user.avatar.startsWith('avatars/')) return `${BASE_URL}/uploads/${user.avatar}`;
      return `${BASE_URL}/uploads/avatars/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${user.firstName || user.username || 'User'}&background=random&format=svg`;
  };

  // Mock data for development
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          const mockLogs = [
            {
              id: '1',
              action: 'user_login',
              category: 'authentication',
              actor: {
                id: 'admin_1',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin',
                role: 'admin'
              },
              target: {
                type: 'user',
                id: 'user_1',
                name: 'John Doe'
              },
              details: {
                ipAddress: '192.168.1.100',
                userAgent: 'Chrome/91.0.4472.124',
                location: 'New York, US'
              },
              timestamp: new Date(Date.now() - 1000 * 60 * 10),
              severity: 'info'
            },
            {
              id: '2',
              action: 'content_moderated',
              category: 'moderation',
              actor: {
                id: 'admin_1',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin',
                role: 'admin'
              },
              target: {
                type: 'post',
                id: 'post_123',
                name: 'Inappropriate Post'
              },
              details: {
                reason: 'Inappropriate content',
                action: 'removed',
                reportId: 'report_456'
              },
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              severity: 'warning'
            },
            {
              id: '3',
              action: 'user_banned',
              category: 'moderation',
              actor: {
                id: 'admin_1',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin',
                role: 'admin'
              },
              target: {
                type: 'user',
                id: 'user_bad',
                name: 'Bad User'
              },
              details: {
                reason: 'Multiple violations',
                duration: '7 days',
                reportCount: 5
              },
              timestamp: new Date(Date.now() - 1000 * 60 * 60),
              severity: 'high'
            },
            {
              id: '4',
              action: 'user_registered',
              category: 'user_management',
              actor: {
                id: 'system',
                firstName: 'System',
                lastName: '',
                username: 'system',
                role: 'system'
              },
              target: {
                type: 'user',
                id: 'user_new',
                name: 'Jane Smith'
              },
              details: {
                ipAddress: '192.168.1.105',
                plan: 'FREE',
                source: 'web'
              },
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
              severity: 'info'
            },
            {
              id: '5',
              action: 'settings_changed',
              category: 'administration',
              actor: {
                id: 'admin_1',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin',
                role: 'admin'
              },
              target: {
                type: 'system',
                id: 'settings',
                name: 'System Settings'
              },
              details: {
                setting: 'user_registration',
                oldValue: 'open',
                newValue: 'invite_only'
              },
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
              severity: 'warning'
            }
          ];
          setLogs(mockLogs);
          setTotalPages(3);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast.error('Failed to fetch activity logs');
        setLoading(false);
      }
    };

    fetchLogs();
  }, [searchTerm, filterType, dateRange, currentPage]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActionIcon = (action) => {
    const icons = {
      user_login: <User className="h-4 w-4" />,
      user_logout: <User className="h-4 w-4" />,
      user_registered: <UserPlus className="h-4 w-4" />,
      user_banned: <Shield className="h-4 w-4" />,
      content_moderated: <AlertTriangle className="h-4 w-4" />,
      post_created: <FileText className="h-4 w-4" />,
      message_sent: <MessageSquare className="h-4 w-4" />,
      settings_changed: <Settings className="h-4 w-4" />,
      admin_action: <Shield className="h-4 w-4" />
    };
    return icons[action] || <Activity className="h-4 w-4" />;
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[severity]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const classes = {
      authentication: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      moderation: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      user_management: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      administration: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      content: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getActionDescription = (log) => {
    const descriptions = {
      user_login: `${log.actor.firstName} logged in`,
      user_logout: `${log.actor.firstName} logged out`,
      user_registered: `New user ${log.target.name} registered`,
      user_banned: `User ${log.target.name} was banned`,
      content_moderated: `Content ${log.target.name} was moderated`,
      post_created: `New post created by ${log.actor.firstName}`,
      message_sent: `Message sent by ${log.actor.firstName}`,
      settings_changed: `System settings changed by ${log.actor.firstName}`,
      admin_action: `Admin action performed by ${log.actor.firstName}`
    };
    return descriptions[log.action] || `${log.action} by ${log.actor.firstName}`;
  };

  const exportLogs = () => {
    // Implement export functionality
    toast.success('Exporting logs...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor all admin and user activities</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={exportLogs}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4 mr-1" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Activities</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">2,459</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">High Priority</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {logs.filter(log => log.severity === 'high').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Admin Actions</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {logs.filter(log => log.actor.role === 'admin').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Last Hour</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {logs.filter(log => Date.now() - new Date(log.timestamp) < 1000 * 60 * 60).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search activities..."
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="moderation">Moderation</option>
            <option value="user_management">User Management</option>
            <option value="administration">Administration</option>
            <option value="content">Content</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <div className="flex items-center justify-end">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <Filter className="h-4 w-4 mr-1" />
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs
                    .filter(log => filterType === 'all' || log.category === filterType)
                    .map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
                              {getActionIcon(log.action)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getActionDescription(log)}
                            </div>
                            {log.details && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {Object.entries(log.details).slice(0, 2).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full object-cover mr-3"
                            src={getUserAvatar(log.actor)}
                            alt={log.actor.firstName}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.actor.firstName} {log.actor.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {log.actor.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCategoryBadge(log.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{log.target?.type || 'N/A'}</div>
                          <div className="text-gray-500 dark:text-gray-400">{log.target?.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(log.timestamp)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;