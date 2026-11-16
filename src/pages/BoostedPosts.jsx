import React, { useState, useEffect } from "react";
import {
  Zap,
  TrendingUp,
  Star,
  Crown,
  Sparkles,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Share,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import MobileNav from "../components/MobileNav";
import boostService from "../services/boostService";
import toast from "react-hot-toast";

const BoostedPosts = () => {
  const [boostedPosts, setBoostedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchBoostedPosts();
  }, []);

  const fetchBoostedPosts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await boostService.getMyBoostedPosts(page, pagination.limit);
      setBoostedPosts(data.data.posts);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error("Error fetching boosted posts:", error);
      toast.error("Failed to load boosted posts");
    } finally {
      setLoading(false);
    }
  };

  const getBoostIcon = (level) => {
    switch (level) {
      case 1:
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 2:
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 3:
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 4:
        return <Crown className="h-4 w-4 text-purple-500" />;
      case 5:
        return <Sparkles className="h-4 w-4 text-pink-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBoostColor = (level) => {
    switch (level) {
      case 1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case 2:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case 3:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case 4:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case 5:
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatRWF = (amount) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 dark:text-green-400";
      case "EXPIRED":
        return "text-gray-600 dark:text-gray-400";
      case "CANCELLED":
        return "text-red-600 dark:text-red-400";
      case "COMPLETED":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Desktop Navigation */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row pt-16 md:pt-20">
        {/* Left Sidebar - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar
            onCreatePost={() => {}}
            onCreateStory={() => {}}
            onCreateArticle={() => {}}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Boosted Posts
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your post promotions and analytics
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : boostedPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Boosted Posts Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Boost your posts to reach more people and increase engagement
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Start Boosting Posts
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {boostedPosts.map((boost) => (
                  <div
                    key={boost.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                  >
                    {/* Boost Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getBoostIcon(boost.boostLevel)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Level {boost.boostLevel} Boost
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getBoostColor(
                                boost.boostLevel
                              )}`}
                            >
                              {boost.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatRWF(boost.amount)} • {boost.duration} hours
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        <p>Created: {formatDate(boost.createdAt)}</p>
                        <p>Expires: {formatDate(boost.expiresAt)}</p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {boost.post.author.firstName?.charAt(0) ||
                            boost.post.author.username?.charAt(0) ||
                            "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {boost.post.author.firstName}{" "}
                              {boost.post.author.lastName}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              @{boost.post.author.username}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white mb-3">
                            {boost.post.content}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">Views</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {boost.post.views || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">Likes</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {boost.post._count.likes || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">Comments</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {boost.post._count.comments || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <Share className="h-4 w-4" />
                            <span className="text-sm">Shares</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {boost.post._count.shares || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => fetchBoostedPosts(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-gray-900 dark:text-white">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => fetchBoostedPosts(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default BoostedPosts;

