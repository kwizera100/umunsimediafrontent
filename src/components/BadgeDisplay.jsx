import React, { useState } from 'react';
import Badge from './Badge';
import { Award, Trophy, Star, Zap, Eye, MessageCircle, Share2, Heart, Crown, Medal, Users, Calendar, DollarSign } from 'lucide-react';

const BadgeDisplay = ({ 
  badges = [], 
  rewards = [], 
  maxVisible = 3, 
  showAll = false,
  size = 'md',
  layout = 'horizontal', // horizontal, vertical, grid
  title = 'Achievements & Rewards',
  className = '',
  onBadgeClick = null
}) => {
  const [showAllBadges, setShowAllBadges] = useState(showAll);

  // Combine badges and rewards for display
  const allItems = [
    ...badges.map(badge => ({ ...badge, type: 'badge' })),
    ...rewards.map(reward => ({ ...reward, type: 'reward' }))
  ];

  const visibleItems = showAllBadges ? allItems : allItems.slice(0, maxVisible);
  const remainingCount = allItems.length - maxVisible;

  // Layout configurations
  const layoutClasses = {
    horizontal: 'flex flex-wrap items-center gap-2',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
  };

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 relative z-10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
            <Award className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            {allItems.length}
          </span>
        </div>
        
        {allItems.length > maxVisible && !showAllBadges && (
          <button
            onClick={() => setShowAllBadges(true)}
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            View All ({allItems.length})
          </button>
        )}
      </div>

      {/* Badges Grid */}
      <div className={`${layoutClasses[layout]} relative z-20`}>
        {visibleItems.map((item, index) => (
          <div key={`${item.type}-${item.id || index}`} className="relative group z-30">
            <Badge 
              badge={item} 
              size={size}
              animated={item.type === 'reward' || item.priority === 'high'}
              onClick={onBadgeClick ? () => onBadgeClick(item) : null}
            />
            
            {/* Special indicator for rewards */}
            {item.type === 'reward' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center z-40">
                <DollarSign className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show Less Button */}
      {showAllBadges && allItems.length > maxVisible && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAllBadges(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Show Less
          </button>
        </div>
      )}

      {/* Stats Summary */}
      {allItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>{badges.length} Badges</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-orange-500" />
                <span>{rewards.length} Rewards</span>
              </div>
            </div>
            <div className="text-xs">
              Total Value: {new Intl.NumberFormat("rw-RW", {
                style: "currency",
                currency: "RWF",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(rewards.reduce((sum, reward) => sum + (reward.value || 0), 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
