import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  MessageSquare,
  Image,
  Flag,
  MoreHorizontal,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ReportsManagement = () => {
  const { user: currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [showActions, setShowActions] = useState({});

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
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          const mockReports = [
            {
              id: '1',
              type: 'post',
              reason: 'inappropriate_content',
              status: 'pending',
              reportedBy: {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                username: 'john_doe',
                avatar: null
              },
              reportedUser: {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                username: 'jane_smith',
                avatar: null
              },
              content: {
                id: 'post_1',
                text: 'This is an example post that was reported for inappropriate content.',
                image: null,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
              },
              description: 'This post contains offensive language and inappropriate content.',
              createdAt: new Date(Date.now() - 1000 * 60 * 30),
              priority: 'high'
            },
            {
              id: '2',
              type: 'comment',
              reason: 'harassment',
              status: 'pending',
              reportedBy: {
                id: '3',
                firstName: 'Alice',
                lastName: 'Johnson',
                username: 'alice_j',
                avatar: null
              },
              reportedUser: {
                id: '4',
                firstName: 'Bob',
                lastName: 'Wilson',
                username: 'bob_w',
                avatar: null
              },
              content: {
                id: 'comment_1',
                text: 'This is a harassing comment that was reported.',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
              },
              description: 'User is being harassed in comments repeatedly.',
              createdAt: new Date(Date.now() - 1000 * 60 * 60),
              priority: 'medium'
            },
            {
              id: '3',
              type: 'message',
              reason: 'spam',
              status: 'resolved',
              reportedBy: {
                id: '5',
                firstName: 'Carol',
                lastName: 'Brown',
                username: 'carol_b',
                avatar: null
              },
              reportedUser: {
                id: '6',
                firstName: 'David',
                lastName: 'Lee',
                username: 'david_l',
                avatar: null
              },
              content: {
                id: 'message_1',
                text: 'Buy now! Limited time offer! Click here for amazing deals!',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
              },
              description: 'Sending multiple spam messages.',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
              priority: 'low',
              resolution: 'Content removed and user warned'
            },
            {
              id: '4',
              type: 'user',
              reason: 'fake_account',
              status: 'pending',
              reportedBy: {
                id: '7',
                firstName: 'Emma',
                lastName: 'Davis',
                username: 'emma_d',
                avatar: null
              },
              reportedUser: {
                id: '8',
                firstName: 'Fake',
                lastName: 'User',
                username: 'fake_user',
                avatar: null
              },
              content: null,
              description: 'This appears to be a fake account impersonating someone else.',
              createdAt: new Date(Date.now() - 1000 * 60 * 45),
              priority: 'high'
            }
          ];
          setReports(mockReports);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to fetch reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, [searchTerm, filterType, statusFilter, currentPage]);

  const handleReportAction = async (reportId, action, resolution = '') => {
    try {
      console.log(`Action: ${action} on report: ${reportId}`, { resolution });
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed', resolution }
          : report
      ));
      
      toast.success(`Report ${action === 'approve' ? 'approved' : 'dismissed'} successfully`);
      setShowActions({});
      setShowReportDetails(false);
    } catch (error) {
      toast.error(`Failed to ${action} report`);
    }
  };

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

  const getReasonDisplay = (reason) => {
    const reasons = {
      inappropriate_content: 'Inappropriate Content',
      harassment: 'Harassment',
      spam: 'Spam',
      fake_account: 'Fake Account',
      violence: 'Violence',
      hate_speech: 'Hate Speech',
      copyright: 'Copyright Violation',
      other: 'Other'
    };
    return reasons[reason] || reason.replace('_', ' ');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      resolved: <CheckCircle className="w-3 h-3 mr-1" />,
      dismissed: <XCircle className="w-3 h-3 mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate reported content</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            Export Reports
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Reports</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {reports.filter(r => r.status === 'pending').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Resolved</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {reports.filter(r => r.status === 'resolved').length}
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
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">High Priority</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {reports.filter(r => r.priority === 'high' && r.status === 'pending').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Flag className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Reports</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{reports.length}</dd>
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
              placeholder="Search reports..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="post">Posts</option>
            <option value="comment">Comments</option>
            <option value="message">Messages</option>
            <option value="user">Users</option>
          </select>

          <div className="flex items-center justify-end">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reported User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reports
                  .filter(report => statusFilter === 'all' || report.status === statusFilter)
                  .filter(report => filterType === 'all' || report.type === filterType)
                  .map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20">
                            {getTypeIcon(report.type)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            by {report.reportedBy.firstName} {report.reportedBy.lastName}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {formatTimeAgo(report.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full object-cover mr-3"
                          src={getUserAvatar(report.reportedUser)}
                          alt={report.reportedUser.firstName}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {report.reportedUser.firstName} {report.reportedUser.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{report.reportedUser.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getReasonDisplay(report.reason)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(report.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions({ [report.id]: !showActions[report.id] })}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        
                        {showActions[report.id] && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowReportDetails(true);
                                  setShowActions({});
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                              {report.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'approve')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Report
                                  </button>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'dismiss')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Dismiss Report
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Report Details
                </h3>
                <button
                  onClick={() => setShowReportDetails(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-96">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Report Type</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reason</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getReasonDisplay(selectedReport.reason)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.content && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reported Content</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedReport.content.text}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Posted {formatTimeAgo(selectedReport.content.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reported By</h4>
                    <div className="flex items-center space-x-3">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={getUserAvatar(selectedReport.reportedBy)}
                        alt={selectedReport.reportedBy.firstName}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedReport.reportedBy.firstName} {selectedReport.reportedBy.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{selectedReport.reportedBy.username}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reported User</h4>
                    <div className="flex items-center space-x-3">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={getUserAvatar(selectedReport.reportedUser)}
                        alt={selectedReport.reportedUser.firstName}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedReport.reportedUser.firstName} {selectedReport.reportedUser.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{selectedReport.reportedUser.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReport.resolution && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Resolution</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReport.resolution}
                    </p>
                  </div>
                )}

                {selectedReport.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'approve', 'Content removed and user warned')}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Report
                    </button>
                    <button
                      onClick={() => handleReportAction(selectedReport.id, 'dismiss', 'Report dismissed - no violation found')}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Dismiss Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;