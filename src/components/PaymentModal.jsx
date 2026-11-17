import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Smartphone,
  CreditCard,
  Wallet,
  Phone,
  Mail,
  User,
  CheckCircle,
  Loader2,
  Bell,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import paymentService from "../services/paymentService";

const PaymentModal = ({ isOpen, onClose, plan, planPrice, user }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("momo");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    msisdn: "",
    email: "",
    customerName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    spennAccount: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  // MTN MoMo flow state: after initiating, we show a "check your phone" screen
  // and poll the backend for the payment status (no checkout URL redirect).
  const [paymentScreen, setPaymentScreen] = useState("form"); // 'form' | 'waiting'
  const [pendingRefid, setPendingRefid] = useState(null);
  const pollRef = useRef(null);

  // Clean up polling when modal closes
  useEffect(() => {
    if (!isOpen && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (isOpen) {
      setPaymentScreen("form");
      setPendingRefid(null);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOpen]);

  // Payment methods supported by K-Pay
  // Note: K-Pay requires msisdn (phone number) for ALL payment methods
  const paymentMethods = [
    {
      id: "momo",
      name: "Mobile Money",
      description: "MTN or Airtel Mobile Money",
      icon: Smartphone,
      color: "bg-green-500",
      requiresPhone: true,
    },
    {
      id: "cc",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, or American Express",
      icon: CreditCard,
      color: "bg-blue-500",
      requiresCard: true,
      requiresPhone: true, // K-Pay requires phone number for all methods
    },
    {
      id: "spenn",
      name: "SPENN Wallet",
      description: "Pay with your SPENN account",
      icon: Wallet,
      color: "bg-purple-500",
      requiresAccount: true,
      requiresPhone: true, // K-Pay requires phone number for all methods
    },
  ];

  // Initialize form with user data
  useEffect(() => {
    if (user && isOpen) {
      setPaymentFormData({
        msisdn: user.telephone || "",
        email: user.email || "",
        customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "",
        cardNumber: "",
        cardExpiry: "",
        cardCVV: "",
        spennAccount: "",
      });
    }
  }, [user, isOpen]);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const errors = {};
    const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod);

    // Validate phone number - K-Pay requires msisdn for ALL payment methods
    // Format: 2507XXXXXXXX (MTN MoMo only)
    if (!paymentFormData.msisdn) {
      errors.msisdn = "Phone number is required for all payment methods";
    } else if (!/^2507\d{8}$/.test(paymentFormData.msisdn)) {
      errors.msisdn = "Mobile Money payments require an MTN number (2507XXXXXXXX). Airtel numbers are not supported.";
    }

    // Validate card details (only for Credit Card) - Optional, K-Pay will collect on checkout
    if (selectedMethod?.requiresCard) {
      // Card details are optional - K-Pay will collect them on their secure checkout page
      // But if provided, validate format
      if (paymentFormData.cardNumber && paymentFormData.cardNumber.replace(/\s/g, "").length < 13) {
        errors.cardNumber = "Card number must be at least 13 digits";
      }

      if (paymentFormData.cardExpiry && !/^\d{2}\/\d{2}$/.test(paymentFormData.cardExpiry)) {
        errors.cardExpiry = "Format: MM/YY";
      }

      if (paymentFormData.cardCVV && paymentFormData.cardCVV.length < 3) {
        errors.cardCVV = "CVV must be at least 3 digits";
      }
    }

    // Validate SPENN account (only for SPENN) - Optional, K-Pay will collect on checkout
    if (selectedMethod?.requiresAccount) {
      // SPENN account is optional - K-Pay will collect it on their secure checkout page
      // No validation needed
    }

    // Validate email
    if (!paymentFormData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentFormData.email)) {
      errors.email = "Invalid email format";
    }

    // Validate customer name
    if (!paymentFormData.customerName) {
      errors.customerName = "Name is required";
    } else if (paymentFormData.customerName.length < 2) {
      errors.customerName = "Name must be at least 2 characters";
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      const response = await paymentService.initiatePayment({
        plan: plan,
        msisdn: paymentFormData.msisdn,
        email: paymentFormData.email,
        customerName: paymentFormData.customerName,
        userId: user.id,
        paymentMethod: selectedPaymentMethod,
      });

      if (response.success) {
        const refid = response.data.refid;
        localStorage.setItem("pendingPaymentRefid", refid);

        // MTN MoMo: no checkout URL. Show the "approve on phone" screen and poll.
        if (response.data.checkoutUrl) {
          // Backward-compatible: if a gateway ever returns a checkout URL, redirect.
          window.location.href = response.data.checkoutUrl;
        } else {
          setPendingRefid(refid);
          setPaymentScreen("waiting");
          startPollingPaymentStatus(refid);
        }
      } else {
        throw new Error(response.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll the backend for payment status (MTN MoMo flow).
  // The backend polls MTN and activates the subscription on SUCCESS.
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
          toast.success("Payment successful! Your premium subscription is now active.");
          // Brief delay so the user sees the success state, then close + redirect
          setTimeout(() => {
            window.location.href = "/payment/success?refid=" + refid;
          }, 1200);
        } else if (status === "FAILED") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          toast.error("Nta mafaranga ahagije ufite, yashyireho wongere");
          setPaymentScreen("form");
        } else if (attempts >= maxAttempts) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          toast(
            "Payment is still pending. You can check the status on the subscription page.",
            { icon: "⏳" }
          );
          setTimeout(() => {
            window.location.href = "/payment/success?refid=" + refid;
          }, 1500);
        }
      } catch (pollError) {
        console.error("Payment status poll error:", pollError);
        // Keep polling on transient errors unless max attempts reached
        if (attempts >= maxAttempts && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 3000);
  };

  if (!isOpen) return null;

  const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod);
  const formatRWF = (amount) => {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Complete Payment
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {plan === "monthly" ? "Monthly" : "Annual"} Plan - {formatRWF(planPrice)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {paymentScreen === "waiting" ? (
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
                  We sent a payment request of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatRWF(planPrice)}
                  </span>{" "}
                  to <span className="font-mono">{paymentFormData.msisdn}</span>.
                  Approve it on your phone to complete the payment.
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
                    dial <span className="font-mono">*182#</span> on your MTN phone and
                    select "Approve" or check pending approvals.
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                  }
                  setPaymentScreen("form");
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
          {/* Payment Method Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Payment Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center text-white flex-shrink-0`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                          {method.name}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {method.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Information
            </h3>

            {/* Phone Number - Required for ALL payment methods (K-Pay requirement) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Required for all payment methods)</span>
              </label>
                <input
                  type="tel"
                  value={paymentFormData.msisdn}
                  onChange={(e) => {
                    setPaymentFormData({ ...paymentFormData, msisdn: e.target.value });
                    setPaymentErrors({ ...paymentErrors, msisdn: "" });
                  }}
                  placeholder="250788123456"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    paymentErrors.msisdn
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {paymentErrors.msisdn && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {paymentErrors.msisdn}
                  </p>
                )}
            </div>

            {/* Card Details - Credit Card */}
            {selectedMethod?.requiresCard && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Card details will be collected securely on K-Pay's checkout page. You can optionally pre-fill them here.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-2" />
                    Card Number <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setPaymentFormData({ ...paymentFormData, cardNumber: formatted });
                      setPaymentErrors({ ...paymentErrors, cardNumber: "" });
                    }}
                    placeholder="4111 1111 1111 1111"
                    maxLength={19}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      paymentErrors.cardNumber
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {paymentErrors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {paymentErrors.cardNumber}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Test: Visa 4111 1111 1111 1111 | Mastercard 5555 4444 3333 1111
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry Date (MM/YY) <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={paymentFormData.cardExpiry}
                      onChange={(e) => {
                        const formatted = formatExpiry(e.target.value);
                        setPaymentFormData({ ...paymentFormData, cardExpiry: formatted });
                        setPaymentErrors({ ...paymentErrors, cardExpiry: "" });
                      }}
                      placeholder="12/25"
                      maxLength={5}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        paymentErrors.cardExpiry
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {paymentErrors.cardExpiry && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {paymentErrors.cardExpiry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVV <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={paymentFormData.cardCVV}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setPaymentFormData({ ...paymentFormData, cardCVV: value });
                        setPaymentErrors({ ...paymentErrors, cardCVV: "" });
                      }}
                      placeholder="123"
                      maxLength={4}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        paymentErrors.cardCVV
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {paymentErrors.cardCVV && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {paymentErrors.cardCVV}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SPENN Account */}
            {selectedMethod?.requiresAccount && (
              <div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> SPENN account details will be collected securely on K-Pay's checkout page. You can optionally pre-fill them here.
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Wallet className="inline h-4 w-4 mr-2" />
                  SPENN Account Number <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={paymentFormData.spennAccount}
                  onChange={(e) => {
                    setPaymentFormData({ ...paymentFormData, spennAccount: e.target.value });
                    setPaymentErrors({ ...paymentErrors, spennAccount: "" });
                  }}
                  placeholder="Enter your SPENN account number"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    paymentErrors.spennAccount
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {paymentErrors.spennAccount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {paymentErrors.spennAccount}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={paymentFormData.email}
                onChange={(e) => {
                  setPaymentFormData({ ...paymentFormData, email: e.target.value });
                  setPaymentErrors({ ...paymentErrors, email: "" });
                }}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-lg border ${
                  paymentErrors.email
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {paymentErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {paymentErrors.email}
                </p>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={paymentFormData.customerName}
                onChange={(e) => {
                  setPaymentFormData({ ...paymentFormData, customerName: e.target.value });
                  setPaymentErrors({ ...paymentErrors, customerName: "" });
                }}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-lg border ${
                  paymentErrors.customerName
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {paymentErrors.customerName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {paymentErrors.customerName}
                </p>
              )}
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>
                  Pay {formatRWF(planPrice)} with {selectedMethod?.name}
                </span>
              </>
            )}
          </button>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

