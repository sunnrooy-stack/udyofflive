"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  Landmark,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { getApiBase } from "@/lib/exploreApi";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Singapore",
  "Germany",
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI (GPay, PhonePe, Paytm)", icon: Smartphone },
  { id: "card", label: "Debit / Credit Cards", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallets & Other Methods", icon: Wallet },
];

export default function ExploreCheckoutPage() {
  const { items, removeItem, clearCart, totalAmount } = useCartStore();

  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [country, setCountry] = useState("India");
  const [billingNote, setBillingNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");

  const [formError, setFormError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(2);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("user_email");
      if (storedEmail) setEmail(storedEmail);

      if (!document.getElementById("razorpay-sdk-script")) {
        const script = document.createElement("script");
        script.id = "razorpay-sdk-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  const subtotal = totalAmount();
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    setPromoError("");
    setPromoMessage("");

    if (!code) {
      setPromoError("Enter a promo code first.");
      return;
    }

    // Try backend coupon validation if endpoint exists, otherwise validate curated studio codes
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: subtotal }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.discountPercent) {
          setDiscountPercent(Number(data.discountPercent));
          setPromoMessage(`Code ${code} applied (${data.discountPercent}% OFF)`);
          return;
        }
      }
    } catch (err) {}

    if (code === "SHELF10" || code === "CREATOR10" || code === "WELCOME10") {
      setDiscountPercent(10);
      setPromoMessage(`Code ${code} applied (10% OFF)`);
    } else if (code === "VIP20") {
      setDiscountPercent(20);
      setPromoMessage(`Code ${code} applied (20% OFF)`);
    } else {
      setDiscountPercent(0);
      setPromoError("Invalid or expired promo code. Try SHELF10.");
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (items.length === 0) {
      setFormError("Your shelf cart is empty. Add a product first.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address for your download link.");
      return;
    }
    if (!customerName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    setStep(3);
    setIsProcessing(true);

    try {
      const apiBase = getApiBase();
      const payload = {
        items,
        email: email.trim(),
        customerName: customerName.trim(),
        country,
        billingNote: billingNote.trim(),
        paymentMethod,
        promoCode: discountPercent > 0 ? promoCode.trim().toUpperCase() : undefined,
        amount: finalTotal,
      };

      let res: Response;
      try {
        res = await fetch(`${apiBase}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to initialize checkout order.");
      }

      const orderData = await res.json();
      const orderId = orderData.orderId || orderData.id;
      const razorpayKey =
        orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      const verifyAndRedirect = async (
        rzpOrderId: string,
        rzpPaymentId: string,
        rzpSignature: string
      ) => {
        const verifyRes = await fetch(`${apiBase}/api/orders/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPaymentId,
            razorpay_signature: rzpSignature,
            orderId,
            items,
            email: email.trim(),
            customerName: customerName.trim(),
            amount: orderData.amount ? orderData.amount / 100 : finalTotal,
          }),
        });
        const verifyData = await verifyRes.json().catch(() => ({}));
        clearCart();
        const tokenParam = verifyData.downloadToken
          ? `&token=${encodeURIComponent(verifyData.downloadToken)}`
          : "";
        window.location.href = `/success?payment_id=${encodeURIComponent(
          rzpPaymentId
        )}${tokenParam}`;
      };

      // Demo / Test mode fallback when Razorpay key is absent or dummy
      if (orderData.isDemo || !razorpayKey || razorpayKey.includes("dummy")) {
        const testPayId = `pay_shelf_${Date.now()}`;
        await verifyAndRedirect(orderId, testPayId, "verified_demo_signature");
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay payment gateway is still loading. Please try again.");
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount || finalTotal * 100,
        currency: orderData.currency || "INR",
        name: "Atelier Shelf Digital Store",
        description: `${items.length} Digital Product(s)`,
        order_id: orderId,
        prefill: {
          name: customerName.trim(),
          email: email.trim(),
        },
        theme: { color: "#FF642D" },
        handler: async (response: any) => {
          try {
            await verifyAndRedirect(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          } catch (err: any) {
            setFormError(err.message || "Payment verification failed.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStep(2);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setFormError(resp?.error?.description || "Payment failed. Please retry.");
        setIsProcessing(false);
        setStep(2);
      });
      rzp.open();
    } catch (err: any) {
      setFormError(err.message || "Unable to process checkout.");
      setIsProcessing(false);
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EADB] text-[#17110E] font-sans selection:bg-[#FF642D] selection:text-white pb-20">
      {/* Top Bar */}
      <header className="border-b border-[#D9C9B5] bg-[#F3EADB]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#17110E] hover:text-[#FF642D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shelf</span>
          </Link>
          <span className="text-sm font-black tracking-tight text-[#211510]">
            ATELIER <span className="text-[#FF642D]">SHELF</span>
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF642D] block mb-2">
              Checkout
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#17110E] leading-none">
              Almost on the shelf.
            </h1>
          </div>

          {/* 3-Step Progress Indicator */}
          <div className="flex items-center gap-3 sm:gap-5 bg-[#FFFFFF] border border-[#D9C9B5] rounded-full px-5 py-2.5 shadow-xs self-start md:self-auto">
            {[
              { num: "01", label: "Cart", active: step >= 1 },
              { num: "02", label: "Details", active: step >= 2 },
              { num: "03", label: "Pay", active: step >= 3 },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      s.active
                        ? "bg-[#FF642D] text-white"
                        : "bg-[#F3EADB] text-[#17110E]/50"
                    }`}
                  >
                    {s.num}
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      s.active ? "text-[#17110E]" : "text-[#17110E]/45"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && <span className="text-[#D9C9B5]">/</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: DARK ESPRESSO ORDER SUMMARY */}
          <div className="lg:col-span-5 bg-[#211510] text-white rounded-3xl p-6 sm:p-8 border border-[#2A1914] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9C9B5]/15 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF642D]">
                  Atelier Shelf
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  Order Summary
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#2A1914] border border-[#D9C9B5]/15 text-xs font-bold text-[#F3EADB]">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center space-y-4">
                <p className="text-sm text-[#D9C9B5]">
                  Your checkout shelf is currently empty.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF642D] text-white text-xs font-black uppercase tracking-wider"
                >
                  Browse 3D Store
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-[#2A1914] p-3.5 rounded-2xl border border-[#D9C9B5]/10"
                  >
                    <img
                      src={item.coverImage || "/images/yt-showcase/yt-preeti-live.jpg"}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-[#D9C9B5] mt-0.5">
                        {item.sellerName || "Digital Pack"} &bull; Qty 1
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-sm font-black text-[#FF642D]">
                        ₹{item.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[#D9C9B5]/60 hover:text-[#FF642D] transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#D9C9B5] block mb-2">
                Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#D9C9B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Try SHELF10"
                    className="w-full bg-[#2A1914] border border-[#D9C9B5]/20 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-white placeholder:text-[#D9C9B5]/40 focus:outline-none focus:border-[#FF642D]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F3EADB] hover:bg-[#FF642D] hover:text-white text-[#17110E] text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {promoMessage}
                </p>
              )}
              {promoError && (
                <p className="text-xs font-bold text-[#FF642D] mt-2">
                  {promoError}
                </p>
              )}
            </form>

            {/* Totals Breakdown */}
            <div className="border-t border-[#D9C9B5]/15 pt-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-[#D9C9B5]">
                <span>Subtotal</span>
                <span className="font-bold text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#D9C9B5]">
                <span>Discount</span>
                <span className="font-bold text-emerald-400">
                  -₹{discountAmount}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#D9C9B5]/15">
                <span className="font-black text-base uppercase tracking-wider text-[#F3EADB]">
                  Total
                </span>
                <span className="text-3xl font-black text-[#FF642D]">
                  ₹{finalTotal}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: WHITE CHECKOUT FORM */}
          <form
            onSubmit={handlePayNow}
            className="lg:col-span-7 bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D9C9B5] shadow-lg space-y-6"
          >
            <div>
              <h2 className="text-xl font-black text-[#17110E]">
                Customer &amp; Payment Details
              </h2>
              <p className="text-xs text-[#17110E]/65 mt-1">
                Your instant download link &amp; receipt will be delivered to
                your email.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-[#FF642D]/10 border border-[#FF642D]/40 text-xs font-bold text-[#17110E]">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#17110E] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@studio.com"
                  className="w-full bg-[#F3EADB]/50 border border-[#D9C9B5] rounded-xl px-4 py-3 text-sm font-medium text-[#17110E] focus:outline-none focus:border-[#FF642D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#17110E] mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full bg-[#F3EADB]/50 border border-[#D9C9B5] rounded-xl px-4 py-3 text-sm font-medium text-[#17110E] focus:outline-none focus:border-[#FF642D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#17110E] mb-1.5">
                  Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#F3EADB]/50 border border-[#D9C9B5] rounded-xl px-4 py-3 text-sm font-medium text-[#17110E] focus:outline-none focus:border-[#FF642D]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#17110E] mb-1.5">
                  Billing City / GST (Optional)
                </label>
                <input
                  type="text"
                  value={billingNote}
                  onChange={(e) => setBillingNote(e.target.value)}
                  placeholder="Mumbai / Optional GSTIN"
                  className="w-full bg-[#F3EADB]/50 border border-[#D9C9B5] rounded-xl px-4 py-3 text-sm font-medium text-[#17110E] focus:outline-none focus:border-[#FF642D]"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#17110E] mb-2.5">
                Payment Method (Secured by Razorpay)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const active = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        active
                          ? "bg-[#211510] text-white border-[#211510] shadow-md"
                          : "bg-[#F3EADB]/40 text-[#17110E] border-[#D9C9B5] hover:border-[#FF642D]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? "text-[#FF642D]" : "text-[#211510]"
                        }`}
                      />
                      <span className="text-xs font-extrabold">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#17110E]/60 mt-2 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#FF642D]" />
                Encrypted checkout via Razorpay. We never store card numbers or CVV.
              </p>
            </div>

            {/* Large Orange Pay Now Button */}
            <button
              type="submit"
              disabled={isProcessing || items.length === 0}
              className="w-full py-4 px-8 rounded-full bg-[#FF642D] hover:bg-[#e85520] disabled:opacity-50 text-white font-black text-base uppercase tracking-wider shadow-[0_14px_35px_rgba(255,100,45,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {isProcessing
                  ? "Verifying & Opening Gateway..."
                  : `Pay Now • ₹${finalTotal}`}
              </span>
            </button>

            {/* Trust Footer */}
            <div className="pt-3 border-t border-[#D9C9B5] flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-[#17110E]/80">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF642D]" />
                Secure Checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#FF642D]" />
                Instant Download
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#FF642D]" />
                Lifetime Updates
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

