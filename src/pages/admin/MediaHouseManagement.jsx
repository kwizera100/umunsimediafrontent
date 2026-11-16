import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, CheckCircle, XCircle, Clock,
  Trash2, ExternalLink, Eye, X, Loader2, Newspaper, DollarSign,
  AlertCircle, MapPin, Phone, Mail, Globe, Upload
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import mediaHouseService from '../../services/mediaHouseService';
import MediaHouseLogo from '../../components/MediaHouseLogo';
import toast from 'react-hot-toast';

const MediaHouseManagement = () => {
  const [tab, setTab] = useState('houses');
  const [mediaHouses, setMediaHouses] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [housesRes, claimsRes, articlesRes] = await Promise.all([
        mediaHouseService.adminGetAllMediaHouses().catch(() => ({ data: [] })),
        mediaHouseService.adminGetPendingClaims().catch(() => ({ data: [] })),
        mediaHouseService.adminGetPendingArticles().catch(() => ({ data: [] })),
      ]);
      setMediaHouses(housesRes.data || []);
      setPendingClaims(claimsRes.data || []);
      setPendingArticles(articlesRes.data || []);
    } catch (err) {
      console.error('Error fetching media house data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      await mediaHouseService.adminApproveClaim(claimId);
      toast.success('Claim approved successfully');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await mediaHouseService.adminRejectClaim(claimId, reason);
      toast.success('Claim rejected');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject claim');
    }
  };

  const handleApproveArticle = async (articleId) => {
    try {
      await mediaHouseService.adminApproveArticle(articleId);
      toast.success('Article approved for marketplace');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve article');
    }
  };

  const handleRejectArticle = async (articleId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await mediaHouseService.adminRejectArticle(articleId, reason);
      toast.success('Article rejected');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject article');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this Media House? This cannot be undone.')) return;
    try {
      await mediaHouseService.adminDeleteMediaHouse(id);
      toast.success('Media House deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredHouses = mediaHouses.filter(h =>
    h.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'houses', label: 'Media Houses', count: mediaHouses.length },
    { id: 'claims', label: 'Pending Claims', count: pendingClaims.length },
    { id: 'articles', label: 'Pending Articles', count: pendingArticles.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-500" />
            Media House Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add media houses, review claims, and approve marketplace articles
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Media House
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                t.id === 'claims' || t.id === 'articles'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'houses' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media houses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredHouses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No media houses yet. Click "Add Media House" to create one.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredHouses.map(house => (
                <div key={house.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MediaHouseLogo logo={house.logo} name={house.name} size={48} />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{house.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{house.country || 'Unknown'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      house.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      house.status === 'claim_pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {house.status === 'verified' ? 'Verified' :
                       house.status === 'claim_pending' ? 'Claim Pending' :
                       'Unclaimed'}
                    </span>
                  </div>
                  {house.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{house.description}</p>
                  )}
                  {house.websites && house.websites.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {house.websites.slice(0, 2).map((w, i) => (
                        <a key={i} href={w} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {new URL(w).hostname}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => setShowClaimModal(house)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="h-3 w-3" /> Details
                    </button>
                    <button
                      onClick={() => handleDelete(house.id)}
                      className="px-2 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'claims' && (
        <div className="space-y-4">
          {pendingClaims.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending claims.</p>
            </div>
          ) : (
            pendingClaims.map(claim => (
              <div key={claim.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{claim.mediaHouse?.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Claimed by {claim.user?.firstName} {claim.user?.lastName} (@{claim.user?.username})</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div><span className="text-gray-500 dark:text-gray-400">Legal Name:</span> <span className="text-gray-900 dark:text-white">{claim.legalName}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Email:</span> <span className="text-gray-900 dark:text-white">{claim.businessEmail}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Phone:</span> <span className="text-gray-900 dark:text-white">{claim.phoneNumber}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Address:</span> <span className="text-gray-900 dark:text-white">{claim.physicalAddress}</span></div>
                </div>
                {claim.websites && claim.websites.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Websites:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {claim.websites.map((w, i) => (
                        <a key={i} href={w} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {w}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-4"><MediaHouseLogo logo={claim.logo} name={claim.legalName} size={64} /></div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveClaim(claim.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectClaim(claim.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'articles' && (
        <div className="space-y-4">
          {pendingArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending marketplace articles.</p>
            </div>
          ) : (
            pendingArticles.map(article => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {article.coverImage && (
                      <img src={article.coverImage} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By {article.writer?.firstName} {article.writer?.lastName} • RWF {Number(article.price).toLocaleString()}
                      </p>
                      {article.excerpt && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{article.excerpt}</p>}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Pending Review
                  </span>
                </div>
                {article.taggedMediaHouses && article.taggedMediaHouses.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Tagged: </span>
                    {article.taggedMediaHouses.map(t => (
                      <span key={t.id} className="ml-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                        {t.mediaHouse?.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowArticleModal(article)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </button>
                  <button
                    onClick={() => handleApproveArticle(article.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectArticle(article.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm font-medium transition-colors"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Media House Modal */}
      {showCreateModal && (
        <CreateMediaHouseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchAll(); }}
        />
      )}

      {/* Claim Details Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowClaimModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media House Details</h3>
              <button onClick={() => setShowClaimModal(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <MediaHouseLogo logo={showClaimModal.logo} name={showClaimModal.name || showClaimModal.legalName} size={80} />
              <div><span className="text-gray-500 dark:text-gray-400">Name:</span> <span className="text-gray-900 dark:text-white font-medium">{showClaimModal.name}</span></div>
              {showClaimModal.description && <div><span className="text-gray-500 dark:text-gray-400">Description:</span> <span className="text-gray-900 dark:text-white">{showClaimModal.description}</span></div>}
              {showClaimModal.country && <div><span className="text-gray-500 dark:text-gray-400">Country:</span> <span className="text-gray-900 dark:text-white">{showClaimModal.country}</span></div>}
              {showClaimModal.claimant && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Claimant Info</p>
                  <p className="text-gray-600 dark:text-gray-400">{showClaimModal.claimant.firstName} {showClaimModal.claimant.lastName} (@{showClaimModal.claimant.username})</p>
                  <p className="text-gray-600 dark:text-gray-400">{showClaimModal.claimant.email}</p>
                </div>
              )}
              {showClaimModal.claims && showClaimModal.claims.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">Pending Claim — review in "Pending Claims" tab</p>
                </div>
              )}
              {showClaimModal.websites && showClaimModal.websites.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Websites:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {showClaimModal.websites.map((w, i) => (
                      <a key={i} href={w} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {w}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowArticleModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{showArticleModal.title}</h3>
              <button onClick={() => setShowArticleModal(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {showArticleModal.coverImage && <img src={showArticleModal.coverImage} alt="" className="w-full h-48 object-cover rounded-lg" />}
              <div><span className="text-gray-500 dark:text-gray-400">Price:</span> <span className="text-gray-900 dark:text-white font-medium">RWF {Number(showArticleModal.price).toLocaleString()}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Writer:</span> <span className="text-gray-900 dark:text-white">{showArticleModal.Writer?.firstName} {showArticleModal.Writer?.lastName}</span></div>
              {showArticleModal.excerpt && <div><span className="text-gray-500 dark:text-gray-400">Excerpt:</span> <p className="text-gray-700 dark:text-gray-300 mt-1">{showArticleModal.excerpt}</p></div>}
              {showArticleModal.source && <div><span className="text-gray-500 dark:text-gray-400">Source:</span> <span className="text-gray-900 dark:text-white">{showArticleModal.source}</span></div>}
              {showArticleModal.taggedMediaHouses && showArticleModal.taggedMediaHouses.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Tagged Media Houses:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {showArticleModal.taggedMediaHouses.map(t => (
                      <span key={t.id} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">{t.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Media House Modal
const CreateMediaHouseModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', country: '', websites: [''] });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      if (form.description) formData.append('description', form.description);
      if (form.country) formData.append('country', form.country);
      const websites = form.websites.filter(w => w.trim());
      if (websites.length > 0) formData.append('websites', JSON.stringify(websites));
      if (logo) formData.append('logo', logo);

      await mediaHouseService.adminCreateMediaHouse(formData);
      toast.success('Media House created successfully');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create media house');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Media House</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. The New Times, BBC, etc."
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the media house"
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={e => setForm({ ...form, country: e.target.value })}
              placeholder="e.g. Rwanda"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
            <div className="flex items-center gap-3">
              {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover" />}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Upload className="h-4 w-4" /> Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Websites</label>
            {form.websites.map((w, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={w}
                  onChange={e => {
                    const websites = [...form.websites];
                    websites[i] = e.target.value;
                    setForm({ ...form, websites });
                  }}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.websites.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, websites: form.websites.filter((_, idx) => idx !== i) })} className="px-2 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, websites: [...form.websites, ''] })} className="text-sm text-blue-500 hover:underline flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add website
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Media House
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaHouseManagement;
