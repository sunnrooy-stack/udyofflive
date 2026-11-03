"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import YouTubeThumbnailShowcase from "@/components/YouTubeThumbnailShowcase";
import CategoryCircleBar from "@/components/CategoryCircleBar";
import ShowcaseSection from "@/components/ShowcaseSection";
import FanDeckSection from "@/components/FanDeckSection";
import ProductCard, { Product } from "@/components/ProductCard";
import AuthVerificationModal from "@/components/AuthVerificationModal";
import { Monitor, Smartphone, Sparkles, Flame, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cart";
import { getPersonalizedProducts, recordProductView, getActiveUser, UserPersonalizationProfile } from "@/lib/personalization";

const PSD_PRODUCT: Product = {
  id: "6ae95fcb24ea2eb0363e9650",
  title: "PSD",
  description: "Thumbnail PSD collection",
  price: 2,
  originalPrice: 3,
  category: "Thumbnail PSD",
  sectionSlug: "thumbnail-psd",
  tags: ["NEW", "THUMBNAIL PSD"],
  coverImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1793679196/ChatGPT_Image_Sep_27_2026_10_53_41_AM_y3n3ff.png",
  sellerName: "Admin",
  rating: 5.0,
  reviewsCount: 1,
  isFeatured: true,
};

const ANNU_GLOW_ANIME_PRODUCT: Product = {
  id: "6ae8508c7a36210fc0dc8e0a",
  title: "ANNU PALYZ PDF",
  description: "PDF",
  price: 299,
  originalPrice: 499,
  category: "Glow anime logo",
  sectionSlug: "glow-anime-logo",
  tags: ["NEW", "GLOW ANIME LOGO"],
  coverImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1793609839/ChatGPT_Image_Sep_27_2026_10_31_36_AM_ia3ubv.png",
  sellerName: "Admin",
  rating: 5.0,
  reviewsCount: 1,
  isFeatured: true,
};

const REAL_STORE_PRODUCTS: Product[] = [
  PSD_PRODUCT,
  ANNU_GLOW_ANIME_PRODUCT,
];

export default function Home() {
  const { addItem, isInCart } = useCartStore();
  const [rawProducts, setRawProducts] = useState<Product[]>(REAL_STORE_PRODUCTS);
  const [products, setProducts] = useState<Product[]>(REAL_STORE_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<CartItem | null>(null);
  const [currentUser, setCurrentUser] = useState<UserPersonalizationProfile | null>(null);

  // Sync user profile
  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);
  }, []);

  // Fetch real products from API
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      let data: any[] | null = null;
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com").replace(/\/$/, "");
      const apiHost = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
      const endpoints = [
        `${apiUrl}/api/products?t=${Date.now()}`,
        `http://${apiHost}:5000/api/products?t=${Date.now()}`,
        `http://localhost:5000/api/products?t=${Date.now()}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) {
              data = json;
              break;
            }
          }
        } catch (e) {}
      }

      // Check admin local storage fallback
      let localProducts: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) localProducts = JSON.parse(stored);
      } catch (e) {}

      if (isMounted) {
        let rawList: any[] = Array.isArray(data) && data.length > 0 ? [...data] : [...REAL_STORE_PRODUCTS];
        if (Array.isArray(localProducts) && localProducts.length > 0) {
          localProducts.forEach((lp) => {
            const idx = rawList.findIndex((item) => String(item.id) === String(lp.id));
            if (idx !== -1) {
              rawList[idx] = { ...rawList[idx], ...lp };
            } else {
              rawList.unshift(lp);
            }
          });
        }
        
        // Map and format products
        const formatted: Product[] = rawList.map((p: any) => ({
          id: String(p.id),
          title: p.title || "Untitled Product",
          price: Number(p.price) || 0,
          originalPrice: p.originalPrice || (Number(p.price) > 0 ? Math.round(Number(p.price) * 1.45) : 0),
          coverImage: p.coverImage || "/images/demo-sections/demo-thumbnail-psd.png",
          category: p.category || "Assets",
          sectionSlug: p.sectionSlug || "",
          sellerName: p.sellerName || "Admin",
          description: p.description || "",
          rating: p.rating || 5.0,
          reviewsCount: p.reviewsCount || 1,
          tags: p.tags || [],
          isFeatured: p.isFeatured !== false,
        }));

        setRawProducts(formatted);
        setProducts(formatted);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // 1. Thumbnail PSD Products (Dynamic from API)
  const apiThumbnail = products.filter(
    (p) =>
      p.sectionSlug === "thumbnail-psd" ||
      p.category?.toLowerCase() === "thumbnail psd" ||
      p.category?.toLowerCase().includes("thumbnail") ||
      p.title.toLowerCase().includes("thumbnail")
  );
  const thumbnailProducts = apiThumbnail.length > 0 ? apiThumbnail : [PSD_PRODUCT];

  // 2. 4K Backgrounds Products (Live from API matching Admin Panel)
  const apiBackgrounds = products.filter(
    (p) =>
      p.sectionSlug === "4k-backgrounds" ||
      p.category?.toLowerCase() === "4k backgrounds" ||
      (Array.isArray(p.tags) &&
        p.tags.some(
          (t: string) =>
            typeof t === "string" &&
            (t.toLowerCase().includes("4k background") || t.toLowerCase() === "4k")
        ))
  );
  const backgroundProducts = apiBackgrounds;

  // 3. 3D Character Products (Showcase Section 3 - Only Real API Products)
  const apiCharacters = products.filter(
    (p) =>
      p.sectionSlug === "3d-character" ||
      p.category?.toLowerCase() === "3d character" ||
      p.category?.toLowerCase().includes("character") ||
      p.title.toLowerCase().includes("character") ||
      (Array.isArray(p.tags) &&
        p.tags.some(
          (t: string) =>
            typeof t === "string" &&
            t.toLowerCase().includes("character")
        ))
  );
  const characterProducts = apiCharacters;

  // 4. Glow anime logo Products (Live from API matching Admin Panel)
  const apiGlowAnime = products.filter(
    (p) =>
      p.sectionSlug === "glow-anime-logo" ||
      p.category?.toLowerCase() === "glow anime logo" ||
      (p.title && p.title.toLowerCase().includes("annu palyz")) ||
      (Array.isArray(p.tags) &&
        p.tags.some(
          (t: string) =>
            typeof t === "string" &&
            (t.toLowerCase().includes("glow anime logo") || t.toLowerCase() === "glow")
        ))
  );
  const glowAnimeProducts = apiGlowAnime.length > 0 ? apiGlowAnime : [ANNU_GLOW_ANIME_PRODUCT];

  const textProducts = products.filter(
    (p) =>
      p.sectionSlug === "text-effects" ||
      p.category?.toLowerCase().includes("text") ||
      p.title.toLowerCase().includes("text") ||
      (Array.isArray(p.tags) &&
        p.tags.some(
          (t: string) =>
            typeof t === "string" &&
            t.toLowerCase().includes("text")
        ))
  );
  const textProductsToShow = textProducts;

  const popularProducts = products.slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* 1. Hero Section with 16:9 Looping Video & 3D Fan Carousel */}
      <HeroSection />

      {/* 2. YouTube Thumbnail Showcase: 2-Row Infinite Marquee on Pure Black */}
      <YouTubeThumbnailShowcase />

      {/* 3. New Before & After Creative Banner (Full Screen Edge-to-Edge) */}
      <section className="w-full bg-black overflow-hidden">
        <Link
          href="/cc-explore"
          className="group block relative w-full overflow-hidden cursor-pointer"
        >
          <img
            src="/images/before-after-red.png"
            alt="Anime Red Flower Before and After CC Enhancer"
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </Link>
      </section>

      {/* 4. Platform Action Buttons [PC CC] & [MOBILE CC] on Clean White Page */}
      <section className="w-full bg-white pt-10 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          {/* PC CC Button */}
          <Link
            href="/cc-explore?platform=pc"
            className="px-8 py-3.5 rounded-full font-black text-sm sm:text-base text-white bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 shadow-[0_8px_20px_rgba(239,68,68,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
          >
            <Monitor className="w-5 h-5 text-white" />
            <span>PC CC</span>
          </Link>

          {/* MOBILE CC Button */}
          <Link
            href="/cc-explore?platform=mobile"
            className="px-8 py-3.5 rounded-full font-black text-sm sm:text-base text-white bg-slate-950 hover:bg-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.25)] border border-slate-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-sky-400" />
            <span>MOBILE CC</span>
          </Link>
        </div>
      </section>

      {/* 5. Circular Category Navigation Bar (Right between buttons and Thumbnail PSD) */}
      <CategoryCircleBar />

      {/* 6. Thumbnail PSD Showcase Section (Matching user reference with View all ->) */}
      <ShowcaseSection
        id="thumbnail-psd"
        title="Thumbnail PSD"
        viewAllHref="/products?category=thumbnail-pack"
        products={thumbnailProducts}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 7. 4K Backgrounds Showcase Section */}
      <ShowcaseSection
        id="4k-backgrounds"
        title="4K Backgrounds"
        viewAllHref="/products?category=presets"
        products={backgroundProducts}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 8. 3D Character Showcase Section */}
      <ShowcaseSection
        id="3d-character"
        title="3D Character"
        viewAllHref="/products?category=character-pack"
        products={characterProducts}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 9. Glow anime logo Showcase Section */}
      <ShowcaseSection
        id="glow-anime-logo"
        title="Glow anime logo"
        viewAllHref="/products?category=anime-pfp"
        products={glowAnimeProducts}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 10. 3D Text Effects PSD Collection */}
      <ShowcaseSection
        id="text-effects"
        title="3D Text Effects PSD"
        viewAllHref="/products?category=text-effects"
        products={textProductsToShow}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 11. Most Popular Fanning Deck (Interactive 3D Deck Animation) */}
      <FanDeckSection
        id="cc-presets"
        title="Most popular"
        subtitle="Instant color correction presets, 3D text effects, and creator packs."
        viewAllHref="/cc-explore"
        badge="TRENDING"
      />

      {/* Auth Verification Modal */}
      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerifiedSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingProduct) {
            addItem(pendingProduct);
            setPendingProduct(null);
          }
        }}
        actionTitle="purchasing or bookmarking creator assets"
      />
    </div>
  );
}
