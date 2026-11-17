import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, PenTool, Users, ShoppingBag, X,
  BadgeCheck, ArrowRight, Wallet, Sparkles
} from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import mediaHouseService from '../services/mediaHouseService';
import toast from 'react-hot-toast';

const API = (import.meta.env.VITE_API_URL || 'https://writerapi.umunsi.com/api').replace(/\/$/, '');
const mediaUrl = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  const rel = String(u).replace(/^\/+/, '');
  if (rel.startsWith('uploads/')) return `${API.replace(/\/api$/, '')}/${rel}`;
  if (rel.includes('/')) return `${API.replace(/\/api$/, '')}/uploads/${rel}`;
  return `${API.replace(/\/api$/, '')}/uploads/articles/${rel}`;
};

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buyTarget, setBuyTarget] = useState(null);
  const [msisdn, setMsisdn] = useState('');
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await mediaHouseService.getMarketplace({ limit: 60 });
        const list = res?.data?.articles || res?.articles || res?.data || res || [];
        setArticles(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load marketplace');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const writers = useMemo(() => {
    const map = new Map();
    articles.forEach((a) => {
      const w = a.writer || a.author;
      if (w && (w.id || w.username)) {
        const key = w.id || w.username;
        if (!map.has(key)) map.set(key, { ...w, count: 0 });
        map.get(key).count += 1;
      }
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [articles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      [a.title, a.excerpt, a.writer?.firstName, a.writer?.lastName, a.writer?.username]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [articles, search]);

  const handleBuy = async () => {
    if (!buyTarget) return;
    if (!/^2507\d{8}$/.test(msisdn)) {
      toast.error('Enter a valid MTN number (2507XXXXXXXX)');
      return;
    }
    setBuying(true);
    try {
      const res = await mediaHouseService.initiateArticlePurchase(buyTarget.id, {
        msisdn, email: user?.email || '', customerName: user?.username || '',
      });
      toast.success(res?.message || 'Payment prompt sent — approve on your phone');
      setBuyTarget(null); setMsisdn('');
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Payment failed');
    } finally {
      setBuying(false);
    }
  };

  const writerName = (w) => (w ? [w.firstName, w.lastName].filter(Boolean).join(' ') || w.username || 'Writer' : 'Writer');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-64 px-4 sm:px-6 py-6 pb-24 lg:pb-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-8 mb-6 text-white shadow-xl">
          <Sparkles className="absolute -right-6 -top-6 h-40 w-40 text-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mb-1">
              <ShoppingBag className="h-4 w-4" /> Article Marketplace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Discover stories worth paying for</h1>
            <p className="text-indigo-100 max-w-xl text-sm sm:text-base">
              Browse articles published by our journalists and writers. Read previews, pick your favorites, and unlock full access with Mobile Money.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="#articles" className="px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg text-sm hover:bg-indigo-50 transition">Browse Articles</a>
              <a href="#writers" className="px-4 py-2 bg-white/15 backdrop-blur text-white font-semibold rounded-lg text-sm hover:bg-white/25 transition border border-white/20">Meet the Writers</a>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, topics, or writers…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="xl" text="Loading marketplace…" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No articles in the marketplace yet — check back soon.</p>
          </div>
        ) : (
          <div id="articles" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((a) => {
              const w = a.writer || a.author;
              const cover = mediaUrl(a.coverImage || a.image || a.thumbnail);
              const price = a.price ?? a.amount;
              return (
                <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                  {cover ? (
                    <img src={cover} alt={a.title} className="w-full h-44 object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-indigo-400/60" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {price > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                          {Number(price).toLocaleString()} RWF
                        </span>
                      )}
                      {a.category && <span className="text-xs text-gray-400">{a.category}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">{a.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">{a.excerpt || ''}</p>
                    {w && (
                      <Link to={w.username ? `/u/${w.username}` : '#'} className="mt-3 flex items-center gap-2 group">
                        {w.avatar ? (
                          <img src={w.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                            {writerName(w)[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1">
                            {writerName(w)} {w.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><PenTool className="h-3 w-3" /> Journalist</p>
                        </div>
                      </Link>
                    )}
                    <div className="mt-4 flex gap-2">
                      {price > 0 ? (
                        <button
                          onClick={() => { if (!user) { toast.error('Please log in to buy'); return; } setBuyTarget(a); }}
                          className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                        >
                          <Wallet className="h-4 w-4" /> Buy Now
                        </button>
                      ) : (
                        <Link to={`/a/${a.id}`} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm font-semibold text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                          Read Free
                        </Link>
                      )}
                      <Link to={`/a/${a.id}`} className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1">
                        View <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Writers strip */}
        {writers.length > 0 && (
          <div id="writers" className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Our Journalists & Writers</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {writers.map((w) => (
                <Link
                  key={w.id || w.username}
                  to={w.username ? `/u/${w.username}` : '#'}
                  className="shrink-0 flex flex-col items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-4 hover:shadow-md transition min-w-[110px]"
                >
                  {w.avatar ? (
                    <img src={w.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {writerName(w)[0]}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[100px]">{writerName(w)}</p>
                    <p className="text-xs text-gray-400">{w.count} {w.count === 1 ? 'article' : 'articles'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Buy modal */}
      {buyTarget && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => !buying && setBuyTarget(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Buy Article</h3>
              <button onClick={() => setBuyTarget(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 line-clamp-2">{buyTarget.title}</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4">{Number(buyTarget.price ?? buyTarget.amount ?? 0).toLocaleString()} RWF</p>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">MTN MoMo number</label>
            <input
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="2507XXXXXXXX"
              className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mb-4">You'll get a USSD prompt on this number to approve the payment.</p>
            <button
              onClick={handleBuy}
              disabled={buying}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
            >
              {buying ? 'Sending prompt…' : `Pay ${Number(buyTarget.price ?? buyTarget.amount ?? 0).toLocaleString()} RWF`}
            </button>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
};

export default Marketplace;
