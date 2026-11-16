import React, { useState, useEffect } from 'react';
import {
  FileText, Upload, X, Loader2, CheckCircle,
  Building2, Search, Newspaper, ArrowLeft, Info, Pencil, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import mediaHouseService from '../services/mediaHouseService';
import MediaHouseLogo from '../components/MediaHouseLogo';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import toast from 'react-hot-toast';

const SellArticle = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    source: '',
    price: '',
    taggedMediaHouses: [],
  });
  const [docxFile, setDocxFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [mediaHouses, setMediaHouses] = useState([]);
  const [mhSearch, setMhSearch] = useState('');
  const [showMhDropdown, setShowMhDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myArticles, setMyArticles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const canSell = user?.plan === 'PREMIUM' || user?.isStudent;

  useEffect(() => {
    fetchMediaHouses();
    fetchMyArticles();
  }, []);

  const fetchMediaHouses = async () => {
    try {
      const res = await mediaHouseService.getAllMediaHouses({ status: 'verified', limit: 100 });
      setMediaHouses(res.data || []);
    } catch (err) {
      console.error('Error fetching media houses:', err);
    }
  };

  const fetchMyArticles = async () => {
    try {
      const res = await mediaHouseService.getMyMarketArticles();
      setMyArticles(res.data || []);
    } catch (err) {
      console.error('Error fetching my articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMH = mediaHouses.filter(mh =>
    mh.name?.toLowerCase().includes(mhSearch.toLowerCase()) &&
    !form.taggedMediaHouses.find(t => t.id === mh.id)
  );

  const handleDocxChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      toast.error('Only .docx files are allowed');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be less than 20MB');
      return;
    }
    setDocxFile(file);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleMediaHouse = (mh) => {
    const exists = form.taggedMediaHouses.find(t => t.id === mh.id);
    if (exists) {
      setForm({ ...form, taggedMediaHouses: form.taggedMediaHouses.filter(t => t.id !== mh.id) });
    } else {
      setForm({ ...form, taggedMediaHouses: [...form.taggedMediaHouses, mh] });
    }
  };

  const resetForm = () => {
    setForm({ title: '', excerpt: '', source: '', price: '', taggedMediaHouses: [] });
    setDocxFile(null);
    setCoverImage(null);
    setCoverPreview(null);
    setEditingId(null);
  };

  const handleEdit = (art) => {
    setEditingId(art.id);
    setForm({
      title: art.title || '',
      excerpt: art.excerpt || '',
      source: art.source || '',
      price: String(art.price || ''),
      taggedMediaHouses: (art.taggedMediaHouses || []).map(t => t.mediaHouse || t),
    });
    setCoverPreview(art.coverImage || null);
    setDocxFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (art) => {
    if (!window.confirm(`Delete "${art.title}"? This cannot be undone.`)) return;
    setDeletingId(art.id);
    try {
      await mediaHouseService.deleteMarketArticle(art.id);
      toast.success('Article deleted');
      setMyArticles(prev => prev.filter(a => a.id !== art.id));
      if (editingId === art.id) resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete article');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRequired = !editingId;
    if (!form.title.trim() || !form.excerpt.trim() || !form.price || (docRequired && !docxFile)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (parseFloat(form.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('excerpt', form.excerpt.trim());
      formData.append('price', form.price);
      if (form.source) formData.append('source', form.source);
      if (docxFile) formData.append('document', docxFile);
      if (coverImage) formData.append('coverImage', coverImage);
      const mhIds = form.taggedMediaHouses.map(mh => mh.id);
      formData.append('taggedMediaHouseIds', JSON.stringify(mhIds));

      if (editingId) {
        await mediaHouseService.updateMarketArticle(editingId, formData);
        toast.success('Article updated — back to pending for re-review.');
      } else {
        await mediaHouseService.submitMarketArticle(formData);
        toast.success('Article submitted! Admin will review before publishing.');
      }
      resetForm();
      fetchMyArticles();
    } catch (err) {
      toast.error(err.response?.data?.message || (editingId ? 'Failed to update article' : 'Failed to submit article'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!canSell) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium or Student Account Required</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Only Premium users and verified Students can sell articles in the marketplace.
          </p>
          <a href="/subscription" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Upgrade to Premium
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </div>

      <div className="flex flex-1 pt-12 md:pt-16 relative">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <div className="flex-1 lg:ml-64 relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-blue-500" />
                Sell Article
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload your .docx article, set a price, and tag media houses. You earn 70% per sale.
              </p>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Upload a .docx file with your article content and a cover image</li>
                  <li>• Set your price in RWF and tag media houses</li>
                  <li>• Admin reviews and approves before it appears in the marketplace</li>
                  <li>• You earn <strong>70%</strong> of each sale — 30% goes to platform fees</li>
                  <li>• <strong>Stories written by AI will not be approved</strong></li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter article title"
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt / Preview *</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief summary of your article (visible to buyers before purchase)"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (RWF) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">RWF</span>
                    <input type="number" min="100" step="100" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="5,000"
                      className="w-full pl-12 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source (if any)</label>
                  <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                    placeholder="e.g. DeskNews"
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Tag Media Houses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tag Media Houses (optional, multiple allowed)</label>
                {form.taggedMediaHouses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.taggedMediaHouses.map(mh => (
                      <span key={mh.id} className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                        <Building2 className="h-3 w-3" /> {mh.name}
                        <button type="button" onClick={() => toggleMediaHouse(mh)} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={mhSearch} onChange={e => setMhSearch(e.target.value)}
                    onFocus={() => setShowMhDropdown(true)} onBlur={() => setTimeout(() => setShowMhDropdown(false), 200)}
                    placeholder="Search media houses to tag..."
                    className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {showMhDropdown && filteredMH.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMH.map(mh => (
                        <button key={mh.id} type="button" onClick={() => { toggleMediaHouse(mh); setMhSearch(''); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MediaHouseLogo logo={mh.logo} name={mh.name} size={24} />
                          {mh.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image (related image)</label>
                <div className="flex items-center gap-3">
                  {coverPreview && <img src={coverPreview} alt="" className="w-20 h-20 rounded-lg object-cover" />}
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Upload className="h-4 w-4" /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                </div>
              </div>

              {/* .docx Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article Document (.docx) {editingId ? <span className="text-gray-400 font-normal">(leave empty to keep current)</span> : '*'}</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  {docxFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">{docxFile.name}</span>
                        <span className="text-xs text-gray-500">({(docxFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button type="button" onClick={() => setDocxFile(null)} className="text-red-500 hover:text-red-600"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-4">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload .docx file</span>
                      <span className="text-xs text-gray-400 mt-1">Max 20MB</span>
                      <input type="file" accept=".docx" className="hidden" onChange={handleDocxChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {editingId && (
                  <button type="button" onClick={resetForm}
                    className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                  {editingId ? 'Save Changes' : 'Submit for Review'}
                </button>
              </div>
            </form>

            {/* My Submitted Articles */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Submitted Articles</h2>
              {loading ? (
                <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" /></div>
              ) : myArticles.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No articles submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {myArticles.map(art => (
                    <div key={art.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {art.coverImage && <img src={art.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">{art.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">RWF {Number(art.price).toLocaleString()} • {art.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          art.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          art.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {art.status === 'approved' ? 'Approved' : art.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEdit(art)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit article"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(art)}
                          disabled={deletingId === art.id}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete article"
                        >
                          {deletingId === art.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellArticle;
