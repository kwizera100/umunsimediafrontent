import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Zap,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Crown,
  Sparkles,
  Phone,
  Mail,
  User,
  Bell,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import boostService from "../services/boostService";
import paymentService from "../services/paymentService";
import { useAuth } from "../contexts/AuthContext";

const BoostPostModal = ({ isOpen, onClose, postId, onBoostSuccess }) => {
  const { user } = useAuth();
  const [boostOptions, setBoostOptions] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    msisdn: "",
    email: "",
    customerName: "",
  });

  // MTN MoMo flow: after initiating, show a "check your phone" screen and poll status
  const [waitingScreen, setWaitingScreen] = useState(false);
  const [pendingRefid, setPendingRefid] = useState(null);
  const pollRef = useRef(null);

  // Clean up polling when modal closes
  useEffect(() => {
    if (!isOpen && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (isOpen) {
      setWaitingScreen(false);
      setPendingRefid(null);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOpen]);

  // Fetch boost options
  useEffect(() => {
    if (isOpen) {
      fetchBoostOptions();
      // Initialize payment form with user data
      if (user) {
        setPaymentData({
          msisdn: user.telephone || "",
          email: user.email || "",
          customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "",
        });
      }
      setShowPaymentForm(false);
    }
  }, [isOpen, user]);

  const fetchBoostOptions = async () => {
    try {
      setLoadingOptions(true);
      const data = await boostService.getBoostOptions();
      setBoostOptions(data.data);
    } catch (error) {
      console.error("Error fetching boost options:", error);
      toast.error("Failed to load boost options");
    } finally {
      setLoadingOptions(false);
    }
  };

  // Annual Premium subscribers get Basic boosts for free
  const isAnnualPremium =
    user?.plan === "PREMIUM" &&
    user?.planType === "ANNUAL" &&
    user?.planExpiresAt &&
    new Date(user.planExpiresAt) > new Date();

  const handleFreeBoost = async () => {
    setIsLoading(true);
    try {
      const data = await boostService.freeBoost(postId, 1);
      if (data.success) {
        toast.success("Post boosted for free (Annual Premium perk)!");
        if (onBoostSuccess) onBoostSuccess();
        onClose();
      } else {
        throw new Error(data.message || "Failed to boost post");
      }
    } catch (error) {
      console.error("Free boost error:", error);
      toast.error(error.message || "Failed to boost post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoost = async () => {
    if (!selectedLevel) return;

    // Annual premium + Basic level = free boost, skip payment entirely
    if (isAnnualPremium && selectedLevel === 1) {
      await handleFreeBoost();
      return;
    }

    // If payment form not shown, show it first
    if (!showPaymentForm) {
      setShowPaymentForm(true);
      return;
    }

    // Validate payment form
    if (!paymentData.msisdn || !paymentData.email || !paymentData.customerName) {
      toast.error("Please fill in all payment details");
      return;
    }

    // Validate phone number format (Rwandan format: 2507XXXXXXXX for MTN or 2503XXXXXXXX for Airtel)
    if (!/^250[37]\d{8}$/.test(paymentData.msisdn)) {
      toast.error("Phone number must be in format 2507XXXXXXXX (MTN) or 2503XXXXXXXX (Airtel)");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Initiate boost payment
      const data = await boostService.initiateBoostPayment(
        postId,
        selectedLevel,
        paymentData.msisdn,
        paymentData.email,
        paymentData.customerName,
        'momo' // MTN MoMo mobile money
      );

      if (data.success) {
        const refid = data.data.refid;
        localStorage.setItem("pendingBoostPaymentRefid", refid);
        localStorage.setItem("pendingBoostPostId", postId);

        // MTN MoMo: no checkout URL. Show "approve on phone" screen and poll.
        if (data.data.checkoutUrl) {
          // Backward-compatible: if a gateway ever returns a checkout URL, redirect.
          window.location.href = data.data.checkoutUrl;
        } else {
          setPendingRefid(refid);
          setWaitingScreen(true);
          startPollingPaymentStatus(refid);
        }
      } else {
        throw new Error(data.message || "Failed to initiate boost payment");
      }
    } catch (error) {
      console.error("Error initiating boost payment:", error);
      toast.error(error.message || "Failed to initiate boost payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll the backend for payment status (MTN MoMo flow).
  // The backend polls MTN and activates the boost on SUCCESS.
  const startPollingPaymentStatus = (refid) => {
    let attempts = 0;
    const maxAttempts = 40; // 40 * 3s = 2 minutes
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const result = await paymentService.checkPaymentStatus(refid);
        const status = result?.data?.status;

        if (status === "SUCCESS") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          toast.success("Payment successful! Your post is now boosted.");
          setTimeout(() => {
            if (onBoostSuccess) onBoostSuccess();
            onClose();
          }, 1200);
        } else if (status === "FAILED") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          toast.error("Nta mafaranga ahagije ufite, yashyireho wongere");
          setWaitingScreen(false);
        } else if (attempts >= maxAttempts) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          toast(
            "Payment is still pending. You can check the status on the boosted posts page.",
            { icon: "⏳" }
          );
          setTimeout(() => {
            if (onBoostSuccess) onBoostSuccess();
            onClose();
          }, 1500);
        }
      } catch (pollError) {
        console.error("Boost payment status poll error:", pollError);
        if (attempts >= maxAttempts && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 3000);
  };

  const formatRWF = (amount) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBoostIcon = (level) => {
    switch (level) {
      case 1:
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 2:
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 3:
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 4:
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 5:
        return <Sparkles className="h-5 w-5 text-pink-500" />;
      default:
        return <Zap className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBoostColor = (level) => {
    switch (level) {
      case 1:
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/20";
      case 2:
        return "border-green-200 bg-green-50 dark:bg-green-900/20";
      case 3:
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20";
      case 4:
        return "border-purple-200 bg-purple-50 dark:bg-purple-900/20";
      case 5:
        return "border-pink-200 bg-pink-50 dark:bg-pink-900/20";
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Boost Your Post
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reach more people and increase engagement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingOptions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : waitingScreen ? (
            <>
            {/* MTN MoMo waiting screen — user approves a USSD prompt on their phone */}
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Bell className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Check your phone
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  We sent a boost payment request to{" "}
                  <span className="font-mono">{paymentData.msisdn}</span>.
                  Approve it on your phone to boost your post.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for your approval...</span>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-left">
                <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    The payment prompt expires after a few minutes. If you don't see it,
                    dial <span className="font-mono">*182#</span> on your MTN phone.
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                  }
                  setWaitingScreen(false);
                  setPendingRefid(null);
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Cancel and go back
              </button>
            </div>
            </>
          ) : (
            <>
              {/* Boost Options */}
              <div className="space-y-4 mb-6">
                {boostOptions.map((option) => (
                  <div
                    key={option.level}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedLevel === option.level
                        ? `${getBoostColor(
                            option.level
                          )} border-opacity-100 scale-105`
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedLevel(option.level)}
                  >
                    {selectedLevel === option.level && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getBoostIcon(option.level)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {option.name}
                          </h3>
                          <div className="text-right">
                            {isAnnualPremium && option.level === 1 ? (
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                FREE
                              </div>
                            ) : (
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatRWF(option.price)}
                              </div>
                            )}
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {option.duration}h duration
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{option.multiplier}x reach</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{option.duration} hours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Boost Benefits */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  What you get with boosting:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Higher visibility in feeds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Increased engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority placement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Analytics insights</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              {showPaymentForm && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Payment Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number (MTN or Airtel)
                    </label>
                    <input
                      type="tel"
                      value={paymentData.msisdn}
                      onChange={(e) => setPaymentData({ ...paymentData, msisdn: e.target.value })}
                      placeholder="2507XXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Format: 2507XXXXXXXX (MTN) or 2503XXXXXXXX (Airtel)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData({ ...paymentData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.customerName}
                      onChange={(e) => setPaymentData({ ...paymentData, customerName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (showPaymentForm) {
                      setShowPaymentForm(false);
                    } else {
                      onClose();
                    }
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
                >
                  {showPaymentForm ? "Back" : "Cancel"}
                </button>
                <button
                  onClick={handleBoost}
                  disabled={isLoading || !selectedLevel}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>
                        {isAnnualPremium && selectedLevel === 1
                          ? "Boost Free (Premium)"
                          : showPaymentForm
                          ? "Pay & Boost"
                          : "Continue to Payment"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoostPostModal;
