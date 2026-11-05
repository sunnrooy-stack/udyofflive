"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import AuthVerificationModal from "@/components/AuthVerificationModal";
import { Trash2, ShieldCheck, Lock, CreditCard, ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com").replace(/\/$/, "");

export default function CheckoutPage() {
  const { items, removeItem, totalAmount, clearCart } = useCartStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [gatewayName, setGatewayName] = useState<string>("Razorpay Option 2 (Live Gateway)");
  const [gatewayMode, setGatewayMode] = useState<string>("Live Payments");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("verified_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch (e) {}

    // Check active Razorpay gateway from backend
    const checkGateway = async () => {
      const endpoints = [
        `${API_BASE}/api/payment-settings`,
        "https://udyofflive1111111111.onrender.com/api/payment-settings",
        "https://digital-product-1-l3qr.onrender.com/api/payment-settings",
        "http://localhost:5000/api/payment-settings",
      ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep).catch(() => null);
          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data && data.success) {
              if (data.activeAccount === "1") {
                setGatewayName("Razorpay Option 1 (Test / Sandbox)");
                setGatewayMode("Test Sandbox Mode");
              } else {
                setGatewayName("Razorpay Option 2 (Live Gateway)");
                setGatewayMode("Live Real Payments");
              }
              break;
            }
          }
        } catch (e) {}
      }
    };
    checkGateway();
  }, []);

  const checkUserVerified = () => {
    try {
      const stored = localStorage.getItem("verified_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isVerified) return true;
      }
    } catch (e) {}
    return false;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!checkUserVerified()) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!email) {
      alert("Please enter your email address to proceed with the checkout!");
      return;
    }

    setLoading(true);

    // Free Product Instant Checkout (0 Price)
    if (totalAmount() <= 0) {
      const freePaymentId = `FREE_ORDER_${Date.now()}`;
      let downloadToken = "";
      try {
        let res = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: freePaymentId,
            customer: email.split("@")[0] || "Guest",
            email: email,
            amount: "₹0.00",
            product: items.length === 1 ? items[0].title : `${items.length} Products`,
            items: items,
            status: "Completed",
          }),
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: freePaymentId,
              customer: email.split("@")[0] || "Guest",
              email: email,
              amount: "₹0.00",
              product: items.length === 1 ? items[0].title : `${items.length} Products`,
              items: items,
              status: "Completed",
            }),
          }).catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json();
          downloadToken = data?.downloadToken || "";
        }
      } catch (e) {
        console.error("Failed to save free order to db", e);
      }

      if (downloadToken) {
        localStorage.setItem("download_token", downloadToken);
      }

      localStorage.setItem(
        "recent_purchase",
        JSON.stringify({
          payment_id: freePaymentId,
          token: downloadToken,
          items: items,
        })
      );

      clearCart();
      window.location.href = `/success?payment_id=${freePaymentId}${
        downloadToken ? `&token=${encodeURIComponent(downloadToken)}` : ""
      }`;
      return;
    }

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      let orderData: any = null;
      let workingBaseUrl = "";
      const checkoutPayload = { items: items, email: email, amount: totalAmount() };

      // 1. Try available backend endpoints sequentially
      const endpoints = [
        `${API_BASE}/api/create-order`,
        "https://udyofflive1111111111.onrender.com/api/create-order",
        "https://digital-product-1-l3qr.onrender.com/api/create-order",
        "http://localhost:5000/api/create-order",
      ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(checkoutPayload),
          }).catch(() => null);

          if (res && res.ok) {
            orderData = await res.json().catch(() => null);
            if (orderData && (orderData.orderId || orderData.isFree)) {
              workingBaseUrl = ep.replace("/api/create-order", "");
              break;
            }
          }
        } catch (e) {}
      }

      if (!orderData || (!orderData.orderId && !orderData.isFree)) {
        alert(`Order Creation Error: ${orderData?.error || "Could not reach payment server. Please try again."}`);
        setLoading(false);
        return;
      }

      const orderId = orderData.orderId;
      const razorpayKey =
        orderData?.key ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_TvF0iIwMv1MxWV";

      // Handle Test Mode ONLY if explicit demo requested with no key
      if (orderData.isDemo && (!razorpayKey || razorpayKey.includes("dummy"))) {
        const testPaymentId = `TEST_PAY_${Date.now()}`;
        const verifyPayload = {
          razorpay_order_id: orderId,
          razorpay_payment_id: testPaymentId,
          razorpay_signature: "test_signature",
          items: items,
          email: email,
          customer: email.split("@")[0] || "Guest",
        };

        const verifyEndpoints = [
          `${workingBaseUrl || API_BASE}/api/verify-payment`,
          "https://udyofflive1111111111.onrender.com/api/verify-payment",
          "https://digital-product-1-l3qr.onrender.com/api/verify-payment",
          "http://localhost:5000/api/verify-payment",
        ];

        let verifyData: any = null;
        for (const vep of verifyEndpoints) {
          try {
            const vRes = await fetch(vep, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload),
            }).catch(() => null);
            if (vRes && vRes.ok) {
              verifyData = await vRes.json().catch(() => null);
              if (verifyData && verifyData.success) break;
            }
          } catch (e) {}
        }

        if (verifyData && verifyData.success) {
          const downloadToken = verifyData.downloadToken || "";
          if (downloadToken) {
            localStorage.setItem("download_token", downloadToken);
          }
          localStorage.setItem(
            "recent_purchase",
            JSON.stringify({
              payment_id: testPaymentId,
              token: downloadToken,
              items: items,
            })
          );
          clearCart();
          window.location.href = `/success?payment_id=${testPaymentId}${
            downloadToken ? `&token=${encodeURIComponent(downloadToken)}` : ""
          }`;
          return;
        }
      }

      const options: any = {
        key: razorpayKey,
        amount: Math.round(totalAmount() * 100), // Amount in paise
        currency: "INR",
        name: "GEONIXEDITZ",
        description: items.length === 1 ? items[0].title : `${items.length} Digital Products`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const liveVerifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: items,
              email: email,
              customer: email.split("@")[0] || "Guest",
            };

            const verifyEndpoints = [
              `${workingBaseUrl || API_BASE}/api/verify-payment`,
              "https://udyofflive1111111111.onrender.com/api/verify-payment",
              "https://digital-product-1-l3qr.onrender.com/api/verify-payment",
              "http://localhost:5000/api/verify-payment",
            ];

            let verifyData: any = null;
            for (const vep of verifyEndpoints) {
              try {
                const vRes = await fetch(vep, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(liveVerifyPayload),
                }).catch(() => null);
                if (vRes && vRes.ok) {
                  verifyData = await vRes.json().catch(() => null);
                  if (verifyData && verifyData.success) break;
                }
              } catch (e) {}
            }

            if (verifyData && verifyData.success) {
              const downloadToken = verifyData.downloadToken || "";
              if (downloadToken) {
                localStorage.setItem("download_token", downloadToken);
              }
              localStorage.setItem(
                "recent_purchase",
                JSON.stringify({
                  payment_id: response.razorpay_payment_id,
                  token: downloadToken,
                  items: items,
                })
              );

              clearCart();
              window.location.href = `/success?payment_id=${response.razorpay_payment_id}${
                downloadToken ? `&token=${encodeURIComponent(downloadToken)}` : ""
              }`;
            } else {
              alert("Payment verification failed! Please contact support.");
              setLoading(false);
            }
          } catch (err) {
            console.error("Verification error", err);
            alert("Payment verification encountered an error. Please check your dashboard.");
            setLoading(false);
          }
        },
        prefill: {
          email: email,
        },
        theme: {
          color: "#0284c7",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (orderId) {
        options.order_id = orderId;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay trigger error:", err);
      alert(err.message || "Could not load Razorpay payment modal. Verify your key config.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-12">
            <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
              <ShoppingBag className="w-10 h-10 stroke-[1.8]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-sm text-slate-500 mb-6">
              Looks like you haven&apos;t added any creator assets to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-md cursor-pointer"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Contact Info & Payment Method */}
            <div className="lg:col-span-7 space-y-6">
              {/* Contact Information Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <span>Contact Information</span>
                  </h2>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder="Enter your email to receive download link"
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your instant download links and invoice will be sent here securely.</span>
                  </p>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <span>Payment Method</span>
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Instant Delivery
                  </span>
                </div>

                <div className="border-2 border-sky-500 bg-sky-50/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-5 h-5 rounded-full border-2 border-sky-600 flex items-center justify-center bg-white shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-slate-900">
                          {gatewayName}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {gatewayMode}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">
                        UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking
                      </span>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[11px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 sticky top-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Order Summary</span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </h2>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-3.5 mb-6 max-h-[360px] overflow-y-auto pr-1">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🎨</span>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-400">
                          by {item.sellerName || "Admin"}
                        </p>
                        <p className="font-black text-sm text-slate-900 mt-0.5">
                          ₹{Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Product Button (Visible & Styled) */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.title}`}
                        title="Remove product"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pricing Calculation */}
                <div className="space-y-2.5 pt-4 border-t border-slate-200 text-sm">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-bold">₹{totalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Platform & Tax</span>
                    <span className="text-emerald-600 font-bold">₹0.00 (Free)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 mt-2">
                    <span className="text-base font-black text-slate-900">Total Due</span>
                    <span className="text-2xl font-black text-sky-600">
                      ₹{totalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-4 text-base font-black shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? "Processing Payment..." : `Pay ₹${totalAmount().toFixed(2)} Now`}</span>
                </button>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant access granted immediately upon payment</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerifiedSuccess={(userData) => {
          setIsAuthModalOpen(false);
          setEmail(userData.email);
        }}
        actionTitle="completing your purchase"
      />
    </div>
  );
}
