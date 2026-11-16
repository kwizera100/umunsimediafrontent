import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Crown,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import MobileNav from "../components/MobileNav";
import toast from "react-hot-toast";
import paymentService from "../services/paymentService";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState("checking"); // checking, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Get refid from localStorage (set during payment initiation) or URL params
      const refid = localStorage.getItem("pendingPaymentRefid") || searchParams.get("refid");

      if (!refid) {
        setPaymentStatus("failed");
        setIsLoading(false);
        toast.error("Payment reference not found");
        return;
      }

      // Check payment status
      const result = await paymentService.checkPaymentStatus(refid);

      if (result.success && result.data) {
        setPaymentData(result.data);

        if (result.data.status === "SUCCESS") {
          setPaymentStatus("success");
          
          // Clear pending payment refid
          localStorage.removeItem("pendingPaymentRefid");

          // Refresh user data to get updated premium status
          try {
            await refreshUser();
            toast.success("Payment successful! Your premium subscription is now active.");
          } catch (error) {
            console.error("Failed to refresh user profile:", error);
            // Still show success, user data will refresh on next page load
            toast.success("Payment successful! Your premium subscription is now active.");
          }
        } else if (result.data.status === "FAILED") {
          setPaymentStatus("failed");
          toast.error("Payment failed. Please try again.");
        } else {
          // Still pending, poll again
          setTimeout(() => {
            checkPaymentStatus();
          }, 3000);
          return;
        }
      } else {
        setPaymentStatus("failed");
        toast.error("Unable to verify payment status");
      }
    } catch (error) {
      console.error("Payment status check error:", error);
      setPaymentStatus("failed");
      toast.error("Error checking payment status");
    } finally {
      setIsLoading(false);
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
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              {isLoading || paymentStatus === "checking" ? (
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Verifying Payment...
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we confirm your payment
                  </p>
                </div>
              ) : paymentStatus === "success" ? (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Payment Successful!
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Your premium subscription is now active
                    </p>
                  </div>

                  {paymentData && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6 text-left">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Reference ID:
                          </span>
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {paymentData.refid}
                          </span>
                        </div>
                        {paymentData.tid && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Transaction ID:
                            </span>
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {paymentData.tid}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Amount:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat("rw-RW", {
                              style: "currency",
                              currency: "RWF",
                              minimumFractionDigits: 0,
                            }).format(paymentData.amount)}
                          </span>
                        </div>
                        {paymentData.subscription && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Plan:
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {paymentData.plan}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Valid Until:
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {new Date(
                                  paymentData.subscription.endDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Crown className="h-5 w-5" />
                      <span className="font-medium">Premium Active</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Go to Home
                    </Link>
                    <Link
                      to="/profile"
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Payment Failed
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Your payment could not be processed
                    </p>
                  </div>

                  {paymentData && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6 text-left">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Reference ID:
                          </span>
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {paymentData.refid}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Status:
                          </span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            {paymentData.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/subscription"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Try Again
                    </Link>
                    <Link
                      to="/"
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                    >
                      Go to Home
                    </Link>
                  </div>
                </div>
              )}
            </div>
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

export default PaymentSuccess;

