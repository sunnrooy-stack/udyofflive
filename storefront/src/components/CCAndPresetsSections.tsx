"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShoppingCart,
  Zap,
  Sparkles,
  Check,
  Sliders,
  Layers,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Product } from "./ProductCard";

const CC_SUBCATEGORIES = [
  "All",
  "4K CC Presets",
  "Cinematic CC",
  "Moody CC",
  "Lightroom CC",
  "Film Look CC",
  "Trending CC Packs",
];

const PRESET_SUBCATEGORIES = [
  "All",
  "After Effects Presets",
  "Premiere Pro Presets",
  "Alight Motion Presets",
  "CapCut Presets",
  "Transition Presets",
  "Effects Presets",
  "Shake Presets",
  "Typography Presets",
];

function matchesAnyKeyword(p: any, keywords: string[]): boolean {
  const haystack = [
    p.sectionSlug,
    p.category,
    p.title,
    p.description,
    ...(Array.isArray(p.tags) ? p.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

function isCCProduct(p: any): boolean {
  const sSlug = String(p.sectionSlug || "").toLowerCase();
  const cat = String(p.category || "").toLowerCase();
  if (sSlug === "cc" || sSlug === "cc-presets") return true;
  if (cat === "cc" || cat === "cc presets" || cat.includes("color correction")) return true;
  return matchesAnyKeyword(p, [
    "4k cc",
    "cinematic cc",
    "moody cc",
    "lightroom cc",
    "film look cc",
    "cc pack",
    "color correction",
    "lut",
  ]);
}

function isPresetProduct(p: any): boolean {
  const sSlug = String(p.sectionSlug || "").toLowerCase();
  const cat = String(p.category || "").toLowerCase();
  if (sSlug === "presets" || sSlug === "preset" || sSlug.includes("preset")) return true;
  if (cat.includes("preset")) return true;
  return matchesAnyKeyword(p, [
    "after effects",
    "premiere pro",
    "alight motion",
    "capcut",
    "transition preset",
    "effects preset",
    "shake preset",
    "typography preset",
    "preset",
  ]);
}

function filterBySubcategory(items: any[], sub: string): any[] {
  if (sub === "All") return items;
  const clean = sub.toLowerCase().replace(" presets", "").replace(" packs", "").trim();
  const tokens = clean.split(/\s+/).filter((t) => t.length > 1);
  return items.filter((p) => {
    const haystack = [
      p.sectionSlug,
      p.category,
      p.title,
      p.description,
      ...(Array.isArray(p.tags) ? p.tags : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(clean) || tokens.every((tk) => haystack.includes(tk));
  });
}

function NeonProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(String(product.id));
  const [hovered, setHovered] = useState(false);

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const hasDiscount = originalPrice > price && price >= 0;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const videoSrc = (product as any).afterVideoUrl || (product as any).videoUrl || (product as any).demoUrl;
  const isDirectVideo =
    typeof videoSrc === "string" && /\.(mp4|webm|mov)(\?|$)/i.test(videoSrc);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      title: product.title,
      price,
      coverImage: product.coverImage || "",
      sellerName: product.sellerName || "Studio",
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      title: product.title,
      price,
      coverImage: product.coverImage || "",
      sellerName: product.sellerName || "Studio",
    });
    router.push("/checkout");
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl bg-[#130D24]/85 backdrop-blur-xl border border-purple-500/25 hover:border-cyan-400/60 transition-all duration-300 overflow-hidden flex flex-col shadow-[0_10px_35px_rgba(9,5,20,0.6)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.28)] hover:-translate-y-1"
    >
      {/* Thumbnail / Video Preview */}
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-video bg-[#080512] overflow-hidden"
      >
        {hovered && isDirectVideo ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={product.coverImage || "/images/demo-sections/demo-thumbnail-psd.png"}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Discount Badge */}
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
            -{discountPct}% OFF
          </span>
        )}

        {/* Category Pill */}
        {product.category && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#090514]/80 backdrop-blur-md border border-purple-400/30 text-[10px] font-bold text-purple-200 uppercase tracking-wider">
            {product.category}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {/* Tags */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.slice(0, 3).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-[10px] font-bold uppercase tracking-wider text-purple-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2 border-t border-purple-500/15">
          {/* Price Row */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white">
                {price === 0 ? "FREE" : `₹${price}`}
              </span>
              {hasDiscount && (
                <span className="text-xs font-semibold text-slate-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Instant Access
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inCart
                  ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                  : "bg-white/5 hover:bg-white/10 border-purple-400/30 text-white"
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-purple-300" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="px-3 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 hover:brightness-110 shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CCAndPresetsSections({ products }: { products: Product[] }) {
  const [selectedCcSub, setSelectedCcSub] = useState("All");
  const [selectedPresetSub, setSelectedPresetSub] = useState("All");

  const ccProducts = useMemo(() => {
    const base = products.filter(isCCProduct);
    return filterBySubcategory(base, selectedCcSub);
  }, [products, selectedCcSub]);

  const presetProducts = useMemo(() => {
    const base = products.filter(isPresetProduct);
    return filterBySubcategory(base, selectedPresetSub);
  }, [products, selectedPresetSub]);

  return (
    <div className="relative bg-[#090514] text-white overflow-hidden">
      {/* Ambient Violet / Cyan Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[520px] h-[520px] rounded-full bg-purple-700/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-[140px]" />

      {/* ===================================================================== */}
      {/* SECTION A – CC (COLOR CORRECTION)                                     */}
      {/* ===================================================================== */}
      <section id="section-cc" className="relative z-10 py-14 sm:py-16 border-b border-purple-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-[11px] font-black uppercase tracking-[0.18em] text-purple-300">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Section A &bull; Color Grading
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                CC{" "}
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  (Color Correction)
                </span>
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                4K CC Presets, Cinematic LUTs, Moody &amp; Film Looks synced directly from our Admin catalog.
              </p>
            </div>

            <Link
              href="/cc-explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#150E29] hover:bg-purple-600/25 border border-purple-400/35 text-xs font-black uppercase tracking-wider text-white transition-all self-start sm:self-auto"
            >
              <span>View All CC</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>

          {/* Subcategory Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CC_SUBCATEGORIES.map((sub) => {
              const active = selectedCcSub === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedCcSub(sub)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 border-transparent text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                      : "bg-[#130D24]/80 border-purple-500/25 text-slate-300 hover:text-white hover:border-purple-400/60"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* Dynamic Product Grid */}
          {ccProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {ccProducts.map((product) => (
                <NeonProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#130D24]/60 border border-purple-500/20 p-8 text-center">
              <Sparkles className="w-7 h-7 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-200">
                No published CC packs found for &ldquo;{selectedCcSub}&rdquo; yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add products under CC in the Admin Panel to display them here automatically.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION B – PRESETS                                                   */}
      {/* ===================================================================== */}
      <section id="section-presets" className="relative z-10 py-14 sm:py-16 border-b border-purple-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Section B &bull; Editing Packs
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Pro{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                  Presets
                </span>
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                After Effects, Premiere Pro, Alight Motion, CapCut, Transitions, Shakes &amp; Typography Presets.
              </p>
            </div>

            <Link
              href="/products?category=presets"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#150E29] hover:bg-purple-600/25 border border-purple-400/35 text-xs font-black uppercase tracking-wider text-white transition-all self-start sm:self-auto"
            >
              <span>View All Presets</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>

          {/* Subcategory Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {PRESET_SUBCATEGORIES.map((sub) => {
              const active = selectedPresetSub === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedPresetSub(sub)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 border-transparent text-white shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                      : "bg-[#130D24]/80 border-purple-500/25 text-slate-300 hover:text-white hover:border-cyan-400/60"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* Dynamic Product Grid */}
          {presetProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {presetProducts.map((product) => (
                <NeonProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#130D24]/60 border border-purple-500/20 p-8 text-center">
              <Sparkles className="w-7 h-7 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-200">
                No published preset packs found for &ldquo;{selectedPresetSub}&rdquo; yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Add products under Presets in the Admin Panel to display them here automatically.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
