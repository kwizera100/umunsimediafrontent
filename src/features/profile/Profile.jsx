import React from 'react';
import { User, Settings, Heart, Star } from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-700/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 lg:p-8 mb-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                Profile Dashboard
              </h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Settings, title: 'Account Settings', desc: 'Update your profile', color: 'from-blue-500 to-blue-600' },
            { icon: Heart, title: 'Privacy', desc: 'Manage your privacy', color: 'from-red-500 to-red-600' },
            { icon: Star, title: 'Preferences', desc: 'Customize experience', color: 'from-yellow-500 to-yellow-600' }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-800/60 via-gray-800/40 to-gray-700/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 shadow-xl cursor-pointer"
              >
                <div className={`p-3 bg-gradient-to-r ${item.color} rounded-xl shadow-lg mb-4 w-fit`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Content Placeholder */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-700/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center shadow-2xl">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-white mb-2">Profile Features Coming Soon</h2>
          <p className="text-gray-400">Advanced profile management features will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;