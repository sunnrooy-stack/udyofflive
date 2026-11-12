"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Star,
  Users,
  ShieldCheck,
  Sparkles,
  X,
  ZoomIn,
  ChevronRight,
} from "lucide-react";
import Product3DMockup from "@/components/explore/Product3DMockup";
import VideoBeforeAfterSlider, { isCcOrPresetProduct } from "@/components/VideoBeforeAfterSlider";
import { ExploreProduct, fetchExploreProducts } from "@/lib/exploreApi";
import { useCartStore } from "@/store/cart";

const WHATS_INSIDE_TAGS = [
  "Complete Resource Collection",
  "Ready-to-Use Files",
  "Premium Quality",
  "Lifetime Updates",
  "Instant Download",
];

const LICENCES = [
  {
    id: "personal",
    name: "Personal Licence",
    desc: "For 1 creator on personal channels, portfolios, and non-client projects.",
    multiplier: 1,
    badge: "Standard",
  },
  {
    id: "commercial",
    name: "Commercial Licence",
    desc: "For freelance client thumbnails, monetized channels, and commercial campaigns.",
    multiplier: 1.5,
    badge: "Popular",
  },
  {
    id: "team",
    name: "Team Licence",
    desc: "Up to 10 studio editors with shared workspace & agency usage rights.",
    multiplier: 2.5,
    badge: "Agency",
  },
];

function ExploreProductDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "";

  const { addItem, isInCart, items: cartItems } = useCartStore();

  const [allProducts, setAllProducts] = useState<ExploreProduct[]>([]);
  const [product, setProduct] = useState<ExploreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicence, setSelectedLicence] = useState("personal");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchExploreProducts()
      .then((list) => {
        if (!mounted) return;
        setAllProducts(list);
        const found = productId
          ? list.find((item) => item.id === productId)
          : list[0];
        setProduct(found || list[0] || null);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#211510] text-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FF642D] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#D9C9B5]">
          Loading Product from Shelf...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#211510] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black mb-3">Product Not Found</h1>
        <p className="text-sm text-[#D9C9B5] mb-6">
          This digital product is no longer on the shelf.
        </p>
        <Link
          href="/explore"
          className="px-7 py-3 rounded-full bg-[#FF642D] text-white font-black text-xs uppercase tracking-wider"
        >
          Back to 3D Store
        </Link>
      </div>
    );
  }

  const activeLicence =
    LICENCES.find((l) => l.id === selectedLicence) || LICENCES[0];
  const computedPrice = Math.round(product.price * activeLicence.multiplier);
  const computedOriginal = Math.round(
    product.originalPrice * activeLicence.multiplier
  );
  const inCart = isInCart(product.id);

  const galleryImages = Array.from(
    new Set([
      product.coverImage,
      ...(product.previewMedia || []),
      "/images/yt-showcase/yt-preeti-live.jpg",
      "/images/yt-showcase/yt-sejal-vintage.jpg",
    ])
  )
    .filter(Boolean)
    .slice(0, 4);

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (!inCart) {
      addItem({
        id: product.id,
        title: `${product.title} (${activeLicence.name})`,
        price: computedPrice,
        coverImage: product.coverImage,
        sellerName: product.sellerName || "Studio Shelf",
        fileUrls: product.fileUrls || [],
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/explore/checkout");
  };

  const badgeText =
    Array.isArray(product.tags) && product.tags[0]
      ? String(product.tags[0]).toUpperCase()
      : "BESTSELLER";

  return (
    <div className="min-h-screen bg-[#F3EADB] text-[#17110E] font-sans selection:bg-[#FF642D] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#211510]/95 backdrop-blur-md border-b border-[#D9C9B5]/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9C9B5] hover:text-[#FF642D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shelf</span>
          </Link>

          <Link
            href="/explore/checkout"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A1914] hover:bg-[#FF642D] border border-[#D9C9B5]/20 text-xs font-black uppercase tracking-wider text-white transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Checkout ({cartItems.length})</span>
          </Link>
        </div>
      </header>

      {/* UPPER SECTION: DARK ESPRESSO #211510 */}
      <section className="bg-[#211510] text-white pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-[#D9C9B5]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9C9B5] mb-10 flex-wrap">
            <Link href="/explore" className="hover:text-[#FF642D]">
              Store Shelf
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#D9C9B5]/40" />
            <span>{product.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D9C9B5]/40" />
            <span className="text-[#FF642D] truncate max-w-[240px]">
              {product.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* LEFT: Large 3D Product Mockup */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#2A1914]/70 border border-[#D9C9B5]/15 rounded-3xl py-12 px-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
              <Product3DMockup product={product} size="hero" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#D9C9B5]">
                Interactive 3D Edition &bull; Hover to Rotate
              </p>
            </div>

            {/* RIGHT: Product Information */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges + Stats Row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-sm bg-[#FF642D] text-white text-[10px] font-black uppercase tracking-widest">
                  {badgeText}
                </span>
                <span className="px-3 py-1 rounded-sm bg-[#2A1914] border border-[#D9C9B5]/20 text-[#F3EADB] text-[10px] font-bold uppercase tracking-widest">
                  {product.category} &bull; {product.formatLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F3EADB]">
                  <Star className="w-3.5 h-3.5 fill-[#FF642D] text-[#FF642D]" />
                  {product.rating.toFixed(1)} Rating
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D9C9B5]">
                  <Users className="w-3.5 h-3.5 text-[#FF642D]" />
                  {product.salesCount}+ Sales
                </span>
              </div>

              {/* Bold Product Heading */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.08]">
                {product.title}
              </h1>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-[#D9C9B5] leading-relaxed max-w-2xl">
                {product.description}
              </p>

              {/* Price Display */}
              <div className="flex items-baseline gap-4 pt-1">
                <span className="text-4xl sm:text-5xl font-black text-[#FF642D]">
                  ₹{computedPrice}
                </span>
                <span className="text-xl font-bold text-[#D9C9B5]/50 line-through">
                  ₹{computedOriginal}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#2A1914] border border-[#FF642D]/40 text-[10px] font-black uppercase tracking-wider text-[#FF642D]">
                  {activeLicence.name}
                </span>
              </div>

              {/* Trust Labels */}
              <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-[#F3EADB]">
                <span className="inline-flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#FF642D]" />
                  Instant Download
                </span>
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#FF642D]" />
                  Lifetime Updates
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF642D]" />
                  Verified Creator Asset
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="px-8 py-4 rounded-full bg-[#FF642D] hover:bg-[#e85520] text-white font-black text-sm uppercase tracking-wider shadow-[0_14px_35px_rgba(255,100,45,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`px-7 py-4 rounded-full font-black text-sm uppercase tracking-wider border transition-all cursor-pointer inline-flex items-center gap-2 ${
                    inCart
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-[#2A1914] hover:bg-[#38221b] border-[#D9C9B5]/30 text-[#F3EADB]"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shelf</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-[#FF642D]" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOWER SECTION: WARM CREAM #F3EADB */}
      <section className="bg-[#F3EADB] text-[#17110E] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* 0. INTERACTIVE VIDEO BEFORE & AFTER COMPARISON (ONLY CC & PRESET PRODUCTS) */}
          {isCcOrPresetProduct(product) && product.comparisonEnabled !== false && (
            <div>
              <VideoBeforeAfterSlider
                beforeVideoUrl={product.beforeVideoUrl || ""}
                afterVideoUrl={product.afterVideoUrl || product.videoUrl || ""}
                poster={product.comparisonThumbnail || product.coverImage}
                defaultSplit={product.comparisonSettings?.defaultSplit}
                displayOrder={product.comparisonSettings?.displayOrder}
              />
            </div>
          )}

          {/* 3. PRODUCT PREVIEW GALLERY */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF642D] block mb-2">
              Visual Inspection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">
              Product Preview Gallery
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {galleryImages.map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  onClick={() => setLightboxImage(img)}
                  className="group relative aspect-video rounded-2xl overflow-hidden bg-[#211510] border border-[#D9C9B5] cursor-pointer shadow-sm hover:shadow-xl transition-all"
                >
                  <img
                    src={img}
                    alt={`${product.title} preview ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white text-[#17110E] text-xs font-black inline-flex items-center gap-1.5 shadow-md">
                      <ZoomIn className="w-3.5 h-3.5 text-[#FF642D]" />
                      Enlarge
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-[#D9C9B5]">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF642D] block mb-2">
                More From The Shelf
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-8">
                Related Digital Packs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/explore/product?id=${rel.id}`}
                    className="group bg-[#FFFFFF] rounded-3xl border border-[#D9C9B5] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="bg-[#211510] py-6 px-4 flex flex-col items-center">
                      <Product3DMockup product={rel} size="shelf" />
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF642D] block">
                          {rel.category}
                        </span>
                        <h3 className="font-black text-base text-[#17110E] truncate group-hover:text-[#FF642D] transition-colors">
                          {rel.title}
                        </h3>
                      </div>
                      <span className="font-black text-lg text-[#17110E] shrink-0">
                        ₹{rel.price}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LARGER PREVIEW MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-3xl overflow-hidden bg-[#211510] border border-[#D9C9B5]/30 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#FF642D] text-white flex items-center justify-center shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged product preview"
              className="w-full h-auto max-h-[82vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExploreProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#211510] text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ExploreProductDetailContent />
    </Suspense>
  );
}

