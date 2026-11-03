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
  badge?: string;
  description: string;
}

const CC_PRESETS: CCPreset[] = [
  {
    id: "cc-cyberpunk-neon",
    title: "Cyberpunk Neon Tokyo CC",
    platform: "pc",
    software: ["After Effects CC", "Premiere Pro"],
    style: "Cyberpunk Neon",
    price: 99,
    rating: 5.0,
    downloads: "2.4k",
    beforeImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788532911/ChatGPT_Image_Sep_4_2026_07_40_46_AM_etucka.png",
    afterImage: "/images/before-after-banner.png",
    badge: "BESTSELLER",
    description: "Deep electric blues and intense magenta highlights with chromatic aberration.",
  },
  {
    id: "cc-anime-hdr-glow",
    title: "Anime 4K HDR Vibrant Glow CC",
    platform: "both",
    software: ["After Effects", "CapCut Pro", "Alight Motion"],
    style: "Vibrant Anime",
    price: 89,
    rating: 4.9,
    downloads: "3.8k",
    beforeImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788533853/ChatGPT_Image_Sep_4_2026_07_57_06_AM_sa2q7c.png",
    afterImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788874316/ChatGPT_Image_Sep_8_2026_06_31_13_AM_telgaw.png",
    badge: "VIRAL",
    description: "High saturation, warm anime skin tones with ethereal soft glow lighting.",
  },
  {
    id: "cc-dark-moody-gang",
    title: "Dark Moody Drill & Cinematic CC",
    platform: "mobile",
    software: ["CapCut", "VN Editor", "Alight Motion"],
    style: "Moody & Dark",
    price: 79,
    rating: 4.8,
    downloads: "1.9k",
    beforeImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788533354/ChatGPT_Image_Sep_4_2026_07_48_35_AM_jtbyyn.png",
    afterImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788532574/ChatGPT_Image_Sep_4_2026_07_35_36_AM_chc6st.png",
    badge: "TRENDING",
    description: "Crushed blacks, cold teal undertones and high-contrast punchy shadows.",
  },
  {
    id: "cc-vintage-retro-90s",
    title: "Vintage VHS & Retro Film 90s CC",
    platform: "both",
    software: ["Premiere Pro", "CapCut Pro", "VN"],
    style: "Vintage Retro",
    price: 89,
    rating: 4.9,
    downloads: "2.1k",
    beforeImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788873870/TEXT_eepa3x.png",
    afterImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788532911/ChatGPT_Image_Sep_4_2026_07_40_46_AM_etucka.png",
    badge: "POPULAR",
    description: "Warm kodak film simulation with authentic analog grain and halation.",
  },
  {
    id: "cc-esports-godmode",
    title: "God Mode 4K BGMI / Free Fire CC",
    platform: "mobile",
    software: ["CapCut Pro", "Alight Motion", "VN"],
    style: "Cyberpunk Neon",
    price: 99,
    rating: 5.0,
    downloads: "5.1k",
    beforeImage: "/images/yt-showcase/yt-gaming-sensi-reveal.png",
    afterImage: "/images/yt-showcase/yt-krish-gaming-live.jpg",
    badge: "HOT",
    description: "Extreme clarity, sharpening curves and vibrant character glow for highlights.",
  },
  {
    id: "cc-hollywood-teal-orange",
    title: "Hollywood Blockbuster Orange & Teal",
    platform: "pc",
    software: ["After Effects CC", "Premiere Pro", "DaVinci"],
    style: "Cinematic Orange & Teal",
    price: 119,
    rating: 5.0,
    downloads: "4.5k",
    beforeImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788532574/ChatGPT_Image_Sep_4_2026_07_35_36_AM_chc6st.png",
    afterImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1788533853/ChatGPT_Image_Sep_4_2026_07_57_06_AM_sa2q7c.png",
    badge: "PRO PICK",
    description: "Industry-standard teal sky/shadows with glowing warm golden skin tones.",
  },
];

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

  const { addItem, isInCart } = useCartStore();

  useEffect(() => {
    const p = searchParams.get("platform");
    if (p === "pc" || p === "mobile") {
      setPlatformFilter(p);
    }
  }, [searchParams]);

  const filteredPresets = CC_PRESETS.filter((item) => {
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

        {/* Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPresets.map((preset) => {
            const added = isInCart(preset.id);
            return (
              <div
                key={preset.id}
                onClick={() => setPreviewPreset(preset)}
                className="group relative bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-rose-500/50 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(225,29,72,0.25)] flex flex-col cursor-pointer"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <img
                    src={preset.beforeImage}
                    alt={preset.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Platform & Badge Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
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

                  {/* Quick Preview Hover Trigger */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs shadow-lg">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Compare Before / After</span>
                    </span>
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
                      onClick={(e) => handleAddToCart(preset, e)}
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
              </div>
            );
          })}
        </div>

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
