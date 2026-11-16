import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Award, Users, Crown, Sparkles } from 'lucide-react';
import winnerService from '../services/winnerService';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space';

const NoticeBoard = () => {
  const navigate = useNavigate();
  const [winners, setWinners] = useState({ monthly: null, semester: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);
      const data = await winnerService.getCurrentWinners();
      setWinners(data);
    } catch (error) {
      console.error('Error loading winners:', error);
      // Silently fail - don't show winners section if there's an error
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (entity) => {
    if (!entity) return null;
    
    // For clubs
    if (entity.image) {
      if (entity.image.startsWith('http')) return entity.image;
      return `${API_URL}/uploads/clubs/${entity.image}`;
    }
    
    // For users
    if (entity.avatar) {
      if (entity.avatar.startsWith('http')) return entity.avatar;
      return `${API_URL}/uploads/avatars/${entity.avatar}`;
    }
    
    return null;
  };

  // Helper function to generate initials
  const getInitials = (entity) => {
    if (!entity) return '?';
    
    if (entity.name) {
      // For clubs
      return entity.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }
    
    if (entity.firstName && entity.lastName) {
      // For users
      return `${entity.firstName[0]}${entity.lastName[0]}`.toUpperCase();
    }
    
    if (entity.username) {
      return entity.username.slice(0, 2).toUpperCase();
    }
    
    return '?';
  };

  const handleWinnerClick = (winner) => {
    if (winner.club) {
      navigate(`/clubs/${winner.club.id}`);
    } else if (winner.user) {
      navigate(`/profile/${winner.user.username}`);
    }
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Award className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <Trophy className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPositionBadge = (position) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
    }
  };

  const WinnerCard = ({ winner, index }) => {
    const isClub = !!winner.club;
    const entity = winner.club || winner.user;
    if (!entity) return null;

    const avatarUrl = getAvatarUrl(entity);
    const initials = getInitials(entity);

    return (
      <div
        onClick={() => handleWinnerClick(winner)}
        className="relative group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      >
        {/* Glow effect for top positions */}
        {winner.position <= 3 && (
          <div className={`absolute inset-0 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity ${
            winner.position === 1 ? 'bg-yellow-400' :
            winner.position === 2 ? 'bg-gray-300' : 'bg-amber-400'
          }`} />
        )}
        
        <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-hidden">
          {/* Decorative gradient background */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${getPositionBadge(winner.position)}`} />
          
          {/* Position badge and icon */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getPositionIcon(winner.position)}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPositionBadge(winner.position)}`}>
                #{winner.position}
              </span>
            </div>
            {isClub ? (
              <Users className="h-4 w-4 text-gray-400" />
            ) : (
              <Trophy className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {/* Avatar/Logo and Name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={isClub ? entity.name : `${entity.firstName} ${entity.lastName}`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white ${avatarUrl ? 'hidden' : 'flex'} ${
                  isClub ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}
              >
                {initials}
              </div>
              {/* Glow ring for top 3 */}
              {winner.position <= 3 && (
                <div className={`absolute inset-0 rounded-full blur-md ${
                  winner.position === 1 ? 'ring-2 ring-yellow-400' :
                  winner.position === 2 ? 'ring-2 ring-gray-300' : 'ring-2 ring-amber-400'
                } opacity-30`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                {isClub ? entity.name : `${entity.firstName} ${entity.lastName}`}
              </h3>
              {!isClub && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{entity.username}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {winner.rewardDescription && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {winner.rewardDescription}
            </p>
          )}

          {/* Category badge */}
          {winner.category && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {winner.category}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't show the notice board if there are no winners
  if (!winners.monthly && !winners.semester) {
    return null;
  }

  const renderWinnerSection = (title, announcement, periodType) => {
    if (!announcement || !announcement.winners || announcement.winners.length === 0) {
      return null;
    }

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            {periodType === 'monthly' ? (
              <Calendar className="h-4 w-4 text-white" />
            ) : (
              <Award className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {announcement.title || title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {announcement.period || announcement.content}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {announcement.winners.slice(0, 3).map((winner, index) => (
            <WinnerCard key={winner.id} winner={winner} index={index} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl border border-purple-200 dark:border-gray-700 p-4 mb-4 shadow-sm overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-2xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Winners Board
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Outstanding achievers
            </p>
          </div>
        </div>

        {/* Winner Sections */}
        {renderWinnerSection('Monthly Winners', winners.monthly, 'monthly')}
        {renderWinnerSection('Semester Winners', winners.semester, 'semester')}

        {/* Empty state message */}
        {(!winners.monthly || winners.monthly.winners.length === 0) &&
         (!winners.semester || winners.semester.winners.length === 0) && (
          <div className="text-center py-8">
            <div className="inline-flex p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              No Winners Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Winners will be announced here soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;

