import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, Globe, MapPin, Loader2, Phone, Mail, BadgeCheck, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import mediaHouseService from '../services/mediaHouseService';
import MediaHouseLogo from '../components/MediaHouseLogo';
import { ClaimForm } from './MediaHouses';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';

const MediaHouseProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const res = await mediaHouseService.getMediaHouse(id);
        setHouse(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Media house not found');
      } finally {
        setLoading(false);
      }
    };
    fetchHouse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Media house not found</h2>
          <button onClick={() => navigate('/media-houses')} className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Back to Media Houses
          </button>
        </div>
      </div>
    );
  }

  const socials = house.socialLinks || {};
  const hasSocials = Object.values(socials).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && (
        <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
          <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
      )}

      <div className={`flex flex-1 ${user ? 'pt-12 md:pt-16' : 'pt-0'} relative`}>
        {user && <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}

        <div className={`flex-1 ${user ? 'lg:ml-64' : ''} relative`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <button onClick={() => navigate('/media-houses')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Media Houses
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Cover banner */}
              <div className="relative h-44 sm:h-56 bg-gradient-to-r from-blue-600 to-indigo-700">
                {house.coverImage && (
                  <img src={house.coverImage} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="p-6 pt-0 -mt-12">
                {/* Logo + name */}
                <div className="flex items-end gap-4 mb-5">
                  <div className="ring-4 ring-white dark:ring-gray-800 rounded-xl flex-shrink-0">
                    <MediaHouseLogo logo={house.logo} name={house.name} size={96} rounded="rounded-xl" />
                  </div>
                  <div className="pb-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      {house.name}
                      {house.status === 'verified' && <BadgeCheck className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {house.category && (
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">{house.category}</span>
                      )}
                      {house.foundedYear && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Est. {house.foundedYear}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {house.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{house.description}</p>
                  )}

                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {house.country && (
                      <p className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"><MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" /> {house.country}</p>
                    )}
                    {house.email && (
                      <a href={`mailto:${house.email}`} className="text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline break-all"><Mail className="h-4 w-4 flex-shrink-0" /> {house.email}</a>
                    )}
                    {house.phoneNumber && (
                      <a href={`tel:${house.phoneNumber}`} className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"><Phone className="h-4 w-4 text-gray-400 flex-shrink-0" /> {house.phoneNumber}</a>
                    )}
                    {house.physicalAddress && (
                      <p className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"><Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" /> {house.physicalAddress}</p>
                    )}
                  </div>

                  {/* Websites */}
                  {house.websites && house.websites.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Websites</p>
                      <div className="flex flex-wrap gap-2">
                        {house.websites.map((w, i) => (
                          <a key={i} href={w} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                            <Globe className="h-3.5 w-3.5" /> {w.replace(/^https?:\/\//, '')}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social links */}
                  {hasSocials && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Follow</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(socials).filter(([, v]) => v).map(([platform, url]) => (
                          <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors capitalize">
                            {platform === 'twitter' ? 'X (Twitter)' : platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Claim / managed by */}
                  {house.status === 'unclaimed' && user && (
                    <button
                      onClick={() => setShowClaimForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Building2 className="h-5 w-5" /> Claim This Media House
                    </button>
                  )}
                  {house.status === 'verified' && house.claimant && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Managed by {house.claimant.firstName} {house.claimant.lastName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim form modal */}
      {showClaimForm && (
        <ClaimForm
          mediaHouse={house}
          onClose={() => setShowClaimForm(false)}
          onSuccess={() => setShowClaimForm(false)}
        />
      )}

      {user && <MobileNav />}
    </div>
  );
};

export default MediaHouseProfile;
