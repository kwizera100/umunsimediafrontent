import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Phone, Mail, User, Bell, Loader2, AlertCircle, Download, FileText, Crown } from "lucide-react";
import toast from "react-hot-toast";
import { mediaHouseService } from "../services/mediaHouseService";
import { initiateTextArticlePurchase } from "../services/articleService";
import paymentService from "../services/paymentService";
import { useAuth } from "../contexts/AuthContext";

const BuyArticleModal = ({ isOpen, onClose, article, onPurchased, textArticle = false, defaultMode = "single" }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({ msisdn: "", email: "", customerName: "" });
  const [waitingScreen, setWaitingScreen] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [payMode, setPayMode] = useState(defaultMode); // 'single' | 'monthly'
  const pollRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setPaymentData({
        msisdn: user.telephone || "",
        email: user.email || "",
        customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "",
      });
      setPayMode(defaultMode);
      setWaitingScreen(false);
      setPurchased(false);
    }
    if (!isOpen && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOpen, user]);

  const formatRWF = (amount) =>
    new Intl.NumberFormat("rw-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(amount);

  const handleBuy = async () => {
    if (!paymentData.msisdn || !paymentData.email || !paymentData.customerName) {
      toast.error("Please fill in all payment details");
      return;
    }
    if (!/^250[37]\d{8}$/.test(paymentData.msisdn)) {
      toast.error("Phone number must be 2507XXXXXXXX (MTN) or 2503XXXXXXXX (Airtel)");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.email)) {
      toast.error("Please enter a valid email — the document will be sent there");
      return;
    }

    setIsLoading(true);
    try {
      let data;
      const writerId = textArticle ? (article.authorId || (article.author && article.author.id)) : article.writerId;
      if (payMode === "monthly") {
        data = await mediaHouseService.subscribeToWriter(writerId, { ...paymentData, articleId: article.id });
      } else if (textArticle) {
        data = await initiateTextArticlePurchase(article.id, paymentData);
      } else {
        data = await mediaHouseService.initiateArticlePurchase(article.id, paymentData);
      }
      if (data.success) {
        setWaitingScreen(true);
        startPolling(data.data.refid);
      } else {
        throw new Error(data.message || "Failed to initiate purchase");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to initiate purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (refid) => {
    let attempts = 0;
    const maxAttempts = 40;
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const result = await paymentService.checkPaymentStatus(refid);
        const status = result?.data?.status;

        if (status === "SUCCESS") {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          setWaitingScreen(false);
          setPurchased(true);
          toast.success(textArticle ? "Subscribed! This article is now unlocked." : "Payment successful! Check your email for the document.");
          if (onPurchased) onPurchased();
        } else if (status === "FAILED") {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          toast.error("Nta mafaranga ahagije ufite, yashyireho wongere");
          setWaitingScreen(false);
        } else if (attempts >= maxAttempts) {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          toast("Payment is still pending — check My Purchases later.", { icon: "⏳" });
          onClose();
        }
      } catch (e) {
        if (attempts >= maxAttempts && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 3000);
  };

  const handleDownload = async () => {
    if (textArticle) {
      // Text article is now unlocked — close and reload the article page
      if (onPurchased) onPurchased();
      onClose();
      return;
    }
    try {
      const res = await mediaHouseService.getUserDownloadUrl(article.id);
      if (res.success && res.data?.url) window.open(res.data.url, "_blank");
    } catch (e) {
      toast.error("Download not ready yet — check your email");
    }
  };

  if (!isOpen || !article) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Buy Article</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{article.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {purchased ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{textArticle ? "You're subscribed!" : "Purchase complete!"}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {textArticle
                    ? "This article is unlocked — read it now. The link was also emailed to " 
                    : "The document was emailed to "}
                  <span className="font-mono">{paymentData.email}</span>
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {textArticle ? (
                  <><FileText className="h-4 w-4" /> Read Article</>
                ) : (
                  <><Download className="h-4 w-4" /> Download Now</>
                )}
              </button>
            </div>
          ) : waitingScreen ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Check your phone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We sent a payment request to <span className="font-mono">{paymentData.msisdn}</span>. Approve it to buy this article.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for your approval...</span>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-left">
                <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>The prompt expires in a few minutes. If you don't see it, dial <span className="font-mono">*182#</span>.</span>
                </p>
              </div>
              <button
                onClick={() => {
                  if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
                  setWaitingScreen(false);
                }}
                className="text-sm text-gray-500 underline"
              >
                Cancel and go back
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pay mode: single article OR monthly subscription — respects pricingMode */}
              {(() => {
                // Text articles are monthly-subscription only
                const singleOk = !textArticle && article.singleAllowed !== false;
                const monthlyOk = textArticle ? true : article.monthlyAllowed !== false;
                const cols = singleOk && monthlyOk ? 'grid-cols-2' : 'grid-cols-1';
                return (
                  <div className={`grid ${cols} gap-2`}>
                    {singleOk && (
                      <button
                        onClick={() => setPayMode("single")}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          payMode === "single"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <FileText className={`h-4 w-4 mb-1 ${payMode === "single" ? "text-green-600" : "text-gray-400"}`} />
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">This article</div>
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">{formatRWF(article.price)}</div>
                      </button>
                    )}
                    {monthlyOk && (
                      <button
                        onClick={() => setPayMode("monthly")}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          payMode === "monthly"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <Crown className={`h-4 w-4 mb-1 ${payMode === "monthly" ? "text-purple-600" : "text-gray-400"}`} />
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">Writer monthly</div>
                        <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {formatRWF(((textArticle ? article.author : article.writer) && (textArticle ? article.author : article.writer).monthlyPrice) || 1000)}/mo
                        </div>
                      </button>
                    )}
                  </div>
                );
              })()}
              {payMode === "monthly" && (
                <p className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                  Monthly subscription — unlocks all paid articles from this writer + email when they publish new ones.
                </p>
              )}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {payMode === "monthly" ? "Monthly price" : "Price"}
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatRWF(payMode === "monthly" ? (((textArticle ? article.author : article.writer) && (textArticle ? article.author : article.writer).monthlyPrice) || 1000) : article.price)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={paymentData.msisdn}
                  onChange={(e) => setPaymentData({ ...paymentData, msisdn: e.target.value })}
                  placeholder="2507XXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" /> Email (document will be sent here)
                </label>
                <input
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => setPaymentData({ ...paymentData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="inline h-4 w-4 mr-1" /> Full Name
                </label>
                <input
                  type="text"
                  value={paymentData.customerName}
                  onChange={(e) => setPaymentData({ ...paymentData, customerName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleBuy}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Processing...</>
                ) : (
                  <>Pay {formatRWF(payMode === "monthly" ? (((textArticle ? article.author : article.writer) && (textArticle ? article.author : article.writer).monthlyPrice) || 1000) : article.price)}{payMode === "monthly" ? "/mo" : ""}</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BuyArticleModal;
