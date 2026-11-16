import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Search, Globe, MapPin, CheckCircle, Clock,
  X, Loader2, Upload, Phone, Mail, Plus, ArrowLeft, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import mediaHouseService from '../services/mediaHouseService';
import MediaHouseLogo from '../components/MediaHouseLogo';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import toast from 'react-hot-toast';

const MediaHouses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mediaHouses, setMediaHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchMediaHouses();
  }, []);

  const fetchMediaHouses = async () => {
    try {
      setLoading(true);
      const res = await mediaHouseService.getAllMediaHouses();
      setMediaHouses(res.data || []);
    } catch (err) {
      console.error('Error fetching media houses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = mediaHouses.filter(h =>
    h.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {user && (
        <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
          <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
      )}

      <div className={`flex flex-1 ${user ? 'pt-12 md:pt-16' : 'pt-0'} relative`}>
        {user && (
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        {user && (
          <div className="hidden lg:block fixed right-0 top-16 bottom-0 w-80 z-40">
            <RightSidebar />
          </div>
        )}

        <div className={`flex-1 ${user ? 'lg:ml-64 lg:mr-80' : ''} relative`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-500" />
                Media Houses
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Browse media houses and claim your organization
              </p>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search media houses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No media houses found.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map(house => (
                  <div
                    key={house.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/media-houses/' + house.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <MediaHouseLogo logo={house.logo} name={house.name} size={56} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1">
                          {house.name}
                          {house.status === 'verified' && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {house.country && <><MapPin className="h-3 w-3" /> {house.country}</>}
                        </p>
                      </div>
                    </div>
                    {house.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{house.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        house.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        house.status === 'claim_pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {house.status === 'verified' ? 'Verified' :
                         house.status === 'claim_pending' ? 'Claim Pending' :
                         'Unclaimed'}
                      </span>
                      {house.status === 'unclaimed' && user && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedHouse(house); setShowClaimForm(true); }}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Claim This →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Form */}
      {showClaimForm && selectedHouse && (
        <ClaimForm
          mediaHouse={selectedHouse}
          onClose={() => { setShowClaimForm(false); setSelectedHouse(null); }}
          onSuccess={() => { setShowClaimForm(false); setSelectedHouse(null); fetchMediaHouses(); }}
        />
      )}
    </div>
  );
};

export const ClaimForm = ({ mediaHouse, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    legalName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    businessEmail: user?.email || '',
    phoneNumber: user?.telephone || '',
    physicalAddress: '',
    geographicLocation: '',
    websites: [''],
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.legalName.trim() || !form.businessEmail.trim() || !form.phoneNumber.trim() || !form.physicalAddress.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('legalName', form.legalName.trim());
      formData.append('businessEmail', form.businessEmail.trim());
      formData.append('phoneNumber', form.phoneNumber.trim());
      formData.append('physicalAddress', form.physicalAddress.trim());
      if (form.geographicLocation) formData.append('geographicLocation', form.geographicLocation);
      const websites = form.websites.filter(w => w.trim());
      if (websites.length > 0) formData.append('websites', JSON.stringify(websites));
      if (logo) formData.append('logo', logo);

      await mediaHouseService.claimMediaHouse(mediaHouse.id, formData);
      toast.success('Claim submitted! Admin will review your request.');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Claim: {mediaHouse.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fill in your organization details to claim this media house</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Name (Digital Signature) *</label>
            <input type="text" value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Email *</label>
            <input type="email" value={form.businessEmail} onChange={e => setForm({ ...form, businessEmail: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official Telephone *</label>
            <input type="tel" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Address *</label>
            <input type="text" value={form.physicalAddress} onChange={e => setForm({ ...form, physicalAddress: e.target.value })}
              placeholder="Street, City, Province"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geographic Location</label>
            <input type="text" value={form.geographicLocation} onChange={e => setForm({ ...form, geographicLocation: e.target.value })}
              placeholder="Lat/Long or area description"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Logo</label>
            <div className="flex items-center gap-3">
              {logoPreview && <img src={logoPreview} alt="" className="w-16 h-16 rounded-lg object-cover" />}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Upload className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files[0];
                  if (f) { setLogo(f); setLogoPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Websites</label>
            {form.websites.map((w, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="url" value={w} onChange={e => {
                  const websites = [...form.websites];
                  websites[i] = e.target.value;
                  setForm({ ...form, websites });
                }} placeholder="https://example.com"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {form.websites.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, websites: form.websites.filter((_, idx) => idx !== i) })} className="px-2 text-red-500"><X className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, websites: [...form.websites, ''] })} className="text-sm text-blue-500 hover:underline flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add website
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Submit Claim
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaHouses;
