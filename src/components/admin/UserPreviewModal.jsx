import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Ban, 
  CheckCircle, 
  AlertTriangle, 
  Trash2,
  Users,
  MessageSquare,
  FileText,
  Heart,
  Crown
} from 'lucide-react';

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const UserPreviewModal = ({ isOpen, onClose, userId, onUserAction }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspensionData, setSuspensionData] = useState({
    reason: '',
    duration: '' // empty for permanent, number for days
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const url = `${API_BASE_URL}/admin/users/${userId}/details`;
      console.log('Fetching user details from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('User details response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User details data:', data);
        setUser(data.data.user);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch user details:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspensionData.reason.trim()) {
      alert('Please provide a suspension reason');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: suspensionData.reason,
          duration: suspensionData.duration ? parseInt(suspensionData.duration) : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({ ...prev, isSuspended: true, suspensionReason: suspensionData.reason }));
        setShowSuspendForm(false);
        setSuspensionData({ reason: '', duration: '' });
        onUserAction && onUserAction('suspended', data.data.user);
      } else {
        console.error('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendUser = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unsuspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({ ...prev, isSuspended: false, suspensionReason: null }));
        onUserAction && onUserAction('unsuspended', data.data.user);
      } else {
        console.error('Failed to unsuspend user');
      }
    } catch (error) {
      console.error('Error unsuspending user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onUserAction && onUserAction('deleted', { id: userId });
        onClose();
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Verification email sent successfully to ${user.email}`);
      } else {
        alert(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to resend verification email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({ ...prev, emailVerified: true, emailVerifiedAt: new Date() }));
        onUserAction && onUserAction('verified', data.data.user);
      } else {
        console.error('Failed to verify user');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'MODERATOR': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'STANDARD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : user ? (
          <div className="p-6">
            {/* User Basic Info */}
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan)}`}>
                    {user.plan}
                  </span>
                  {user.isStudent && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Student
                    </span>
                  )}  
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>@{user.username}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Unverified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatTimeAgo(user.createdAt)} ago</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="mt-3 text-gray-700 dark:text-gray-300">{user.bio}</p>
                )}

                {/* Suspension Status */}
                {user.isSuspended && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Ban className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Account Suspended</span>
                    </div>
                    <p className="mt-1 text-sm text-red-700">
                      Reason: {user.suspensionReason}
                    </p>
                    {user.suspendedUntil && (
                      <p className="text-sm text-red-700">
                        Until: {new Date(user.suspendedUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{user._count.posts}</div>
                <div className="text-sm text-blue-700">Posts</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{user._count.articles}</div>
                <div className="text-sm text-green-700">Articles</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{user._count.followers}</div>
                <div className="text-sm text-purple-700">Followers</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <Crown className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-900">{user._count.ownedClubs}</div>
                <div className="text-sm text-yellow-700">Owned Clubs</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Recent Posts */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h4>
                <div className="space-y-3">
                  {user.posts && user.posts.length > 0 ? (
                    user.posts.map((post) => (
                      <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{post.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <div className="flex items-center space-x-3">
                            <span>{post._count.likes} likes</span>
                            <span>{post._count.comments} comments</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No posts yet</p>
                  )}
                </div>
              </div>

              {/* Recent Articles */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Articles</h4>
                <div className="space-y-3">
                  {user.articles && user.articles.length > 0 ? (
                    user.articles.map((article) => (
                      <div key={article.id} className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900  line-clamp-1">{article.title}</h5>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTimeAgo(article.createdAt)}</span>
                          <div className="flex items-center space-x-3">
                            <span>{article._count.articleLikes} like</span>
                            <span>{article._count.comments} comments</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No articles yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Owned Clubs */}
            {user.ownedClubs && user.ownedClubs.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Owned Clubs</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {user.ownedClubs.map((club) => (
                    <div key={club.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900 dark:text-white">{club.name}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          club.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {club.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{club._count.members} members</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Admin Actions</h4>
              
              {showSuspendForm ? (
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-red-900 mb-3">Suspend User</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">
                        Suspension Reason *
                      </label>
                      <textarea
                        value={suspensionData.reason}
                        onChange={(e) => setSuspensionData(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full p-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows="3"
                        placeholder="Provide a clear reason for suspension..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">
                        Duration (optional)
                      </label>
                      <input
                        type="number"
                        value={suspensionData.duration}
                        onChange={(e) => setSuspensionData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full p-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Days (leave empty for permanent)"
                        min="1"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSuspendUser}
                        disabled={actionLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <Ban className="w-4 h-4" />
                        <span>{actionLoading ? 'Suspending...' : 'Suspend User'}</span>
                      </button>
                      <button
                        onClick={() => setShowSuspendForm(false)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {!user.emailVerified && (
                    <>
                      <button
                        onClick={handleResendVerificationEmail}
                        disabled={actionLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Mail className="w-4 h-4" />
                        <span>{actionLoading ? 'Sending...' : 'Resend Verification Email'}</span>
                      </button>
                      <button
                        onClick={handleVerifyUser}
                        disabled={actionLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{actionLoading ? 'Verifying...' : 'Verify Email'}</span>
                      </button>
                    </>
                  )}
                  
                  {user.isSuspended ? (
                    <button
                      onClick={handleUnsuspendUser}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionLoading ? 'Unsuspending...' : 'Unsuspend User'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSuspendForm(true)}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Suspend User</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleDeleteUser}
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{actionLoading ? 'Deleting...' : 'Delete User'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Failed to load user details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPreviewModal;