"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Monitor,
  Smartphone,
  Sparkles,
  Sliders,
  Check,
  ShoppingCart,
  Download,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Layers,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";

function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0`;
  }
  return url;
}

interface CCPreset {
  id: string;
  title: string;
  platform: "pc" | "mobile" | "both";
  software: string[];
  style: string;
  price: number;
  rating: number;
  downloads: string;
  beforeImage: string;
  afterImage: string;
  videoUrl?: string;
  badge?: string;
  description: string;
}

const CC_PRESETS: CCPreset[] = [];

const STYLES = [
  "All Styles",
  "Cyberpunk Neon",
  "Vibrant Anime",
  "Moody & Dark",
  "Vintage Retro",
  "Cinematic Orange & Teal",
];

function CCExploreContent() {
  const searchParams = useSearchParams();
  const initialPlatform = (searchParams.get("platform") as "pc" | "mobile" | null) || "all";

  const [platformFilter, setPlatformFilter] = useState<"all" | "pc" | "mobile">(
    initialPlatform === "pc" || initialPlatform === "mobile" ? initialPlatform : "all"
  );
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [previewPreset, setPreviewPreset] = useState<CCPreset | null>(null);
  const [presets, setPresets] = useState<CCPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const { addItem, isInCart } = useCartStore();

  useEffect(() => {
    const p = searchParams.get("platform");
    if (p === "pc" || p === "mobile") {
      setPlatformFilter(p);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadCcPresets() {
      setLoading(true);
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
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
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              rawItems = data;
              break;
            }
          }
        } catch (e) {}
      }

      // Check admin local storage
      let localItems: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) localItems = JSON.parse(stored);
      } catch (e) {}

      const all = [...rawItems, ...localItems];
      const map = new Map();
      all.forEach((p) => {
        if (p && p.id) map.set(String(p.id), p);
      });

      let deletedIds: string[] = [];
      try {
        const d = localStorage.getItem("admin_deleted_products");
        if (d) deletedIds = JSON.parse(d);
      } catch (e) {}

      const filtered = Array.from(map.values())
        .filter((p: any) => !deletedIds.includes(String(p.id)))
        .filter((p: any) => {
          const sSlug = (p.sectionSlug || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();
          const pTitle = (p.title || "").toLowerCase();
          const hasCcTag =
            Array.isArray(p.tags) &&
            p.tags.some(
              (t: string) =>
                typeof t === "string" &&
                (t.toLowerCase() === "cc" ||
                  t.toLowerCase().includes("cc preset") ||
                  t.toLowerCase().includes("color correction") ||
                  t.toLowerCase().includes("lut"))
            );
          return (
            sSlug === "cc" ||
            sSlug === "cc-presets" ||
            cat === "cc" ||
            cat === "cc presets" ||
            cat.includes("color correction") ||
            pTitle.includes(" cc") ||
            pTitle.startsWith("cc ") ||
            hasCcTag
          );
        });

      if (isMounted) {
        const mappedPresets: CCPreset[] = filtered.map((p: any) => {
          const pTags = Array.isArray(p.tags) ? p.tags.map((t: any) => String(t).toLowerCase()) : [];
          let platform: "pc" | "mobile" | "both" = "both";
          if (pTags.includes("mobile") || pTags.includes("mobile cc") || p.description?.toLowerCase().includes("mobile")) {
            platform = "mobile";
          } else if (pTags.includes("pc") || pTags.includes("pc cc") || p.description?.toLowerCase().includes("pc")) {
            platform = "pc";
          }

          let style = "Cyberpunk Neon";
          for (const s of STYLES) {
            if (s !== "All Styles" && (p.title?.toLowerCase().includes(s.toLowerCase()) || p.description?.toLowerCase().includes(s.toLowerCase()))) {
              style = s;
              break;
            }
          }

          const beforeImg = p.coverImage || "/images/before-after-red.png";
          const afterImg =
            (Array.isArray(p.previewMedia) && p.previewMedia[0]) ||
            p.coverImage ||
            "/images/before-after-banner.png";

          return {
            id: String(p.id),
            title: p.title || "CC Preset",
            platform,
            software: ["After Effects", "Premiere Pro", "CapCut", "Alight Motion"],
            style,
            price: Number(p.price) || 0,
            rating: typeof p.rating === "number" ? p.rating : 5.0,
            downloads: "1.2k",
            beforeImage: beforeImg,
            afterImage: afterImg,
            videoUrl: p.videoUrl || p.demoUrl || "",
            badge: Array.isArray(p.tags) && p.tags[0] ? p.tags[0] : "NEW",
            description: p.description || "Professional color grading and lighting presets.",
          };
        });

        setPresets(mappedPresets);
        setLoading(false);
      }
    }

    loadCcPresets();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPresets = presets.filter((item) => {
    const matchesPlatform =
      platformFilter === "all" ||
      item.platform === "both" ||
      item.platform === platformFilter;
    const matchesStyle =
      selectedStyle === "All Styles" || item.style === selectedStyle;
    return matchesPlatform && matchesStyle;
  });

  const handleAddToCart = (item: CCPreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      coverImage: item.beforeImage,
      sellerName: "Admin",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 selection:bg-rose-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-red-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-semibold">CC Presets Vault</span>
        </nav>

        {/* Hero Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-500/30 text-rose-300 text-xs font-black uppercase tracking-wider mb-4 shadow-[0_0_25px_rgba(225,29,72,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Creative Color Grading Vault</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Production-Ready{" "}
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-purple-400 bg-clip-text text-transparent">
              CC Packs & LUTs
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Turn flat raw footage into cinematic masterpieces with 1-click. Designed for PC (After Effects, Premiere Pro) & Mobile (CapCut, Alight Motion, VN).
          </p>

          {/* Interactive Platform Toggle */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-xl">
            <button
              onClick={() => setPlatformFilter("all")}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                platformFilter === "all"
                  ? "bg-white text-slate-950 shadow-md scale-102"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Presets
            </button>

            <button
              onClick={() => setPlatformFilter("pc")}
              className={`inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                platformFilter === "pc"
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 text-white shadow-[0_4px_20px_rgba(225,29,72,0.4)] scale-102"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>PC CC</span>
            </button>

            <button
              onClick={() => setPlatformFilter("mobile")}
              className={`inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                platformFilter === "mobile"
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(2,132,199,0.4)] scale-102"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>MOBILE CC</span>
            </button>
          </div>
        </div>

        {/* Style Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-3 mb-10">
          {STYLES.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedStyle === style
                  ? "bg-white/15 text-white border border-white/40 shadow-sm"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {/* Presets Grid or Empty State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Fetching CC Presets from database...</p>
          </div>
        ) : filteredPresets.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-10 max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl mb-4">
              🎞️
            </div>
            <h3 className="text-2xl font-black text-white mb-2">0 CC Presets Available</h3>
            <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              No color correction presets have been published yet. You can add new CC packs directly from the Admin Panel to showcase them here!
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Browse All Products
              </Link>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPresets.map((preset) => {
              const added = isInCart(preset.id);
              const videoSource = preset.videoUrl || "/hero-wallpaper.mp4";
              const isYt = isYouTubeUrl(videoSource);
              const ytEmbed = isYt ? getYouTubeEmbedUrl(videoSource) : "";
              return (
                <Link
                  key={preset.id}
                  href={`/cc-product?id=${preset.id}`}
                  className="group relative bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-rose-500/50 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(225,29,72,0.25)] flex flex-col cursor-pointer"
                >
                  {/* Auto-Playing Video Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                    {isYt ? (
                      <iframe
                        src={ytEmbed}
                        title={preset.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="w-full h-full border-0 pointer-events-none"
                      />
                    ) : (
                      <video
                        src={videoSource}
                        poster={preset.beforeImage}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Platform & Live Playing Tag */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                          {preset.platform === "pc"
                            ? "💻 PC ONLY"
                            : preset.platform === "mobile"
                            ? "📱 MOBILE ONLY"
                            : "⚡ PC + MOBILE"}
                        </span>
                        {preset.badge && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md">
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        PLAYING
                      </span>
                    </div>

                    {/* Quick Compare Modal Trigger */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPreviewPreset(preset);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs shadow-lg hover:scale-105 transition-transform cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick Compare</span>
                      </button>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                        {preset.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>

                      {/* Software tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {preset.software.map((sw) => (
                          <span
                            key={sw}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium"
                          >
                            {sw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price & Action Button */}
                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-white">
                          ₹{preset.price}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          Lifetime license
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(preset, e);
                        }}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                          added
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-white text-slate-950 hover:bg-rose-500 hover:text-white"
                        }`}
                      >
                        {added ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>+ Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Software Compatibility & Installation Guide */}
        <div className="mt-20 p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Instant 1-Click Setup Guide
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Compatible with all major editing suites. Includes step-by-step video tutorial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-red-600/20 text-rose-400">
                  <Monitor className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">PC Editing Suites</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Adobe After Effects</strong> (2020 - 2026): .ffx & Look files</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Adobe Premiere Pro</strong>: Lumetri Color 3D .cube LUTs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>DaVinci Resolve</strong>: 33-point precision color cube</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Mobile Editing Apps</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>CapCut Pro (Android & iOS)</strong>: 1-click Filter XML</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Alight Motion</strong>: Project presets & XML color links</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>VN Video Editor</strong>: Instant LUTs import package</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Preview Modal */}
      {previewPreset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPreset(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPreset(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white line-clamp-1 mb-4">
              {previewPreset.title} - Visual Transformation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Raw Footage (Before)
                </span>
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <img
                    src={previewPreset.beforeImage}
                    alt="Before Color Grading"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                  Color Graded (After CC)
                </span>
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-rose-500/50 shadow-lg">
                  <img
                    src={previewPreset.afterImage}
                    alt="After Color Grading"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-white">
                  ₹{previewPreset.price}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  Includes {previewPreset.software.join(", ")}
                </span>
              </div>

              <button
                onClick={(e) => handleAddToCart(previewPreset, e)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  isInCart(previewPreset.id)
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 text-white shadow-lg"
                }`}
              >
                {isInCart(previewPreset.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart ₹{previewPreset.price}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CCExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
        </div>
      }
    >
      <CCExploreContent />
    </Suspense>
  );
}
