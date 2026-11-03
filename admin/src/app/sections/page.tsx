"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SECTIONS_CONFIG, matchProductForSection } from "./SectionView";

export default function SectionsOverviewPage() {
  const sections = Object.values(SECTIONS_CONFIG);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiSource, setApiSource] = useState<string>("http://localhost:5000");
  const [apiStatus, setApiStatus] = useState<"connecting" | "connected" | "fallback">("connecting");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const fetchApiData = async () => {
    setLoading(true);
    setApiStatus("connecting");

    let localItems: any[] = [];
    try {
      const stored = localStorage.getItem("admin_local_products");
      if (stored) localItems = JSON.parse(stored);
    } catch {}

    const primaryApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const fallbackApi = "https://udyofflive1111111111.onrender.com";

    let apiItems: any[] = [];
    let activeApi = primaryApi;
    let status: "connected" | "fallback" = "connected";

    try {
      const res = await fetch(`${primaryApi}/api/products?admin=true&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        apiItems = await res.json();
        activeApi = primaryApi;
        status = "connected";
      } else {
        throw new Error("Primary API not ok");
      }
    } catch {
      try {
        const fallbackRes = await fetch(`${fallbackApi}/api/products?admin=true&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (fallbackRes.ok) {
          apiItems = await fallbackRes.json();
          activeApi = fallbackApi;
          status = "fallback";
        }
      } catch (e) {
        console.error("API Fetch error:", e);
      }
    }

    const all = Array.isArray(apiItems) ? [...apiItems, ...localItems] : localItems;
    // Deduplicate by ID
    const map = new Map();
    all.forEach((p) => {
      if (p && p.id) map.set(String(p.id), p);
    });
    let deletedIds: string[] = [
      "6ae869e86dc9e35a6d5051b7", // 3D Text Effects demo
      "6ae85671efbc320141ab02c1", // 4K Thumbnail demo
      "6ae85ebadd55de6b68b7520f", // FF Bundle demo
      "6ae869e86dc9e35a6d5051b6", // 3D Character Pack demo
    ];
    try {
      const d = localStorage.getItem("admin_deleted_products");
      if (d) deletedIds = [...deletedIds, ...JSON.parse(d)];
    } catch (e) {}

    const unique = Array.from(map.values()).filter((p: any) => !deletedIds.includes(String(p.id)));

    setProducts(unique);
    setApiSource(activeApi);
    setApiStatus(status);
    setLoading(false);
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  // Compute stats for each section
  const sectionStats = sections.map((sec) => {
    const matched = products.filter((p) => matchProductForSection(p, sec.slug, sec.title));
    const prices = matched.map((p) => Number(p.price) || 0).filter((p) => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      ...sec,
      items: matched,
      count: matched.length,
      minPrice,
      maxPrice,
      previews: matched.slice(0, 4).map((p) => p.coverImage || sec.defaultCover),
    };
  });

  const totalShowcaseProductsCount = sectionStats.reduce((acc, s) => acc + s.count, 0);

  // Filtered list of products for the live table
  const allMatchedProductsWithSection = products.flatMap((p) => {
    const matchedSections = sections.filter((s) => matchProductForSection(p, s.slug, s.title));
    return matchedSections.map((s) => ({
      ...p,
      matchedSectionSlug: s.slug,
      matchedSectionTitle: s.title,
      matchedSectionBadge: s.badge,
    }));
  });

  const filteredTableProducts = allMatchedProductsWithSection.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSection =
      selectedFilter === "all" || item.matchedSectionSlug === selectedFilter;

    return matchesSearch && matchesSection;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Showcase Sections Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              API Live Sync
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time API integration with Storefront showcase collections, sliders, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchApiData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span>{loading ? "Fetching..." : "Refresh API"}</span>
          </button>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>👁️</span>
            <span>View Live Storefront</span>
          </a>
        </div>
      </div>

      {/* API Connection & KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Status */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
            {apiStatus === "connected" ? "🟢" : "🟡"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              API Sync Status
            </p>
            <p className="text-sm font-bold text-foreground truncate mt-0.5">
              {apiSource}
            </p>
            <span className="text-[11px] text-emerald-500 font-medium">
              {products.length} Total Catalog Items
            </span>
          </div>
        </div>

        {/* Showcase Sections Count */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0">
            📑
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Showcase Sections
            </p>
            <p className="text-2xl font-black text-foreground mt-0.5">
              {sections.length}
            </p>
            <span className="text-[11px] text-primary font-medium">
              Active Storefront Sliders
            </span>
          </div>
        </div>

        {/* Total Showcase Products */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl shrink-0">
            ✨
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Matched in Showcases
            </p>
            <p className="text-2xl font-black text-foreground mt-0.5">
              {totalShowcaseProductsCount}
            </p>
            <span className="text-[11px] text-cyan-500 font-medium">
              Auto-filtered from API
            </span>
          </div>
        </div>

        {/* Live Sync Mode */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl shrink-0">
            ⚡
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Storefront Mode
            </p>
            <p className="text-base font-extrabold text-foreground mt-0.5">
              Dynamic Auto-Sync
            </p>
            <span className="text-[11px] text-purple-400 font-medium">
              Changes reflect instantly
            </span>
          </div>
        </div>
      </div>

      {/* Showcase Sections Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Active Showcase Collections
          </h2>
          <span className="text-xs text-muted-foreground">
            Select a showcase to add, edit, or configure live products
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionStats.map((sec) => (
            <div
              key={sec.slug}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      {sec.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {sec.title}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {sec.badge}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-muted text-xs font-bold text-foreground">
                    {sec.count} item{sec.count === 1 ? "" : "s"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {sec.description}
                </p>

                {/* Cover & Live API Previews */}
                <div className="rounded-xl overflow-hidden aspect-[16/8] bg-muted relative mb-3 border border-border/50">
                  <img
                    src={sec.defaultCover}
                    alt={sec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-[11px] font-mono text-white/90">
                      {sec.count > 0
                        ? `Price: ₹${sec.minPrice} - ₹${sec.maxPrice}`
                        : "Ready for products"}
                    </span>
                    <span className="text-[10px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white border border-white/20">
                      API Filter: Active
                    </span>
                  </div>
                </div>

                {/* Mini Image Preview Strip of items fetched from API */}
                {sec.items.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                      <span>Live API Catalog Samples:</span>
                      <span className="font-semibold text-primary">{sec.items.length} matched</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {sec.items.slice(0, 5).map((prod: any, idx: number) => (
                        <div
                          key={`thumb-${prod.id}-${idx}`}
                          className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-muted relative group/thumb"
                          title={prod.title}
                        >
                          <img
                            src={prod.coverImage || sec.defaultCover}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = sec.defaultCover;
                            }}
                          />
                        </div>
                      ))}
                      {sec.items.length > 5 && (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 bg-muted/40">
                          +{sec.items.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50 gap-2">
                <a
                  href={`http://localhost:3000/#${sec.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl border border-border text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <span>👁️</span> Preview
                </a>
                <Link
                  href={`/sections/${sec.slug}`}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                >
                  <span>Manage Products</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Showcase Products Table */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              All Showcase Products from API ({filteredTableProducts.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live items currently delivered to storefront showcase carousels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search product title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border border-border rounded-xl px-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-52 sm:w-64"
            />

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Showcase Sections</option>
              {sections.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.icon} {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-3.5 font-bold text-muted-foreground">Product</th>
                  <th className="p-3.5 font-bold text-muted-foreground">Assigned Showcase</th>
                  <th className="p-3.5 font-bold text-muted-foreground">Category</th>
                  <th className="p-3.5 font-bold text-muted-foreground">Price</th>
                  <th className="p-3.5 font-bold text-muted-foreground">Asset File</th>
                  <th className="p-3.5 font-bold text-muted-foreground">Rating</th>
                  <th className="p-3.5 font-bold text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <span className="inline-block animate-spin mr-2">⚡</span>
                      Fetching live showcase catalog from API...
                    </td>
                  </tr>
                ) : filteredTableProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No matching products found in showcase sections.
                    </td>
                  </tr>
                ) : (
                  filteredTableProducts.map((prod, idx) => (
                    <tr
                      key={`${prod.id}_${prod.matchedSectionSlug}_${idx}`}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                            <img
                              src={prod.coverImage || "/images/demo-sections/demo-thumbnail-psd.png"}
                              alt={prod.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/images/demo-sections/demo-thumbnail-psd.png";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-foreground line-clamp-1 max-w-[220px]">
                              {prod.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: {prod.id ? String(prod.id).substring(0, 10) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          <span>{prod.matchedSectionBadge}</span>
                          <span>{prod.matchedSectionTitle}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-muted-foreground">
                        {prod.category || "General"}
                      </td>

                      <td className="p-3.5 font-bold text-primary">
                        {Number(prod.price) === 0 ? "FREE" : `₹${prod.price}`}
                      </td>

                      <td className="p-3.5">
                        {prod.fileUrls && prod.fileUrls.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            🔒 Download Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            ⚠️ No File URL
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-muted-foreground font-medium">
                        ⭐ {prod.rating || "5.0"}
                      </td>

                      <td className="p-3.5 text-right">
                        <Link
                          href={`/sections/${prod.matchedSectionSlug}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Manage Section →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
