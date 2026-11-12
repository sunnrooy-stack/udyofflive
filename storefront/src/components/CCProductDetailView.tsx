"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Monitor,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  ShoppingCart,
  Check,
  ArrowLeft,
  Sliders,
  Download,
  Star,
  Layers,
  Film,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import VideoBeforeAfterSlider from "@/components/VideoBeforeAfterSlider";

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
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=1&rel=0`;
  }
  return url;
}

export interface CCProductDetailProps {
  product: {
    id: string;
    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    coverImage: string;
    videoUrl?: string;
    demoUrl?: string;
    beforeVideoUrl?: string;
    afterVideoUrl?: string;
    comparisonEnabled?: boolean;
    comparisonThumbnail?: string;
    comparisonSettings?: {
      displayOrder?: "before-left" | "after-left";
      defaultSplit?: number;
    };
    previewMedia?: string[];
    category?: string;
    tags?: string[];
    rating?: number;
    fileUrls?: string[];
  };
}

export default function CCProductDetailView({ product }: CCProductDetailProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(product.id);

  const videoSource = product.videoUrl || product.demoUrl || "/hero-wallpaper.mp4";
  const hasCustomVideo = Boolean(product.videoUrl || product.demoUrl);
  const isYt = isYouTubeUrl(videoSource);
  const ytEmbed = isYt ? getYouTubeEmbedUrl(videoSource) : "";

  const [viewMode, setViewMode] = useState<"video" | "photo">("video");
  const [sliderPos, setSliderPos] = useState(50);

  const beforeImg = product.coverImage || "/images/before-after-red.png";
  const afterImg =
    (Array.isArray(product.previewMedia) && product.previewMedia[0]) ||
    product.coverImage ||
    "/images/before-after-banner.png";

  const tags = Array.isArray(product.tags) ? product.tags : [];
  const isMobile = tags.some((t) => String(t).toLowerCase().includes("mobile"));
  const isPc = tags.some((t) => String(t).toLowerCase().includes("pc"));

  const handleAddToCart = () => {
    if (!inCart) {
      addItem({
        id: product.id,
        title: product.title,
        price: Number(product.price) || 0,
        coverImage: product.coverImage,
        sellerName: "CC Presets",
        fileUrls: product.fileUrls || [],
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 selection:bg-rose-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-rose-600/15 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/cc-explore"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400" />
            <span>Back to CC Presets</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider">
            <Film className="w-3.5 h-3.5" />
            <span>16:9 Cinema CC Suite</span>
          </span>
        </div>

        {/* Main 2-Column CC Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Synchronized Video Before & After Comparison Stage (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between bg-[#2A1914] border border-[#D9C9B5]/20 px-4 py-2.5 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#F3EADB]">
                <Sliders className="w-4 h-4 text-[#FF642D]" />
                <span>Interactive Video Before &amp; After</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF642D]/15 text-[#FF642D] text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF642D] animate-ping" />
                Drag Handle to Compare
              </span>
            </div>

            <VideoBeforeAfterSlider
              beforeVideoUrl={
                product.beforeVideoUrl ||
                product.videoUrl ||
                product.demoUrl ||
                "/hero-wallpaper.mp4"
              }
              afterVideoUrl={
                product.afterVideoUrl ||
                product.videoUrl ||
                product.demoUrl ||
                "https://res.cloudinary.com/demo/video/upload/snow_horses.mp4"
              }
              poster={product.comparisonThumbnail || product.coverImage}
              defaultSplit={product.comparisonSettings?.defaultSplit || 50}
              displayOrder={product.comparisonSettings?.displayOrder || "before-left"}
            />

            {/* Software & Format Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "After Effects", sub: ".FFX Preset" },
                { label: "Premiere Pro", sub: ".CUBE LUT" },
                { label: "CapCut / VN", sub: "Mobile Ready" },
                { label: "Alight Motion", sub: ".XML Pack" },
              ].map((sw) => (
                <div
                  key={sw.label}
                  className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3 text-center"
                >
                  <p className="text-xs font-extrabold text-white">{sw.label}</p>
                  <p className="text-[10px] text-rose-400 font-semibold mt-0.5">{sw.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Purchase & Spec Panel (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                CC PRESET
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 text-[10px] font-bold">
                {isMobile && !isPc ? (
                  <>
                    <Smartphone className="w-3 h-3 text-sky-400" />
                    Mobile CC
                  </>
                ) : isPc && !isMobile ? (
                  <>
                    <Monitor className="w-3 h-3 text-rose-400" />
                    PC CC
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-amber-400" />
                    PC + Mobile
                  </>
                )}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold ml-auto">
                <Star className="w-3 h-3 fill-current" />
                {Number(product.rating || 5.0).toFixed(1)}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {product.title}
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                {product.description ||
                  "Production-ready color correction LUT & preset pack engineered for crisp contrast, glowing highlights, and vibrant gaming/anime aesthetics."}
              </p>
            </div>

            {/* Pricing */}
            <div className="p-4 rounded-2xl bg-black/50 border border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 block">
                  Instant Digital License
                </span>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-slate-500 line-through font-bold">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                1-Click Import
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-sm shadow-[0_10px_30px_rgba(225,29,72,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Buy &amp; Download Instantly</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3 px-6 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  inCart
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white"
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Feature Checklist */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lifetime access &amp; instant secure download link</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Works on 1080p, 4K &amp; 8K timelines without quality loss</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Includes both After Effects / Premiere &amp; Mobile presets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
