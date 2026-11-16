import React, { useState, useEffect } from 'react';
import { Target, Award, TrendingUp, CheckCircle, Clock, Star } from 'lucide-react';
import badgeService from '../services/badgeService';

const BadgeProgression = ({ userId, className = '' }) => {
  const [progression, setProgression] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgression = async () => {
      try {
        setLoading(true);
        const data = await badgeService.getUserBadgeProgression(userId);
        setProgression(data.progression || []);
      } catch (error) {
        console.error('Error loading badge progression:', error);
        setProgression([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProgression();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (progression.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center ${className}`}>
        <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Badge Progress Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start engaging with the platform to earn your first badges!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Badge Progression
        </h3>
      </div>

      <div className="space-y-4">
        {progression.map((badge, index) => (
          <div key={badge.id || index} className="flex items-center space-x-4">
            {/* Badge Icon */}
            <div className="relative">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${badge.isEarned 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gray-200 dark:bg-gray-600'
                }
              `}>
                {badge.isEarned ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <Award className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              {badge.isEarned && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-2 h-2 text-white" />
                </div>
              )}
            </div>

            {/* Badge Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {badge.name}
                </h4>
                {badge.isEarned && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Earned!
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {badge.description}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    badge.isEarned 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${badge.progress || 0}%` }}
                ></div>
              </div>
              
              {/* Progress Text */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {badge.currentValue || 0} / {badge.targetValue || 100}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {badge.progress || 0}%
                </span>
              </div>
              
              {/* Time to Earn */}
              {!badge.isEarned && badge.estimatedTime && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Est. {badge.estimatedTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {progression.filter(b => b.isEarned).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progression.filter(b => !b.isEarned).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(progression.filter(b => b.isEarned).length / progression.length * 100) || 0}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeProgression;
