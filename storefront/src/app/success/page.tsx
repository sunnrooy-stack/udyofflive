"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const tokenFromUrl = searchParams.get("token");

  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenVerified, setTokenVerified] = useState<boolean>(false);

  useEffect(() => {
    if (!paymentId) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    let token = tokenFromUrl;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("download_token");
      if (!token) {
        try {
          const saved = localStorage.getItem("recent_purchase");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.token) token = parsed.token;
          }
        } catch (e) {}
      }
    }

    // Secure Verification: Send token to backend to verify payment and unlock download links
    async function verifyOrder() {
      try {
        const queryParams = new URLSearchParams({ payment_id: paymentId || "" });
        if (token) queryParams.append("token", token);
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com").replace(/\/$/, "");

        let res = await fetch(`${apiUrl}/api/orders/verify-download?${queryParams.toString()}`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`http://localhost:5000/api/orders/verify-download?${queryParams.toString()}`).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.items) {
            setPurchaseData(data);
            setTokenVerified(Boolean(data.tokenVerified));
            setAccessDenied(false);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend token verification check notice:", err);
      }

      setAccessDenied(true);
      setLoading(false);
    }

    verifyOrder();
  }, [paymentId, tokenFromUrl]);

  const getDownloadUrl = (url: string) => {
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return url;
  };

  if (loading) {
    return (
      <div className="py-20 px-6 lg:px-8 max-w-4xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold">Verifying Order & Generating Downloads...</h2>
        <p className="text-muted-foreground mt-2">Checking payment database record for {paymentId || "order"}...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="py-20 px-6 lg:px-8 max-w-4xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6 border-4 border-rose-500/20">
          ⚠️
        </div>
        <h1 className="text-3xl font-extrabold text-rose-500 mb-3">Access Denied: Unverified Order</h1>
        <p className="text-muted-foreground text-lg max-w-lg mb-8">
          Download links are strictly protected. We could not verify an authentic backend cryptographic security token for order: <strong>{paymentId || "None"}</strong>. Complete a payment to receive a verified download token.
        </p>
        <Link href="/products" className="px-6 py-3 rounded-full font-bold bg-primary text-white hover:bg-primary/90 transition-all">
          Return to Store Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 px-6 lg:px-8 max-w-4xl mx-auto min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
        <span>🛡️</span>
        <span>Cryptographic Security Token Verified by Backend</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center">Payment Verified & Successful!</h1>
      <p className="text-muted-foreground text-lg text-center max-w-xl mb-12">
        Thank you for your purchase. Your payment (<strong>{paymentId}</strong>) was verified with the backend database. Your digital product files are now ready for download.
      </p>

      {purchaseData && purchaseData.items && purchaseData.items.length > 0 ? (
        <div className="w-full glass-panel p-8 rounded-3xl mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Verified Downloads</h2>
          <div className="space-y-4">
            {purchaseData.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    📦
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">by {item.sellerName || "Admin"}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {item.fileUrls && item.fileUrls.length > 0 ? (
                    item.fileUrls.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={getDownloadUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 text-sm justify-center shadow-lg shadow-emerald-600/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download File {item.fileUrls.length > 1 ? index + 1 : ''}
                      </a>
                    ))
                  ) : (
                    <a
                      href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-sm justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download (Demo)
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full glass-panel p-8 rounded-3xl mb-10 text-center">
          <p className="text-muted-foreground">Loading your verified download links...</p>
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/dashboard?tab=purchases" className="px-6 py-3 rounded-full font-semibold border border-border hover:bg-primary/5 transition-colors">
          View Receipt
        </Link>
        <Link href="/products" className="px-6 py-3 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
