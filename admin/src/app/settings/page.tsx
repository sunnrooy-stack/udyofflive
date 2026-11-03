"use client";

import React, { useState, useEffect } from "react";

export default function AdminSettings() {
  const [platformFee, setPlatformFee] = useState<number>(5);
  const [payoutThreshold, setPayoutThreshold] = useState<number>(50);
  const [allowSellerSignups, setAllowSellerSignups] = useState<boolean>(true);
  const [autoProductApproval, setAutoProductApproval] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Razorpay Multi-Account Gateway State
  const [activeGateway, setActiveGateway] = useState<"1" | "2">("2");
  const [acc1KeyId, setAcc1KeyId] = useState("rzp_test_TvF0iIwMv1MxWV");
  const [acc1KeySecret, setAcc1KeySecret] = useState("4Ucfs5fbQLMkTBoEajVfDoQp");
  const [acc2KeyId, setAcc2KeyId] = useState("rzp_live_T3nxTH4mjFTNK8");
  const [acc2KeySecret, setAcc2KeySecret] = useState("spFAtkmHQhl5hpcgin3MkJX5");
  const [showSecret1, setShowSecret1] = useState(false);
  const [showSecret2, setShowSecret2] = useState(false);
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);
  const [gatewaySaving, setGatewaySaving] = useState(false);

  useEffect(() => {
    // 1. Load Local Platform Settings
    try {
      const stored = localStorage.getItem("admin_platform_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.platformFee !== undefined) setPlatformFee(parsed.platformFee);
        if (parsed.payoutThreshold !== undefined) setPayoutThreshold(parsed.payoutThreshold);
        if (parsed.allowSellerSignups !== undefined) setAllowSellerSignups(parsed.allowSellerSignups);
        if (parsed.autoProductApproval !== undefined) setAutoProductApproval(parsed.autoProductApproval);
      }
    } catch (e) {}

    // 2. Fetch Active Razorpay Gateways from Backend API
    const primaryApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${primaryApi}/api/payment-settings?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          if (data.activeAccount) setActiveGateway(data.activeAccount === "1" ? "1" : "2");
          if (data.account1?.keyId) setAcc1KeyId(data.account1.keyId);
          if (data.account1?.keySecret) setAcc1KeySecret(data.account1.keySecret);
          if (data.account2?.keyId) setAcc2KeyId(data.account2.keyId);
          if (data.account2?.keySecret) setAcc2KeySecret(data.account2.keySecret);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveGeneral = () => {
    try {
      const settings = {
        platformFee,
        payoutThreshold,
        allowSellerSignups,
        autoProductApproval,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("admin_platform_settings", JSON.stringify(settings));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      alert("Failed to save settings.");
    }
  };

  const handleSwitchGateway = async (targetOption: "1" | "2") => {
    setGatewaySaving(true);
    setActiveGateway(targetOption);

    const primaryApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const payload = {
      activeAccount: targetOption,
      account1: {
        id: "1",
        name: "Razorpay Option 1 (Test / Sandbox)",
        keyId: acc1KeyId.trim(),
        keySecret: acc1KeySecret.trim(),
        isLive: false,
      },
      account2: {
        id: "2",
        name: "Razorpay Option 2 (Live / Production)",
        keyId: acc2KeyId.trim(),
        keySecret: acc2KeySecret.trim(),
        isLive: true,
      },
    };

    try {
      const res = await fetch(`${primaryApi}/api/payment-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setGatewayNotice(
          targetOption === "2"
            ? "⚡ Switched to Razorpay Option 2 (Live Gateway)! Storefront checkout is now receiving live real payments."
            : "🧪 Switched to Razorpay Option 1 (Test / Sandbox)! Storefront checkout is now using Test mode."
        );
      } else {
        setGatewayNotice("Failed to update gateway on backend.");
      }
    } catch (err) {
      setGatewayNotice("Gateway updated locally, backend connection notice.");
    } finally {
      setGatewaySaving(false);
      setTimeout(() => setGatewayNotice(null), 5000);
    }
  };

  const handleSaveGatewayCredentials = async () => {
    await handleSwitchGateway(activeGateway);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            Settings & Payment Gateways
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Configure live Razorpay payment gateways, commission rates, and store preferences.
          </p>
        </div>
        {savedNotice && (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 animate-fade-in self-start sm:self-auto">
            ✓ General Settings Saved Successfully
          </div>
        )}
      </div>

      {/* RAZORPAY MULTI-ACCOUNT GATEWAY SWITCHER */}
      <section id="gateways" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span>Razorpay Payment Gateways (Multi-Account Switcher)</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select which Razorpay account is active for customer checkouts on the storefront.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Active Gateway:</span>
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-full border shadow-sm ${
                activeGateway === "2"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-sky-500/20 text-sky-400 border-sky-500/40"
              }`}
            >
              {activeGateway === "2" ? "🟢 Option 2 (Live Gateway)" : "🧪 Option 1 (Test Mode)"}
            </span>
          </div>
        </div>

        {gatewayNotice && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
            <span>ℹ️</span>
            <span>{gatewayNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OPTION 1 CARD (TEST GATEWAY) */}
          <div
            onClick={() => handleSwitchGateway("1")}
            className={`admin-panel p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
              activeGateway === "1"
                ? "border-sky-500 bg-sky-500/5 shadow-lg shadow-sky-500/10"
                : "border-border hover:border-border/80 opacity-80 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      activeGateway === "1"
                        ? "border-sky-500 bg-sky-500"
                        : "border-muted-foreground bg-transparent"
                    }`}
                  >
                    {activeGateway === "1" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-foreground">Option 1: Test / Sandbox</h4>
                    <span className="text-xs text-muted-foreground">For sandbox testing & validation</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    activeGateway === "1"
                      ? "bg-sky-500 text-white font-black"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activeGateway === "1" ? "Active Now" : "Inactive"}
                </span>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/50 text-xs" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                    Razorpay Key ID (Option 1)
                  </label>
                  <input
                    type="text"
                    value={acc1KeyId}
                    onChange={(e) => setAcc1KeyId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="rzp_test_..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                      Key Secret (Option 1)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret1(!showSecret1)}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      {showSecret1 ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showSecret1 ? "text" : "password"}
                    value={acc1KeySecret}
                    onChange={(e) => setAcc1KeySecret(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Key Secret"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Mode: Test / Sandbox</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwitchGateway("1");
                }}
                disabled={activeGateway === "1" || gatewaySaving}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGateway === "1"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 cursor-default"
                    : "bg-muted hover:bg-sky-600 hover:text-white text-foreground"
                }`}
              >
                {activeGateway === "1" ? "✓ Currently Active" : "Activate Option 1"}
              </button>
            </div>
          </div>

          {/* OPTION 2 CARD (LIVE PRODUCTION GATEWAY) */}
          <div
            onClick={() => handleSwitchGateway("2")}
            className={`admin-panel p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
              activeGateway === "2"
                ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                : "border-border hover:border-border/80 opacity-80 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      activeGateway === "2"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-muted-foreground bg-transparent"
                    }`}
                  >
                    {activeGateway === "2" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-foreground flex items-center gap-1.5">
                      <span>Option 2: Live Gateway</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        LIVE
                      </span>
                    </h4>
                    <span className="text-xs text-muted-foreground">For real customer payments & UPI</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    activeGateway === "2"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activeGateway === "2" ? "Active Now" : "Inactive"}
                </span>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/50 text-xs" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                    Razorpay Key ID (Option 2)
                  </label>
                  <input
                    type="text"
                    value={acc2KeyId}
                    onChange={(e) => setAcc2KeyId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="rzp_live_..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                      Key Secret (Option 2)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret2(!showSecret2)}
                      className="text-[10px] font-bold text-emerald-400 hover:underline"
                    >
                      {showSecret2 ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showSecret2 ? "text" : "password"}
                    value={acc2KeySecret}
                    onChange={(e) => setAcc2KeySecret(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Key Secret"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold">Mode: Live Real Production</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwitchGateway("2");
                }}
                disabled={activeGateway === "2" || gatewaySaving}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGateway === "2"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                }`}
              >
                {activeGateway === "2" ? "✓ Currently Active" : "Activate Option 2"}
              </button>
            </div>
          </div>
        </div>

        {/* Save Updated Gateway Credentials Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveGatewayCredentials}
            disabled={gatewaySaving}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>💾</span>
            <span>{gatewaySaving ? "Saving Gateway..." : "Save Gateway Credentials"}</span>
          </button>
        </div>
      </section>

      {/* PLATFORM COMMISSIONS & FEES */}
      <div className="space-y-6 pt-6 border-t border-border">
        <div className="admin-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold border-b border-border pb-3">Platform Commissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Global Platform Fee (%)</label>
              <input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Payout Threshold (₹)</label>
              <input
                type="number"
                value={payoutThreshold}
                onChange={(e) => setPayoutThreshold(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="admin-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold border-b border-border pb-3">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Allow New Seller Signups</h4>
                <p className="text-sm text-muted-foreground">If turned off, new sellers must be manually invited.</p>
              </div>
              <input
                type="checkbox"
                checked={allowSellerSignups}
                onChange={(e) => setAllowSellerSignups(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <h4 className="font-semibold">Enable Automated Product Approvals</h4>
                <p className="text-sm text-muted-foreground">Approve new uploads instantly without admin review.</p>
              </div>
              <input
                type="checkbox"
                checked={autoProductApproval}
                onChange={(e) => setAutoProductApproval(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveGeneral}
            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-colors shadow"
          >
            Save General Settings
          </button>
        </div>
      </div>
    </div>
  );
}
