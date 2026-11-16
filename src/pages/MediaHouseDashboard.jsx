import React, { useState, useEffect } from 'react';
import {
  Building2, Newspaper, ShoppingBag, Download, CheckCircle, XCircle,
  Loader2, DollarSign, Eye, Clock, Mail, Phone, MapPin, Globe, Upload,
  X, Plus, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import mediaHouseService from '../services/mediaHouseService';
import MediaHouseLogo from '../components/MediaHouseLogo';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import toast from 'react-hot-toast';

const MediaHouseDashboard = () => {
  const { user } = useAuth();
  const [myHouses, setMyHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [tab, setTab] = useState('tagged');
  const [taggedArticles, setTaggedArticles] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [buying, setBuying] = useState(null);

  useEffect(() => {
    fetchMyHouses();
  }, []);

  const fetchMyHouses = async () => {
    try {
      const res = await mediaHouseService.getMyMediaHouses();
      const houses = res.data || [];
      setMyHouses(houses);
      if (houses.length > 0) setSelectedHouse(houses[0]);
    } catch (err) {
      console.error('Error fetching media houses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHouse) {
      fetchHouseData();
    }
  }, [selectedHouse, tab]);

  const fetchHouseData = async () => {
    if (!selectedHouse) return;
    try {
      if (tab === 'tagged') {
        const res = await mediaHouseService.getTaggedArticles(selectedHouse.id);
        setTaggedArticles(res.data || []);
      } else if (tab === 'marketplace') {
        const res = await mediaHouseService.getMarketplace();
        setMarketplace(res.data || []);
      } else if (tab === 'purchased') {
        const res = await mediaHouseService.getPurchasedArticles(selectedHouse.id);
        setPurchased(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching house data:', err);
    }
  };

  const handleBuy = async (articleId) => {
    setBuying(articleId);
    try {
      await mediaHouseService.buyArticle(articleId);
      toast.success('Article purchased successfully!');
      fetchHouseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to purchase article');
    } finally {
      setBuying(null);
    }
  };

  const handleReject = async (articleId) => {
    if (!confirm('Remove this article from your tagged feed?')) return;
    try {
      await mediaHouseService.rejectArticle(articleId);
      toast.success('Article removed');
      fetchHouseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove article');
    }
  };

  const handleDownload = async (articleId) => {
    try {
      const res = await mediaHouseService.getDownloadUrl(articleId);
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get download link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (myHouses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Media Houses Claimed</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You haven't claimed any media houses yet. Browse available media houses and claim yours.
          </p>
          <a href="/media-houses" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Browse Media Houses
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'tagged', label: 'Tagged Articles', icon: Newspaper },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'purchased', label: 'Purchased', icon: Download },
    { id: 'profile', label: 'Profile', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </div>

      <div className="flex flex-1 pt-12 md:pt-16 relative">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <div className="flex-1 lg:ml-64 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {/* House Selector */}
            {myHouses.length > 1 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {myHouses.map(h => (
                  <button key={h.id} onClick={() => setSelectedHouse(h)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedHouse?.id === h.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                    <MediaHouseLogo logo={h.logo} name={h.name} size={20} rounded="rounded" />
                    {h.name}
                  </button>
                ))}
              </div>
            )}

            {/* House Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
              <div className="flex items-center gap-4">
                <MediaHouseLogo logo={selectedHouse?.logo} name={selectedHouse?.name} size={64} rounded="rounded-xl" />
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedHouse?.name}
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedHouse?.country}</p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{taggedArticles.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tagged</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{purchased.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Purchased</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    tab === t.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {tab === 'tagged' && (
              <div className="space-y-4">
                {taggedArticles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No articles tagged to your media house yet.</p>
                  </div>
                ) : (
                  taggedArticles.map(art => (
                    <div key={art.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {art.coverImage && <img src={art.coverImage} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{art.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              By {art.Writer?.firstName} {art.Writer?.lastName} • RWF {Number(art.price).toLocaleString()}
                            </p>
                            {art.excerpt && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{art.excerpt}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button onClick={() => handleBuy(art.id)} disabled={buying === art.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                          {buying === art.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                          Buy Now
                        </button>
                        <button onClick={() => handleReject(art.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <XCircle className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'marketplace' && (
              <div className="space-y-4">
                {marketplace.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No articles in the marketplace yet.</p>
                  </div>
                ) : (
                  marketplace.map(art => (
                    <div key={art.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-start gap-3">
                        {art.coverImage && <img src={art.coverImage} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{art.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            By {art.Writer?.firstName} {art.Writer?.lastName} • RWF {Number(art.price).toLocaleString()}
                          </p>
                          {art.excerpt && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{art.excerpt}</p>}
                          {art.source && <p className="text-xs text-gray-400 mt-1">Source: {art.source}</p>}
                        </div>
                        <button onClick={() => handleBuy(art.id)} disabled={buying === art.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex-shrink-0">
                          {buying === art.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                          Buy
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'purchased' && (
              <div className="space-y-4">
                {purchased.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No purchased articles yet.</p>
                  </div>
                ) : (
                  purchased.map(art => (
                    <div key={art.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {art.coverImage && <img src={art.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{art.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            RWF {Number(art.price).toLocaleString()} • {new Date(art.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDownload(art.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <Download className="h-4 w-4" /> Download
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'profile' && (
              <ProfileEditor house={selectedHouse} onUpdated={fetchMyHouses} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SOCIAL_FIELDS = [
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/yourpage' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourpage' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourpage' },
];

const MH_CATEGORIES = ['News', 'Sports', 'Entertainment', 'Politics', 'Business', 'Technology', 'Lifestyle', 'Culture', 'Radio', 'TV', 'Magazine', 'Blog'];

const ProfileEditor = ({ house, onUpdated }) => {
  const [form, setForm] = useState({
    name: house?.name || '',
    description: house?.description || '',
    country: house?.country || '',
    phoneNumber: house?.phoneNumber || '',
    physicalAddress: house?.physicalAddress || '',
    email: house?.email || '',
    foundedYear: house?.foundedYear ? String(house.foundedYear) : '',
    category: house?.category || '',
    websites: house?.websites?.length ? house.websites : [''],
    socialLinks: house?.socialLinks || {},
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(house?.logo || null);
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(house?.coverImage || null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.description) formData.append('description', form.description);
      if (form.country) formData.append('country', form.country);
      if (form.phoneNumber) formData.append('phoneNumber', form.phoneNumber);
      if (form.physicalAddress) formData.append('physicalAddress', form.physicalAddress);
      if (form.email) formData.append('email', form.email);
      if (form.foundedYear) formData.append('foundedYear', form.foundedYear);
      if (form.category) formData.append('category', form.category);
      const websites = form.websites.filter(w => w.trim());
      formData.append('websites', JSON.stringify(websites));
      const socials = Object.fromEntries(Object.entries(form.socialLinks).filter(([, v]) => v && v.trim()));
      formData.append('socialLinks', JSON.stringify(socials));
      if (logo) formData.append('logo', logo);
      if (cover) formData.append('coverImage', cover);

      await mediaHouseService.updateMediaHouse(house.id, formData);
      toast.success('Profile updated successfully');
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSave} className="space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      {/* Cover banner */}
      <div>
        <label className={labelCls}>Cover Banner</label>
        <div className="relative h-32 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden mb-2">
          {coverPreview ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No cover image</div>
          )}
        </div>
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <Upload className="h-4 w-4" /> Upload Cover
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files[0];
            if (f) { setCover(f); setCoverPreview(URL.createObjectURL(f)); }
          }} />
        </label>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3">
        {logoPreview ? <img src={logoPreview} alt="" className="w-16 h-16 rounded-xl object-cover" /> : <Building2 className="h-16 w-16 text-gray-300" />}
        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <Upload className="h-4 w-4" /> Change Logo
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files[0];
            if (f) { setLogo(f); setLogoPreview(URL.createObjectURL(f)); }
          }} />
        </label>
      </div>

      <div>
        <label className={labelCls}>Name</label>
        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
          placeholder="Tell readers what your media house covers..."
          className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
            <option value="">Select category</option>
            {MH_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Founded Year</label>
          <input type="number" min="1800" max={new Date().getFullYear()} value={form.foundedYear}
            onChange={e => setForm({ ...form, foundedYear: e.target.value })} placeholder="e.g. 2015" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Country</label>
          <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input type="tel" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@mediahouse.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Physical Address</label>
          <input type="text" value={form.physicalAddress} onChange={e => setForm({ ...form, physicalAddress: e.target.value })} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Websites</label>
        {form.websites.map((w, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="url" value={w} onChange={e => {
              const websites = [...form.websites];
              websites[i] = e.target.value;
              setForm({ ...form, websites });
            }} placeholder="https://example.com" className={'flex-1 ' + inputCls} />
            {form.websites.length > 1 && (
              <button type="button" onClick={() => setForm({ ...form, websites: form.websites.filter((_, idx) => idx !== i) })} className="px-2 text-red-500"><X className="h-4 w-4" /></button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setForm({ ...form, websites: [...form.websites, ''] })} className="text-sm text-blue-500 hover:underline flex items-center gap-1">
          <Plus className="h-3 w-3" /> Add website
        </button>
      </div>

      <div>
        <label className={labelCls}>Social Media Links</label>
        <div className="space-y-2">
          {SOCIAL_FIELDS.map(sf => (
            <div key={sf.key} className="flex items-center gap-2">
              <span className="w-24 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{sf.label}</span>
              <input type="url" value={form.socialLinks[sf.key] || ''} onChange={e =>
                setForm({ ...form, socialLinks: { ...form.socialLinks, [sf.key]: e.target.value } })
              } placeholder={sf.placeholder} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        Save Changes
      </button>
    </form>
  );
};

export default MediaHouseDashboard;
