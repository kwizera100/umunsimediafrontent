import React, { useState } from 'react';
import { Award, Star, Trophy, Medal, Crown, Zap, Heart, Eye, MessageCircle, Share2, Calendar, Users, DollarSign } from 'lucide-react';

const Badge = ({ 
  badge, 
  size = 'md', 
  showTooltip = true, 
  animated = false, 
  className = '',
  onClick = null
}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-6 h-6',
      icon: 'w-3 h-3',
      text: 'text-xs',
      padding: 'p-1'
    },
    md: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm',
      padding: 'p-1.5'
    },
    lg: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base',
      padding: 'p-2'
    },
    xl: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-lg',
      padding: 'p-3'
    }
  };

  // Badge type configurations
  const getBadgeConfig = (type, value) => {
    const configs = {
      'TOP_VIEWED': {
        icon: Eye,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-400',
        glowColor: 'shadow-blue-500/25',
        label: 'Top Viewed'
      },
      'EDITORS_CHOICE': {
        icon: Star,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-400',
        glowColor: 'shadow-yellow-500/25',
        label: 'Editor\'s Choice'
      },
      'MOST_SHARED': {
        icon: Share2,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-400',
        glowColor: 'shadow-green-500/25',
        label: 'Most Shared'
      },
      'HIGHLY_ENGAGED': {
        icon: MessageCircle,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        textColor: 'text-purple-400',
        glowColor: 'shadow-purple-500/25',
        label: 'Highly Engaged'
      },
      'TRENDING': {
        icon: Zap,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        textColor: 'text-orange-400',
        glowColor: 'shadow-orange-500/25',
        label: 'Trending'
      },
      'FEATURED': {
        icon: Crown,
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        textColor: 'text-pink-400',
        glowColor: 'shadow-pink-500/25',
        label: 'Featured'
      },
      'POPULAR': {
        icon: Heart,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        glowColor: 'shadow-red-500/25',
        label: 'Popular'
      },
      'ACADEMIC_EXCELLENCE': {
        icon: Award,
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30',
        textColor: 'text-indigo-400',
        glowColor: 'shadow-indigo-500/25',
        label: 'Academic Excellence'
      },
      'CREATIVE_MASTER': {
        icon: Medal,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
        glowColor: 'shadow-emerald-500/25',
        label: 'Creative Master'
      },
      'COMMUNITY_LEADER': {
        icon: Users,
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        textColor: 'text-cyan-400',
        glowColor: 'shadow-cyan-500/25',
        label: 'Community Leader'
      },
      'MONETARY': {
        icon: DollarSign,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-400',
        glowColor: 'shadow-green-500/25',
        label: 'Monetary Reward'
      },
      'CERTIFICATE': {
        icon: Award,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400',
        glowColor: 'shadow-amber-500/25',
        label: 'Certificate'
      },
      'TEST': {
        icon: Star,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-400',
        glowColor: 'shadow-yellow-500/25',
        label: 'Test Badge'
      }
    };

    return configs[type] || configs['FEATURED'];
  };

  const config = getBadgeConfig(badge?.type, badge?.value);
  const IconComponent = config.icon;
  const currentSize = sizeConfig[size];

  return (
    <div className="relative group">
      <div
        className={`
          ${currentSize.container} 
          ${currentSize.padding}
          ${config.bgColor} 
          ${config.borderColor}
          border-2 
          rounded-full 
          flex items-center justify-center
          ${animated ? 'animate-pulse' : ''}
          ${config.glowColor}
          ${animated ? 'shadow-lg' : 'shadow-md'}
          hover:scale-110 
          transition-all duration-300
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        onClick={onClick}
      >
        <IconComponent className={`${currentSize.icon} ${config.textColor}`} />
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
            <div className="font-semibold">{badge?.name || config.label}</div>
            {badge?.description && (
              <div className="text-gray-300 text-xs mt-1 max-w-xs">
                {badge.description}
              </div>
            )}
            {badge?.value && (
              <div className="text-yellow-400 text-xs mt-1">
                Value: {new Intl.NumberFormat("rw-RW", {
                  style: "currency",
                  currency: "RWF",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(badge.value)}
              </div>
            )}
            {badge?.earnedAt && (
              <div className="text-gray-400 text-xs mt-1">
                Earned: {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default Badge;
