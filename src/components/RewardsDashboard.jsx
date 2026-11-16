import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, TrendingUp, Bell, Target, Crown, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BadgeDisplay from './BadgeDisplay';
import BadgeProgression from './BadgeProgression';
import Leaderboard from './Leaderboard';
import AchievementNotifications from './AchievementNotifications';
import Certificate from './Certificate';
import badgeService from '../services/badgeService';

const RewardsDashboard = ({ className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userBadges, setUserBadges] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [userCertificates, setUserCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const [badgesData, rewardsData, certificatesData] = await Promise.all([
          badgeService.getAllBadges(),
          badgeService.getAllRewards(),
          badgeService.getAllRewards() // Assuming certificates are also rewards
        ]);
        
        setUserBadges(badgesData.badges || []);
        setUserRewards(rewardsData.rewards || []);
        setUserCertificates(certificatesData.certificates || []);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'badges', label: 'My Badges', icon: Award },
    { id: 'progression', label: 'Progress', icon: Target },
    { id: 'certificates', label: 'Certificates', icon: Star },
    { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Rewards & Achievements
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your progress and celebrate your achievements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userBadges.length + userRewards.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Achievements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Badges Earned</p>
                    <p className="text-3xl font-bold">{userBadges.length}</p>
                  </div>
                  <Award className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Rewards Earned</p>
                    <p className="text-3xl font-bold">{userRewards.length}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Certificates</p>
                    <p className="text-3xl font-bold">{userCertificates.length}</p>
                  </div>
                  <Star className="h-8 w-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Value</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat("rw-RW", {
                        style: "currency",
                        currency: "RWF",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(userRewards.reduce((sum, reward) => sum + (reward.value || 0), 0))}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BadgeDisplay 
                badges={userBadges.slice(0, 6)}
                rewards={userRewards.slice(0, 4)}
                title="Recent Achievements"
                layout="grid"
                size="md"
                maxVisible={10}
                showAll={true}
              />
              
              <Leaderboard type="all" />
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <BadgeDisplay 
            badges={userBadges}
            rewards={userRewards}
            title="All My Achievements"
            layout="grid"
            size="lg"
            maxVisible={20}
            showAll={true}
          />
        )}

        {activeTab === 'progression' && (
          <BadgeProgression userId={user?.id} />
        )}

        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Certificates
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userCertificates.length} certificates
              </span>
            </div>
            
            {userCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCertificates.map((certificate) => (
                  <Certificate 
                    key={certificate.id}
                    certificate={certificate}
                    size="md"
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Certificates Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Earn achievements to unlock certificates!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard type="all" />
              <Leaderboard type="articles" />
            </div>
            <Leaderboard type="clubs" />
          </div>
        )}

        {activeTab === 'notifications' && (
          <AchievementNotifications userId={user?.id} />
        )}
      </div>
    </div>
  );
};

export default RewardsDashboard;