import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Users, Calendar } from 'lucide-react';
import badgeService from '../services/badgeService';

const Leaderboard = ({ type = 'all', className = '' }) => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        setLoading(true);
        const data = await badgeService.getLeaderboards(type);
        setLeaderboards(data.leaderboards || []);
      } catch (error) {
        console.error('Error loading leaderboards:', error);
        setLeaderboards([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboards();
  }, [type, selectedPeriod]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
          {rank}
        </span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leaderboards.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center ${className}`}>
        <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Leaderboard Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later for leaderboard updates!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {type === 'all' ? 'Overall' : type === 'articles' ? 'Article' : 'Club'} Leaderboard
          </h3>
        </div>
        
        {/* Period Filter */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboards.map((entry, index) => (
          <div 
            key={entry.id || index}
            className={`
              flex items-center space-x-4 p-4 rounded-lg transition-all duration-200
              ${index < 3 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700/50' 
                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(index + 1)}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {entry.avatar ? (
                  <img 
                    src={entry.avatar} 
                    alt={entry.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  entry.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {entry.name}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{entry.badges || 0} badges</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>{entry.rewards || 0} rewards</span>
                </div>
                {entry.points && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{entry.points} pts</span>
                  </div>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              <div className={`text-2xl font-bold bg-gradient-to-r ${getRankColor(index + 1)} bg-clip-text text-transparent`}>
                {entry.score || entry.points || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {type === 'all' ? 'Total' : type === 'articles' ? 'Articles' : 'Clubs'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {leaderboards.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Participants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {leaderboards.reduce((sum, entry) => sum + (entry.badges || 0), 0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
