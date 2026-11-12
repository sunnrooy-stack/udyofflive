"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import AuthVerificationModal from "@/components/AuthVerificationModal";
import { Trash2, ShieldCheck, Lock, CreditCard, ShoppingBag, ArrowLeft, CheckCircle2, MapPin, Zap } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com").replace(/\/$/, "");

export default function CheckoutPage() {
  const { items, removeItem, totalAmount, clearCart } = useCartStore();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [gatewayName, setGatewayName] = useState<string>("Razorpay Live Gateway");
  const [gatewayMode, setGatewayMode] = useState<string>("Live Payments");

  const subtotal = totalAmount();
  const discountAmount = Math.round(subtotal * promoDiscount);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoDiscount(0);
      setPromoMessage("Enter a promo code first.");
      return;
    }
    if (code === "SAVE10" || code === "WELCOME10") {
      setPromoDiscount(0.1);
      setPromoMessage("10% discount applied!");
    } else if (code === "CREATOR15") {
      setPromoDiscount(0.15);
      setPromoMessage("15% creator discount applied!");
    } else if (code === "VIP20") {
      setPromoDiscount(0.2);
      setPromoMessage("20% VIP discount applied!");
    } else {
      setPromoDiscount(0);
      setPromoMessage("Invalid promo code. Try SAVE10 or VIP20.");
    }
  };

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
              setGatewayName(data.account1?.name || "Razorpay Live Gateway");
              setGatewayMode("Live Real Payments");
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
        "rzp_live_T3nxTH4mjFTNK8";

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
    <div className="bg-[#090514] text-white min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Violet / Cyan Glow */}
      <div className="pointer-events-none absolute -top-36 left-1/4 w-[520px] h-[520px] rounded-full bg-purple-700/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[460px] h-[460px] rounded-full bg-cyan-500/10 blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Header */}
        <div className="mb-8 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to cart</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Secure{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                checkout
              </span>
            </h1>

            {/* 3-Step Indicator */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-400/50 text-purple-200 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                01 Info
              </span>
              <span className="text-slate-600">&rsaquo;</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-slate-400">
                02 Payment
              </span>
              <span className="text-slate-600">&rsaquo;</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-slate-400">
                03 Complete
              </span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#130D24]/85 backdrop-blur-xl border border-purple-500/25 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl my-12">
            <div className="w-20 h-20 bg-purple-500/15 border border-purple-400/30 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 stroke-[1.8]" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Your cart is empty</h2>
            <p className="text-sm text-slate-400 mb-6">
              Looks like you haven&apos;t added any CC packs or presets to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 text-white font-black text-sm rounded-xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] cursor-pointer"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Left Column: Billing Address & Payment Method */}
            <div className="lg:col-span-7 space-y-6">
              {/* Billing Address Glass Card */}
              <div className="bg-[#130D24]/85 backdrop-blur-xl border border-purple-500/25 rounded-2xl p-6 sm:p-7 shadow-[0_12px_45px_rgba(0,0,0,0.45)] space-y-5">
                <div className="flex items-start justify-between border-b border-purple-500/15 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white">Billing Address</h2>
                      <p className="text-xs text-slate-400">Enter your details for instant digital delivery</p>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-purple-400/70 shrink-0" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full bg-[#1C1433]/80 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter surname"
                      className="w-full bg-[#1C1433]/80 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Email Address <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#1C1433]/80 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street details"
                    className="w-full bg-[#1C1433]/80 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Location"
                      className="w-full bg-[#1C1433]/80 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Pin Code
                    </label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="Code"
                      className="w-full bg-[#1C1433]/80 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Glass Card */}
              <div className="bg-[#130D24]/85 backdrop-blur-xl border border-purple-500/25 rounded-2xl p-6 sm:p-7 shadow-[0_12px_45px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>Payment Method</span>
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    Instant Delivery
                  </span>
                </div>

                <div className="border border-purple-400/40 bg-[#1B1233]/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-[#090514] shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-white">
                          {gatewayName}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                          {gatewayMode}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-1">
                        UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking
                      </span>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-wider text-purple-200 bg-purple-500/20 border border-purple-400/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Final Summary / Order Details */}
            <div className="lg:col-span-5 sticky top-8">
              <div className="bg-[#130D24]/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Final Summary
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">Order Details</h2>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 p-3 rounded-xl bg-[#1B1331]/80 border border-purple-500/20 hover:border-purple-400/40 transition-all"
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#090514] border border-purple-500/25 overflow-hidden shrink-0 flex items-center justify-center">
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

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                          {item.sellerName || "Digital Asset"}
                        </span>
                        <h4 className="font-extrabold text-sm text-white truncate">
                          {item.title}
                        </h4>
                        <p className="font-black text-sm text-cyan-300 mt-0.5">
                          ₹{Number(item.price).toFixed(0)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.title}`}
                        title="Remove product"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="PROMO CODE"
                      className="flex-1 bg-[#1C1433]/80 border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2.5 rounded-xl bg-[#0B0718] hover:bg-purple-900/40 border border-purple-500/30 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-[11px] font-semibold ${promoDiscount > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2.5 pt-3 border-t border-purple-500/20 text-sm">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">₹{subtotal.toFixed(0)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Discount</span>
                      <span className="font-bold">-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Platform Fee</span>
                    <span className="text-emerald-400 font-black uppercase text-xs tracking-wider">FREE</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-purple-500/20">
                    <span className="text-sm font-bold text-slate-300">Total</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">
                        ₹{finalTotal.toFixed(0)}
                      </span>
                      <span className="text-xs font-bold text-purple-300">INR</span>
                    </div>
                  </div>
                </div>

                {/* BUY NOW Gradient Button */}
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 hover:brightness-110 text-white py-4 text-sm font-black uppercase tracking-wider shadow-[0_0_30px_rgba(139,92,246,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  <span>{loading ? "Processing Payment..." : "BUY NOW"}</span>
                  <Zap className="w-4 h-4 fill-white" />
                </button>

                <div className="rounded-xl bg-[#0D081B] border border-purple-500/20 py-2.5 px-4 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-200">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Secure Checkout Active</span>
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
