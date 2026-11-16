import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Edit, Trash2, Calendar, Crown, Award,
  Users, Sparkles, X, Save, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import winnerService from '../../services/winnerService';
import userService from '../../services/userService';
import clubService from '../../services/clubService';

const WinnersManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddWinnerModal, setShowAddWinnerModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    period: '',
    type: 'monthly', // 'monthly', 'semester', 'special'
  });

  const [winnerForm, setWinnerForm] = useState({
    userId: '',
    clubId: '',
    position: 1,
    category: '',
    rewardDescription: ''
  });

  const [winnerType, setWinnerType] = useState('user'); // 'user' or 'club'

  useEffect(() => {
    fetchAnnouncements();
    fetchUsers();
    fetchClubs();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await winnerService.getAllWinnerAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      toast.error('Failed to load winner announcements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsersForDropdown();
      console.log('Users response:', response);
      
      // Handle different response formats
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response?.data) {
        users = Array.isArray(response.data) ? response.data : response.data.users || [];
      } else if (response?.users) {
        users = response.users;
      }
      
      console.log('Users extracted:', users);
      setUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await clubService.getAllClubs();
      console.log('Clubs response:', response);
      
      // Handle different response formats
      let clubs = [];
      if (Array.isArray(response)) {
        clubs = response;
      } else if (response?.data?.clubs) {
        clubs = response.data.clubs;
      } else if (response?.clubs) {
        clubs = response.clubs;
      } else if (response?.data && Array.isArray(response.data)) {
        clubs = response.data;
      }
      
      console.log('Clubs extracted:', clubs);
      setClubs(clubs);
    } catch (error) {
      console.error('Failed to load clubs:', error);
      toast.error('Failed to load clubs');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await winnerService.createWinnerAnnouncement(formData);
      toast.success('Winner announcement created successfully');
      setShowModal(false);
      setFormData({ title: '', content: '', period: '', type: 'monthly' });
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.message || 'Failed to create announcement');
    }
  };

  const handleAddWinner = async (e) => {
    e.preventDefault();
    try {
      if (winnerType === 'user' && !winnerForm.userId) {
        toast.error('Please select a user');
        return;
      }
      if (winnerType === 'club' && !winnerForm.clubId) {
        toast.error('Please select a club');
        return;
      }
      
      // Only send relevant fields based on type
      const winnerData = {
        ...winnerForm,
        userId: winnerType === 'user' ? winnerForm.userId : undefined,
        clubId: winnerType === 'club' ? winnerForm.clubId : undefined,
      };
      
      await winnerService.addWinner(selectedAnnouncement.id, winnerData);
      toast.success('Winner added successfully');
      setShowAddWinnerModal(false);
      setWinnerForm({ userId: '', clubId: '', position: 1, category: '', rewardDescription: '' });
      setWinnerType('user');
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.message || 'Failed to add winner');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await winnerService.deleteWinnerAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      await winnerService.updateWinnerAnnouncement(announcement.id, {
        ...announcement,
        isActive: !announcement.isActive
      });
      toast.success('Announcement updated successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.message || 'Failed to update announcement');
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Winners Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage monthly and semester winners
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-6">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {announcement.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    announcement.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium capitalize">
                    {announcement.type}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{announcement.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{announcement.period}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{announcement.winners?.length || 0} Winners</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(announcement)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    announcement.isActive 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                  }`}
                >
                  {announcement.isActive ? 'Deactivate' : 'Activate'}
                </button>
              <button
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setWinnerForm({ userId: '', clubId: '', position: 1, category: '', rewardDescription: '' });
                  setWinnerType('user');
                  setShowAddWinnerModal(true);
                }}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg text-sm hover:bg-blue-200"
              >
                Add Winner
              </button>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Winners */}
            {announcement.winners && announcement.winners.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {announcement.winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      {winner.position === 1 ? (
                        <Crown className={`h-6 w-6 ${getPositionColor(winner.position)}`} />
                      ) : (
                        <Award className={`h-6 w-6 ${getPositionColor(winner.position)}`} />
                      )}
                      <span className={`text-lg font-bold ${getPositionColor(winner.position)}`}>
                        #{winner.position}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {winner.user?.avatar && (
                          <img
                            src={winner.user.avatar}
                            alt={`${winner.user.firstName} ${winner.user.lastName}`}
                            className="h-8 w-8 rounded-full"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        {winner.club?.image && (
                          <img
                            src={winner.club.image}
                            alt={winner.club.name}
                            className="h-8 w-8 rounded-full"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {winner.user 
                              ? `${winner.user.firstName} ${winner.user.lastName}` 
                              : winner.club?.name}
                          </p>
                          {winner.category && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {winner.category}
                            </p>
                          )}
                        </div>
                      </div>
                      {winner.rewardDescription && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {winner.rewardDescription}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Announcements Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first winner announcement to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Create Announcement
            </button>
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Winner Announcement
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., January 2024 Winners"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Congratulations to our winners!"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., January 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="semester">Semester</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="inline h-4 w-4 mr-2" />
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Winner Modal */}
      {showAddWinnerModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Winner to "{selectedAnnouncement.title}"
              </h2>
              <button
                onClick={() => {
                  setShowAddWinnerModal(false);
                  setWinnerForm({ userId: '', clubId: '', position: 1, category: '', rewardDescription: '' });
                  setWinnerType('user');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddWinner} className="space-y-4">
              <div className="border-b pb-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Winner Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWinnerType('user');
                      setWinnerForm({ ...winnerForm, clubId: '', userId: '' });
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      winnerType === 'user' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWinnerType('club');
                      setWinnerForm({ ...winnerForm, userId: '', clubId: '' });
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      winnerType === 'club' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Club
                  </button>
                </div>
              </div>

              {winnerType === 'user' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select User *
                  </label>
                  <select
                    required
                    value={winnerForm.userId}
                    onChange={(e) => setWinnerForm({ ...winnerForm, userId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a user...</option>
                    {users.length > 0 ? users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} (@{user.username})
                      </option>
                    )) : (
                      <option value="" disabled>Loading users...</option>
                    )}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Club *
                  </label>
                  <select
                    required
                    value={winnerForm.clubId}
                    onChange={(e) => setWinnerForm({ ...winnerForm, clubId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a club...</option>
                    {clubs.length > 0 ? clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    )) : (
                      <option value="" disabled>Loading clubs...</option>
                    )}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={winnerForm.position}
                    onChange={(e) => setWinnerForm({ ...winnerForm, position: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={winnerForm.category}
                    onChange={(e) => setWinnerForm({ ...winnerForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Academic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reward Description
                </label>
                <textarea
                  value={winnerForm.rewardDescription}
                  onChange={(e) => setWinnerForm({ ...winnerForm, rewardDescription: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the achievement"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddWinnerModal(false);
                    setWinnerForm({ userId: '', clubId: '', position: 1, category: '', rewardDescription: '' });
                    setWinnerType('user');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="inline h-4 w-4 mr-2" />
                  Add Winner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnersManagement;

