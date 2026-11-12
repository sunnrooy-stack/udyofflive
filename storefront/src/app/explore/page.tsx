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
    <div className="min-h-screen bg-[#211510] text-[#FFFFFF] font-sans selection:bg-[#FF642D] selection:text-white">
      {/* Top Editorial Navigation */}
      <header className="sticky top-0 z-40 bg-[#211510]/95 backdrop-blur-md border-b border-[#D9C9B5]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D9C9B5] hover:text-[#FF642D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Main Store</span>
            </Link>
            <span className="text-[#D9C9B5]/25">|</span>
            <span className="text-sm sm:text-base font-black tracking-tight text-[#FFFFFF]">
              ATELIER <span className="text-[#FF642D]">SHELF</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-[#D9C9B5]">
            <a href="#catalog" className="hover:text-white transition-colors">
              Catalog
            </a>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Free Guide
            </button>
            <Link
              href="/explore/checkout"
              className="hover:text-[#FF642D] transition-colors"
            >
              Checkout
            </Link>
          </nav>

          <Link
            href="/explore/checkout"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A1914] hover:bg-[#FF642D] border border-[#D9C9B5]/20 text-xs font-black uppercase tracking-wider text-white transition-all shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shelf ({cartItems.length})</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION: 2-Column Editorial + 3D Product Shelf Installation */}
      <section className="relative overflow-hidden bg-[#211510] pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-[#D9C9B5]/10">
        {/* Subtle Warm Studio Spotlight */}
        <div
          className="absolute top-0 right-0 w-[620px] h-[620px] rounded-full pointer-events-none opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(255,100,45,0.28) 0%, rgba(33,21,16,0) 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT SIDE: Editorial Copy + CTAs + Recent Orders Activity */}
          <div className="lg:col-span-5 space-y-7">
            {/* Micro Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A1914] border border-[#D9C9B5]/20">
              <span className="w-2 h-2 rounded-full bg-[#FF642D] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D9C9B5]">
                Digital Creative Showroom
              </span>
            </div>

            {/* Large Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#FFFFFF] leading-[1.06]">
              Everything you create,{" "}
              <span className="text-[#FF642D]">all in one place.</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#D9C9B5] leading-relaxed max-w-lg">
              A curated physical-grade shelf of digital courses, LUT &amp; CC
              collections, 8K thumbnail PSDs, 3D character packs, and creator
              toolkits engineered for studio output.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="#catalog"
                className="px-7 py-3.5 rounded-full bg-[#FF642D] hover:bg-[#e85520] text-white font-black text-sm tracking-wide shadow-[0_12px_30px_rgba(255,100,45,0.35)] transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="px-6 py-3.5 rounded-full bg-[#2A1914] hover:bg-[#38221b] border border-[#D9C9B5]/25 text-[#F3EADB] font-bold text-sm transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#FF642D]" />
                <span>Get Free Guide</span>
              </button>
            </div>

            {/* Recent Orders Activity Card */}
            <div className="pt-3">
              <div className="bg-[#2A1914] border border-[#D9C9B5]/15 rounded-2xl p-4 max-w-md shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF642D]">
                    Recent Shelf Activity
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F3EADB]">
                    <Star className="w-3 h-3 fill-[#FF642D] text-[#FF642D]" />
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
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#D9C9B5]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF642D]" />
                          {activeOrder.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeOrder.time}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#211510] text-[10px] font-bold uppercase tracking-wider text-[#F3EADB] border border-[#D9C9B5]/15">
                      Verified
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Floating 3D Product Shelf Installation */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl bg-[#2A1914]/70 border border-[#D9C9B5]/15 p-5 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D9C9B5]">
                  Interactive 3D Shelf Display
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF642D]">
                  Move Cursor to Inspect
                </span>
              </div>

              {loading ? (
                <div className="h-[430px] flex flex-col items-center justify-center text-[#D9C9B5] text-sm">
                  <div className="w-8 h-8 border-2 border-[#FF642D] border-t-transparent rounded-full animate-spin mb-3" />
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
                    {/* Physical Horizontal Wooden/Espresso Shelf Plank */}
                    <div className="relative z-0 h-4 w-full rounded-sm bg-gradient-to-b from-[#3d251d] to-[#17110E] border-t border-[#D9C9B5]/25 shadow-[0_18px_30px_rgba(0,0,0,0.85)]" />
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
                      <div className="relative z-0 h-4 w-full rounded-sm bg-gradient-to-b from-[#3d251d] to-[#17110E] border-t border-[#D9C9B5]/25 shadow-[0_18px_30px_rgba(0,0,0,0.85)]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WARM CREAM CATALOG SECTION */}
      <section id="catalog" className="bg-[#F3EADB] text-[#17110E] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF642D] block mb-2">
                Full Archive Collection
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#17110E]">
                Browse the Digital Shelf
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#211510] text-white shadow-md"
                      : "bg-[#FFFFFF] text-[#17110E] border border-[#D9C9B5] hover:border-[#FF642D]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[#17110E]/60 font-medium">
              Loading digital products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#D9C9B5] p-8">
              <p className="text-lg font-bold text-[#17110E]">
                No products found in this category.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#FF642D] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((item) => {
                const added = isInCart(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      router.push(`/explore/product?id=${item.id}`)
                    }
                    className="group bg-[#FFFFFF] rounded-3xl border border-[#D9C9B5] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(33,21,16,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    {/* 3D Dark Espresso Stage inside Card */}
                    <div className="bg-[#211510] pt-8 pb-6 px-4 flex flex-col items-center justify-center relative overflow-hidden">
                      <Product3DMockup product={item} size="shelf" />
                      <div className="h-2.5 w-4/5 rounded-sm bg-[#2A1914] border-t border-[#D9C9B5]/20 shadow-lg mt-1" />
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#FF642D] mb-1.5">
                          <span>{item.category}</span>
                          <span className="inline-flex items-center gap-1 text-[#17110E]">
                            <Star className="w-3 h-3 fill-[#FF642D] text-[#FF642D]" />
                            {item.rating.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-[#17110E] group-hover:text-[#FF642D] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-[#17110E]/70 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#D9C9B5]/60 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-[#17110E]">
                            ₹{item.price}
                          </span>
                          <span className="text-xs text-[#17110E]/45 line-through font-bold">
                            ₹{item.originalPrice}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(item, e)}
                            className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                              added
                                ? "bg-emerald-600 text-white"
                                : "bg-[#F3EADB] hover:bg-[#211510] hover:text-white text-[#17110E]"
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
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
