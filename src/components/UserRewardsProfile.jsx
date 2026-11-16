import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Download, Eye, FileText, Calendar, User, Award as AwardIcon, X } from 'lucide-react';
import Logo from '../assets/Logo.png';
import CertificatePreview from './CertificatePreview';
import certificateService from '../services/certificateService';

const UserRewardsProfile = ({ userId }) => {
  const [rewards, setRewards] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserRewards();
    }
  }, [userId]);

  const fetchUserRewards = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

      const [rewardsRes, badgesRes, certificatesRes] = await Promise.all([
        fetch(`${API_URL}/rewards/rewards/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/rewards/badges/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/rewards/certificates/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [rewardsData, badgesData, certificatesData] = await Promise.all([
        rewardsRes.json(),
        badgesRes.json(),
        certificatesRes.json()
      ]);
      
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      setBadges(Array.isArray(badgesData) ? badgesData : []);
      setCertificates(Array.isArray(certificatesData) ? certificatesData : []);

    } catch (error) {
      console.error('Error fetching user rewards:', error);
      // Set empty arrays on error
      setRewards([]);
      setBadges([]);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalRewards = rewards.length;
  const totalBadges = badges.length;
  const totalCertificates = certificates.length;

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      await certificateService.downloadCertificatePDF(certificate.id);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Achievements & Rewards
          </h3>
          
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-6 sm:space-x-8">
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex flex-col items-center gap-1 relative ${
              activeTab === 'badges'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Award className="h-5 w-5" />
            {totalBadges > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalBadges}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex flex-col items-center gap-1 relative ${
              activeTab === 'rewards'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Trophy className="h-5 w-5" />
            {totalRewards > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalRewards}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex flex-col items-center gap-1 relative ${
              activeTab === 'certificates'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="h-5 w-5" />
            {totalCertificates > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalCertificates}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'badges' && (
          <div>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge, index) => (
                  <div key={index} className="text-center group">
                    <div className="relative">
                      <div 
                        className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors"
                        style={{ backgroundColor: badge.badge.color + '20' }}
                      >
                        <span className="text-3xl">{badge.badge.icon}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        ✓
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {badge.badge.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {badge.badge.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No badges earned yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Start writing articles to earn your first badge!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            {rewards.length > 0 ? (
              <div className="space-y-4">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg mr-4">
                      <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {reward.reward.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {reward.reward.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Awarded {new Date(reward.awardedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {reward.reward.value && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          {reward.reward.value.toLocaleString()} RWF
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          💰 Monetary Reward
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No rewards earned yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Keep writing great articles to earn rewards!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div>
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((certificate, index) => (
                  <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    {/* Certificate Header */}
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full mb-3">
                        <AwardIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {certificate.certificate.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Certificate of Achievement
                      </p>
                    </div>
                    
                    {/* Certificate Content */}
                    <div className="space-y-3 mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {certificate.certificate.description}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        Issued on {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    {/* Certificate Footer */}
                    <div className="border-t border-yellow-200 dark:border-yellow-700 pt-3">
                      <div className="flex items-center justify-center mb-3">
                        <img src={Logo} alt="UMUNSI MEDIA" className="h-6 w-6 mr-2" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          AWARDED BY UMUNSI MEDIA
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCertificate(certificate)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadCertificate(certificate)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No certificates earned yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Achieve excellence to earn certificates!
                </p>
                <div className="flex items-center justify-center">
                  <img src={Logo} alt="UMUNSI MEDIA" className="h-5 w-5 mr-2" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    UMUNSI MEDIA
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificate Preview Modal */}
      {showCertificateModal && selectedCertificate && (
        <CertificatePreview
          certificateId={selectedCertificate.id}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};

export default UserRewardsProfile;
