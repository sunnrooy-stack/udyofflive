"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  ShoppingBag,
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Sparkles,
  X,
  Download,
  ArrowLeft,
} from "lucide-react";
import Product3DMockup from "@/components/explore/Product3DMockup";
import { ExploreProduct, fetchExploreProducts } from "@/lib/exploreApi";
import { useCartStore } from "@/store/cart";

const RECENT_ORDERS = [
  {
    product: "Ultra HDR Thumbnail PSD",
    location: "Mumbai, IN",
    time: "2 mins ago",
    rating: "5.0",
  },
  {
    product: "Cinematic AE CC Enhancer",
    location: "Bengaluru, IN",
    time: "7 mins ago",
    rating: "4.9",
  },
  {
    product: "4K Mythic Matte Pack",
    location: "New Delhi, IN",
    time: "14 mins ago",
    rating: "5.0",
  },
];

export default function ExploreStoreHomepage() {
  const router = useRouter();
  const { addItem, isInCart, items: cartItems } = useCartStore();

  const [products, setProducts] = useState<ExploreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeOrderIdx, setActiveOrderIdx] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchExploreProducts()
      .then((data) => {
        if (mounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOrderIdx((prev) => (prev + 1) % RECENT_ORDERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const shelfRow1 = products.slice(0, 3);
  const shelfRow2 = products.slice(3, 6);

  const handleAddToCart = (p: ExploreProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCart(p.id)) {
      addItem({
        id: p.id,
        title: p.title,
        price: p.price,
        coverImage: p.coverImage,
        sellerName: p.sellerName || "Studio Shelf",
        fileUrls: p.fileUrls || [],
      });
    }
  };

  const activeOrder = RECENT_ORDERS[activeOrderIdx];

  return (
    <div className="min-h-screen bg-[#160A29] text-[#FFFFFF] font-sans selection:bg-[#A855F7] selection:text-white pt-20">
      {/* Top Editorial Navigation */}
      <header className="border-b border-purple-500/20 bg-[#160A29]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Main Store</span>
            </Link>
            <span className="text-purple-500/35">|</span>
            <span className="text-sm sm:text-base font-black tracking-tight text-[#FFFFFF]">
              GEONIX VFX{" "}
              <span className="bg-gradient-to-r from-[#A855F7] to-[#06B6D4] bg-clip-text text-transparent">
                SHELF
              </span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-300">
            <Link href="/products" className="hover:text-white transition-colors">
              Catalog
            </Link>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Free Guide
            </button>
            <Link
              href="/explore/checkout"
              className="hover:text-cyan-400 transition-colors"
            >
              Checkout
            </Link>
          </nav>

          <Link
            href="/explore/checkout"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D0F38] hover:bg-purple-600/30 border border-purple-500/35 text-xs font-black uppercase tracking-wider text-white transition-all shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shelf ({cartItems.length})</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION: 2-Column Editorial + 3D Product Shelf Installation */}
      <section className="relative overflow-hidden bg-[#160A29] pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-purple-500/15">
        {/* Subtle Purple & Cyan Studio Spotlight */}
        <div
          className="absolute top-0 right-0 w-[620px] h-[620px] rounded-full pointer-events-none opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.32) 0%, rgba(22,10,41,0) 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT SIDE: Editorial Copy + CTAs + Recent Orders Activity */}
          <div className="lg:col-span-5 space-y-7">
            {/* Micro Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D0F38] border border-purple-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-purple-200">
                Digital Creative Showroom
              </span>
            </div>

            {/* Large Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#FFFFFF] leading-[1.06]">
              Everything you create,{" "}
              <span className="bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-[#06B6D4] bg-clip-text text-transparent">
                all in one place.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              A curated physical-grade shelf of digital courses, LUT &amp; CC
              collections, 8K thumbnail PSDs, 3D character packs, and creator
              toolkits engineered for studio output.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/products"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#2563EB] hover:brightness-110 text-white font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(124,58,237,0.45)] transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="px-6 py-3.5 rounded-full bg-[#1D0F38] hover:bg-purple-900/50 border border-purple-500/35 text-white font-bold text-sm transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Get Free Guide</span>
              </button>
            </div>

            {/* Recent Orders Activity Card */}
            <div className="pt-3">
              <div className="bg-[#1D0F38]/85 backdrop-blur-xl border border-purple-500/25 rounded-2xl p-4 max-w-md shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                    Recent Shelf Activity
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-200">
                    <Star className="w-3 h-3 fill-[#A855F7] text-[#A855F7]" />
                    {activeOrder.rating}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeOrderIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-white truncate">
                        {activeOrder.product}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          {activeOrder.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeOrder.time}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#160A29] text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-purple-500/25">
                      Verified
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Floating 3D Product Shelf Installation */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl bg-[#1D0F38]/75 backdrop-blur-xl border border-purple-500/25 p-5 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-200">
                  Interactive 3D Shelf Display
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Move Cursor to Inspect
                </span>
              </div>

              {loading ? (
                <div className="h-[430px] flex flex-col items-center justify-center text-slate-300 text-sm">
                  <div className="w-8 h-8 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin mb-3" />
                  Arranging 3D showroom shelves...
                </div>
              ) : (
                <div className="space-y-10">
                  {/* SHELF 1 */}
                  <div className="relative">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 items-end justify-items-center pb-2 relative z-10">
                      {shelfRow1.map((item) => (
                        <Product3DMockup
                          key={item.id}
                          product={item}
                          size="shelf"
                          onClick={() =>
                            router.push(`/explore/product?id=${item.id}`)
                          }
                        />
                      ))}
                    </div>
                    {/* Physical Horizontal Neon-Purple Shelf Plank */}
                    <div className="relative z-0 h-4 w-full rounded-sm bg-gradient-to-b from-[#2E1A54] to-[#110824] border-t border-purple-400/35 shadow-[0_18px_30px_rgba(0,0,0,0.85)]" />
                  </div>

                  {/* SHELF 2 */}
                  {shelfRow2.length > 0 && (
                    <div className="relative">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 items-end justify-items-center pb-2 relative z-10">
                        {shelfRow2.map((item) => (
                          <Product3DMockup
                            key={item.id}
                            product={item}
                            size="shelf"
                            onClick={() =>
                              router.push(`/explore/product?id=${item.id}`)
                            }
                          />
                        ))}
                      </div>
                      {/* Physical Horizontal Shelf Plank */}
                      <div className="relative z-0 h-4 w-full rounded-sm bg-gradient-to-b from-[#2E1A54] to-[#110824] border-t border-purple-400/35 shadow-[0_18px_30px_rgba(0,0,0,0.85)]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FREE GUIDE MODAL */}
      {isGuideOpen && (
        <div
          onClick={() => setIsGuideOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F3EADB] text-[#17110E] max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-[#D9C9B5] shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#211510] text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF642D]">
              Free Studio Resource
            </span>
            <h3 className="text-2xl font-black mt-2">
              Creator Setup &amp; Lighting Guide
            </h3>
            <p className="text-sm text-[#17110E]/75 mt-2 leading-relaxed">
              Learn how top creators combine 8K PSD layers, After Effects CC
              presets, and 4K matte backgrounds to triple their click-through
              rate.
            </p>
            <div className="mt-5 space-y-2 text-xs font-bold">
              <div className="p-3 rounded-xl bg-white border border-[#D9C9B5] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF642D]" />
                <span>01. Color Grading &amp; Rim Lighting Formula</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#D9C9B5] flex items-center gap-2">
                <Download className="w-4 h-4 text-[#FF642D]" />
                <span>02. Instant LUT &amp; PSD Workflow Checklist</span>
              </div>
            </div>
            <a
              href="#catalog"
              onClick={() => setIsGuideOpen(false)}
              className="mt-6 w-full py-3 rounded-full bg-[#FF642D] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Browse Starter Packs</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

