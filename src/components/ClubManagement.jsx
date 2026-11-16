import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Check, 
  X, 
  Trash2, 
  Crown, 
  Shield, 
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  UserX,
  Settings,
  Star,
  AlertCircle
} from 'lucide-react';
import clubService from '../services/clubService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ClubManagement = ({ club, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const { user } = useAuth();

  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';

  const userMembership = club.members?.find(m => m.userId === user?.id);
  const isOwner = userMembership?.role === 'owner' || club.userRole === 'owner';
  const isAdmin = userMembership?.role === 'admin' || club.userRole === 'admin' || isOwner;
  const canManage = isOwner || isAdmin;

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers();
    } else if (activeTab === 'requests' && canManage) {
      loadJoinRequests();
    }
  }, [activeTab, currentPage, searchTerm]);

  const getAvatarUrl = (userObj) => {
    if (!userObj) {
      return `https://ui-avatars.com/api/?name=Unknown&background=4f46e5&color=ffffff&size=128`;
    }
    if (userObj.avatar) {
      if (userObj.avatar.startsWith('http')) {
        return userObj.avatar;
      }
      if (userObj.avatar.startsWith('uploads/')) {
        return `${BASE_URL}/${userObj.avatar}`;
      }
      if (userObj.avatar.startsWith('avatars/')) {
        return `${BASE_URL}/uploads/${userObj.avatar}`;
      }
      return `${BASE_URL}/uploads/avatars/${userObj.avatar}`;
    }
    const name = userObj.firstName || userObj.username || 'Unknown';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&size=128`;
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await clubService.getClubMembers(club.id, currentPage, 10);
      
      if (response.data) {
        setMembers(response.data.members || response.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await clubService.getClubJoinRequests(club.id, currentPage, 10);
      
      if (response.data) {
        setJoinRequests(response.data.joinRequests || response.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setRequestsTotal(response.data.pagination?.total ?? (response.data.joinRequests?.length || 0));
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
      setJoinRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      setActionLoading(requestId);
      await clubService.handleJoinRequest(club.id, requestId, action);
      
      // Reload data
      await Promise.all([loadMembers(), loadJoinRequests()]);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error handling join request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const removeMember = async (memberId) => {
    try {
      setActionLoading(memberId);
      await clubService.removeMember(club.id, memberId);
      await loadMembers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setActionLoading(null);
      setShowConfirmModal(false);
      setSelectedMember(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const roleStr = role?.toLowerCase() || 'member';
    switch (roleStr) {
      case 'owner':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg">
            <span className="mr-1">👑</span>
            Owner
          </div>
        );
      case 'admin':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
            <span className="mr-1">🛡️</span>
            Admin
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            <span className="mr-1">👤</span>
            Member
          </div>
        );
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Read-only view for non-managers
  if (!canManage) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-400" />
            👥 Club Members
          </h3>
          <p className="text-gray-400 mt-1">Meet the amazing community members</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-gray-300">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="font-medium">✨ Loading members...</span>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No members found</h3>
              <p className="text-gray-400">This club doesn't have any members yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div 
                  key={member.id || `${member.userId}-${Math.random()}`} 
                  className="group bg-gradient-to-r from-gray-800/50 to-gray-700/30 hover:from-gray-700/60 hover:to-gray-600/40 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] border border-gray-700/30 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={getAvatarUrl(member.user)}
                          alt={member.user?.firstName || 'Member'}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-600/50 shadow-lg"
                          onError={(e) => {
                            const name = member.user?.firstName || member.user?.username || 'Unknown';
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&size=128`;
                          }}
                        />
                        {member.user?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full shadow-lg"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">
                          {member.user?.firstName || 'Unknown'} {member.user?.lastName || ''}
                        </p>
                        <p className="text-gray-400 text-sm font-medium">
                          @{member.user?.username || 'unknown'}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Joined {formatJoinDate(member.joinedAt || member.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getRoleBadge(member.role)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tabs Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            Club Management
          </h2>
          
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('members');
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`py-2 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Members ({members.length})
            </button>
            
            <button
              onClick={() => {
                setActiveTab('requests');
                setCurrentPage(1);
              }}
              className={`py-2 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Requests ({requestsTotal})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'members' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Members Header & Search */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  Club Members
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Manage your community members
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <button
                  onClick={() => setActiveTab('add-member')}
                  className="flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md font-medium text-sm sm:text-base"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </button>
              </div>
            </div>
            
            {/* Members List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-lg font-medium">✨ Loading members...</span>
                </div>
              </div>
            ) : members.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
              <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-300 mb-2">No members found</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {searchTerm ? 'Try adjusting your search terms' : 'This club doesn\'t have any members yet'}
              </p>
            </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {members.map((member) => (
                  <div 
                    key={member.id || `${member.userId}-${Math.random()}`}
                    className="group bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg p-3 sm:p-4 transition-colors duration-200 border border-gray-200 dark:border-gray-600 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getAvatarUrl(member.user)}
                            alt={member.user?.firstName || 'Member'}
                            className="w-10 h-10 sm:w-12 sm:h-14 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                            onError={(e) => {
                              const name = member.user?.firstName || member.user?.username || 'Unknown';
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&size=128`;
                            }}
                          />
                          {member.user?.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {member.user?.firstName || 'Unknown'} {member.user?.lastName || ''}
                            </p>
                            {member.role === 'owner' && (
                              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">
                            {member.user?.email || `@${member.user?.username || 'unknown'}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-500">
                              Joined {formatJoinDate(member.joinedAt || member.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getRoleBadge(member.role)}
                        
                        {canManage && member.role !== 'owner' && member.userId !== user?.id && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowConfirmModal(true);
                            }}
                            disabled={actionLoading === member.id}
                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove member"
                          >
                            {actionLoading === member.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Pending Join Requests
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Review and manage membership requests
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange-500" />
                  <span className="text-sm sm:text-base font-medium">Loading requests...</span>
                </div>
              </div>
            ) : joinRequests.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Mail className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-300 mb-2">No pending requests</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  All caught up! No new membership requests at the moment.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {joinRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="group bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg p-3 sm:p-4 transition-colors duration-200 border border-orange-200 dark:border-orange-700/30 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getAvatarUrl(request.user)}
                            alt={request.user?.firstName || 'User'}
                            className="w-10 h-10 sm:w-12 sm:h-14 rounded-full object-cover border-2 border-orange-300 dark:border-orange-600"
                            onError={(e) => {
                              const name = request.user?.firstName || request.user?.username || 'Unknown';
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=ffffff&size=128`;
                            }}
                          />
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                            <Clock className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              {request.user?.firstName || 'Unknown'} {request.user?.lastName || ''}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">
                              {request.user?.email || `@${request.user?.username || 'unknown'}`}
                            </p>
                          </div>
                          
                          {request.message && (
                            <div className="bg-yellow-50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3 border-l-4 border-orange-500">
                              <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                                "{request.message}"
                              </p>
                            </div>
                          )}
                          
                          <p className="text-gray-500 dark:text-gray-500 text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            Requested {formatJoinDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleJoinRequest(request.id, 'approve')}
                          disabled={actionLoading === request.id}
                          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1" />
                          ) : (
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          )}
                          Approve
                        </button>
                        
                        <button
                          onClick={() => handleJoinRequest(request.id, 'reject')}
                          disabled={actionLoading === request.id}
                          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1" />
                          ) : (
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-member' && (
          <AddMemberForm clubId={club.id} onAdded={() => { setActiveTab('members'); loadMembers(); if (onUpdate) onUpdate(); }} />
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-900 dark:text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold disabled:hover:scale-100"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              ⬅️ Previous
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                📄 Page <span className="text-gray-900 dark:text-white font-bold">{currentPage}</span> of <span className="text-gray-900 dark:text-white font-bold">{totalPages}</span>
              </span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-900 dark:text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold disabled:hover:scale-100"
            >
              Next ➡️
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 p-6 max-w-md w-full">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-xl font-bold text-white">Confirm Removal</h3>
              <p className="text-gray-400">
                🗑️ Are you sure you want to remove <span className="text-white font-bold">{selectedMember.user?.firstName}</span> from the club?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-all duration-200 hover:scale-105 font-bold"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={() => removeMember(selectedMember.id)}
                  disabled={actionLoading === selectedMember.id}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 hover:scale-105 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedMember.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    '🗑️ Remove'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;

// Add Member Form Component
const AddMemberForm = ({ clubId, onAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(async () => {
      if (!value || value.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        setSearching(true);
        const data = await (await import('../services/userService')).default.searchUsers(value, 1, 8);
        const users = Array.isArray(data) ? data : (data.users || data.data || []);
        setResults(users);
      } catch (err) {
        setError('Failed to search users');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    setDebounceTimer(timer);
  };

  const handleAdd = async (userId) => {
    try {
      setAddingId(userId);
      await clubService.addMember(clubId, userId, 'member');
      
      // Show success message
      const user = results.find(u => u.id === userId);
      toast.success(`${user?.firstName || 'User'} added to the club!`, {
        duration: 3000,
      });
      
      // Remove user from results to prevent duplicate adds
      setResults(prev => prev.filter(u => u.id !== userId));
      
      if (onAdded) onAdded();
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to add member');
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setAddingId(null);
    }
  };

  const getAvatarUrl = (user) => {
    const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://fggg.space';
    if (!user?.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || user?.username || 'User')}&background=4f46e5&color=ffffff&size=64`;
    }
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">Add Member</h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Search for users and add them directly to the club</p>
      </div>

      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800/80 dark:to-gray-700/70 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search users by name or username..."
            className="pl-10 pr-4 py-3 w-full bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
          />
        </div>

        {searching && (
          <div className="flex items-center gap-2 mt-4 text-gray-600 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching users...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {!searching && results.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Found {results.length} user{results.length !== 1 ? 's' : ''}
            </div>
            {results.map((u) => (
              <div key={u.id} className="group flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600/50 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={getAvatarUrl(u)} 
                      alt={u.firstName || 'User'} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-500 transition-colors duration-200" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      @{u.username}
                    </div>
                    {u.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {u.email}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(u.id)}
                  disabled={addingId === u.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {addingId === u.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {!searching && query.trim().length >= 2 && results.length === 0 && !error && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">No users found</div>
        )}
      </div>
    </div>
  );
};