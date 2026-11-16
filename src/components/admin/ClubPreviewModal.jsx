import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  User, 
  Calendar, 
  Shield, 
  ToggleLeft,
  ToggleRight,
  Trash2,
  Eye,
  MessageSquare,
  Heart,
  Settings,
  Crown,
  CheckCircle,
  XCircle
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

const ClubPreviewModal = ({ isOpen, onClose, clubId, onClubAction }) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && clubId) {
      fetchClubDetails();
    }
  }, [isOpen, clubId]);

  const fetchClubDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/clubs/${clubId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClub(data.data.club);
      } else {
        console.error('Failed to fetch club details');
      }
    } catch (error) {
      console.error('Error fetching club details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClubStatus = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/clubs/${clubId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClub(prev => ({ ...prev, isActive: data.data.club.isActive }));
        onClubAction && onClubAction('status-toggled', data.data.club);
      } else {
        console.error('Failed to toggle club status');
      }
    } catch (error) {
      console.error('Error toggling club status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!confirm('Are you sure you want to permanently delete this club? This action cannot be undone and will remove all posts and member data.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';
      const response = await fetch(`${API_BASE_URL}/admin/clubs/${clubId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onClubAction && onClubAction('deleted', { id: clubId });
        onClose();
      } else {
        console.error('Failed to delete club');
      }
    } catch (error) {
      console.error('Error deleting club:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Club Details</h3>
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
        ) : club ? (
          <div className="p-6">
            {/* Club Basic Info */}
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {club.image ? (
                  <img
                    src={(() => {
                      const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';
                      if (club.image.startsWith('http')) return club.image;
                      if (club.image.startsWith('uploads/')) return `${BASE_URL}/${club.image}`;
                      if (club.image.startsWith('clubs/')) return `${BASE_URL}/uploads/${club.image}`;
                      return `${BASE_URL}/uploads/clubs/${club.image}`;
                    })()}
                    alt={club.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{club.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    club.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {club.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                  {club.visibility === 'PRIVATE' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Private
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>Owner: {club.owner.firstName} {club.owner.lastName} (@{club.owner.username})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{club._count.members} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{club._count.posts} posts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatTimeAgo(club.createdAt)}</span>
                  </div>
                </div>

                {club.description && (
                  <p className="mt-3 text-gray-700 dark:text-gray-300">{club.description}</p>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{club._count.members}</div>
                <div className="text-sm text-blue-700">Members</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{club._count.posts}</div>
                <div className="text-sm text-green-700">Posts</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{club._count.joinRequests || 0}</div>
                <div className="text-sm text-purple-700">Join Requests</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <Heart className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-900">
                  {club.posts?.reduce((sum, post) => sum + (post._count?.clubLikes || 0), 0) || 0}
                </div>
                <div className="text-sm text-yellow-700">Total Likes</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Recent Members */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Members</h4>
                <div className="space-y-3">
                  {club.members && club.members.length > 0 ? (
                    club.members.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {member.user.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={member.user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">@{member.user.username}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(member.joinedAt)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No members yet</p>
                  )}
                </div>
              </div>

              {/* Recent Posts */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h4>
                <div className="space-y-3">
                  {club.posts && club.posts.length > 0 ? (
                    club.posts.map((post) => (
                      <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            {post.author.avatar ? (
                              <img
                                src={post.author.avatar}
                                alt={post.author.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {post.author.firstName} {post.author.lastName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{post.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <div className="flex items-center space-x-3">
                            <span>{post._count.clubLikes} likes</span>
                            <span>{post._count.clubComments} comments</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No posts yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Actions</h4>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleToggleClubStatus}
                  disabled={actionLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                    club.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {club.isActive ? (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      <span>{actionLoading ? 'Deactivating...' : 'Deactivate Club'}</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span>{actionLoading ? 'Activating...' : 'Activate Club'}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDeleteClub}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{actionLoading ? 'Deleting...' : 'Delete Club'}</span>
                </button>

                <button
                  onClick={() => window.open(`/clubs/${club.id}`, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Club Page</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Failed to load club details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubPreviewModal;