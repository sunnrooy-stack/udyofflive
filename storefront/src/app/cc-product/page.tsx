"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CCProductDetailView from "@/components/CCProductDetailView";

function CCProductPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      setLoading(true);
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      const envApi = process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
        : "";
      const endpoints = isLocal
        ? [
            `http://localhost:5000/api/products?t=${Date.now()}`,
            `${envApi}/api/products?t=${Date.now()}`,
            `https://udyofflive1111111111.onrender.com/api/products?t=${Date.now()}`,
          ]
        : [
            `${envApi}/api/products?t=${Date.now()}`,
            `https://udyofflive1111111111.onrender.com/api/products?t=${Date.now()}`,
            `http://localhost:5000/api/products?t=${Date.now()}`,
          ];

      let rawItems: any[] = [];
      for (const ep of endpoints) {
        if (!ep || ep.startsWith("/")) continue;
        try {
          const res = await fetch(ep, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              rawItems = data;
              break;
            }
          }
        } catch (e) {}
      }

      let localItems: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) localItems = JSON.parse(stored);
      } catch (e) {}

      const all = [...rawItems, ...localItems];
      const found = productId
        ? all.find((p: any) => String(p.id) === String(productId))
        : all.find(
            (p: any) =>
              p.sectionSlug === "cc" ||
              p.sectionSlug === "cc-presets" ||
              (p.category && String(p.category).toLowerCase().includes("cc"))
          );

      if (isMounted) {
        setProduct(found || null);
        setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white pt-20">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Loading CC Preset Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white pt-20 px-4 text-center">
        <h1 className="text-2xl font-black mb-2">CC Preset Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">
          The requested CC pack could not be located.
        </p>
        <Link
          href="/cc-explore"
          className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
        >
          Browse All CC Presets
        </Link>
      </div>
    );
  }

  return <CCProductDetailView product={product} />;
}

export default function CCProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <CCProductPageContent />
    </Suspense>
  );
}
