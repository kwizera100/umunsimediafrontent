import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PremiumUpgradePrompt = ({ variant = 'card' }) => {
  const { user } = useAuth();

  if (user?.plan === 'PREMIUM') {
    return null;
  }

  const features = [
    { icon: Shield, text: 'Blue verification badge' },
    { icon: Zap, text: 'Longer posts & articles' },
    { icon: Users, text: 'Priority support' },
    { icon: Sparkles, text: 'Advanced analytics' },
  ];

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg border border-blue-500 shadow-lg overflow-hidden relative">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2.5 bg-white/20 rounded-lg flex-shrink-0">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                  Unlock Premium Features
                </h3>
                <p className="text-sm text-white/90 line-clamp-2">
                  Get verified, create longer posts, and access advanced features
                </p>
              </div>
            </div>
            
            <Link
              to="/subscription"
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md flex-shrink-0 whitespace-nowrap"
            >
              Upgrade Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Upgrade to Premium
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unlock exclusive features and enhance your experience
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center sm:items-start gap-2 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
              >
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center sm:text-left">
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <Link
          to="/subscription"
          className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md"
        >
          <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
          Get Premium
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* Pricing Hint */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Starting from 2,000 RWF/month
        </p>
      </div>
    </div>
  );
};

export default PremiumUpgradePrompt;