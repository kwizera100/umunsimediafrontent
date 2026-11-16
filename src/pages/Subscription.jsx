import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Crown,
  CheckCircle,
  ArrowLeft,
  Shield,
  Zap,
  Users,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  XCircle,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import MobileNav from "../components/MobileNav";
import PaymentModal from "../components/PaymentModal";
import subscriptionService from "../services/subscriptionService";

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const statusResponse = await subscriptionService.getSubscriptionStatus();
      if (statusResponse) {
        setSubscriptionStatus(statusResponse);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const plans = {
    monthly: {
      name: "Monthly Premium",
      price: 2000,
      period: "month",
      popular: false,
    },
    annual: {
      name: "Annual Premium",
      price: 50000,
      period: "year",
      popular: false,
    },
  };

  const features = [
    { icon: Shield, text: "Blue verification badge" },
    { icon: Zap, text: "Longer posts & articles (10,000 chars)" },
    { icon: Users, text: "Priority support" },
    { icon: Sparkles, text: "Advanced analytics & insights" },
    { icon: BookOpen, text: "Create & publish articles" },
    { icon: TrendingUp, text: "Sell articles to media houses" },
  ];

  const formatRWF = (amount) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthlyPrice = (plan) => {
    if (plan.period === "month") {
      return plan.price;
    } else {
      return Math.round(plan.price / 12);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressPercentage = () => {
    if (!subscriptionStatus?.planExpiresAt || !user?.planExpiresAt) return 0;
    const startDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const endDate = new Date(subscriptionStatus.planExpiresAt);
    const now = new Date();
    const total = endDate - startDate;
    const elapsed = now - startDate;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const currentPlan = plans[selectedPlan];
  const isPremium = user?.plan === "PREMIUM" && 
    user?.planExpiresAt && 
    new Date(user.planExpiresAt) > new Date();
  const daysRemaining = getDaysRemaining(user?.planExpiresAt);
  const progressPercentage = getProgressPercentage();

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
                  Premium Subscription
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your subscription and unlock exclusive features
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Current Subscription Status */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {isPremium && user?.planExpiresAt ? (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Crown className="h-6 w-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Premium Active</h2>
                            <p className="text-blue-100">You're enjoying all premium features</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{daysRemaining}</div>
                          <div className="text-sm text-blue-100">Days Remaining</div>
                        </div>
                      </div>

                      {/* Timeline Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-blue-100">Subscription Progress</span>
                          <span className="text-white font-medium">
                            {Math.round(progressPercentage)}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-white h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Timeline Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm text-blue-100">Started</span>
                          </div>
                          <div className="text-lg font-semibold">
                            {formatDate(user?.createdAt)}
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm text-blue-100">Expires</span>
                          </div>
                          <div className="text-lg font-semibold">
                            {formatDate(user?.planExpiresAt)}
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm text-blue-100">Plan Type</span>
                          </div>
                          <div className="text-lg font-semibold">
                            {user?.planType || "Premium"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold">
                            {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {user?.firstName} {user?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              @{user?.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <XCircle className="h-5 w-5" />
                          <span className="font-medium">Free Plan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan Selection */}
                {!isPremium && (
                  <>
                    <div className="mb-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Choose Your Plan
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Unlock all premium features
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {/* Monthly Plan */}
                        <div
                          className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 ${
                            selectedPlan === "monthly"
                              ? "border-blue-500 shadow-lg"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          onClick={() => setSelectedPlan("monthly")}
                        >
                          {selectedPlan === "monthly" && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                Selected
                              </div>
                            </div>
                          )}

                          <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              Monthly
                            </h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                              {formatRWF(plans.monthly.price)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              per month
                            </p>
                          </div>
                        </div>

                        {/* Annual Plan */}
                        <div
                          className={`relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 ${
                            selectedPlan === "annual"
                              ? "border-blue-500 shadow-lg"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          onClick={() => setSelectedPlan("annual")}
                        >
                          {plans.annual.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                Pay Once, Save All Year
                              </div>
                            </div>
                          )}

                          {selectedPlan === "annual" && (
                            <div className="absolute -top-3 right-3">
                              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                Selected
                              </div>
                            </div>
                          )}

                          <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              Annual
                            </h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                              {formatRWF(plans.annual.price)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              per year
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                              {formatRWF(getMonthlyPrice(plans.annual))}/month • billed yearly
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Premium Features
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {features.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {feature.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subscribe Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Crown className="h-6 w-6 text-blue-500" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {currentPlan.name}
                          </h3>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {formatRWF(currentPlan.price)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentPlan.period === "month" ? "Billed monthly" : "Billed annually"}
                        </p>
                      </div>

                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <Crown className="h-5 w-5" />
                        <span>Subscribe Now</span>
                      </button>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>Secure Payment</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Cancel Anytime</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <MobileNav />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
        planPrice={currentPlan.price}
        user={user}
      />
    </div>
  );
};

export default Subscription;
