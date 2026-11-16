import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Star, CheckCircle, Zap, X } from 'lucide-react';

const PremiumBanner = ({ user, onClose }) => {
  if (!user || user.plan === 'PREMIUM') return null;

  const isExpired = user.planExpiresAt && new Date(user.planExpiresAt) <= new Date();

  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-xl p-6 mb-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">
                {isExpired ? 'Your Premium has expired' : "You aren't verified yet"}
              </h3>
            </div>
            
            <p className="text-blue-100 mb-4 text-sm lg:text-base">
              {isExpired 
                ? 'Renew your premium subscription to continue enjoying exclusive features.'
                : 'Get verified for writing articles, making more posts, and unlocking premium features.'
              }
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>Blue verification badge</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>Longer posts & articles</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>Edit posts & images</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>Priority support</span>
              </div>
            </div>

            <Link
              to="/subscription"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            >
              <Zap className="h-4 w-4" />
              {isExpired ? 'Renew Premium' : 'Get Verified'}
            </Link>
          </div>

          {/* Premium Icon */}
          <div className="hidden sm:block ml-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Star className="h-10 w-10 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumBanner;
