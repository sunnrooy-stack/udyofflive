"use client";

import React, { useState, useEffect } from "react";
import { useCartStore, CartItem } from "@/store/cart";
import { useParams, useRouter } from "next/navigation";
import ProductPreviewGallery from "@/components/ProductPreviewGallery";
import CCProductDetailView from "@/components/CCProductDetailView";
import VideoBeforeAfterSlider, { isCcOrPresetProduct } from "@/components/VideoBeforeAfterSlider";
import { AlertTriangle, Check, ShoppingCart, Zap } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { addItem, removeItem, isInCart } = useCartStore();
  const inCart = isInCart(id);

  const [product, setProduct] = useState<any>({
    id: id,
    title: "Loading Product...",
    price: 0,
    coverImage: "",
    sellerName: "Digital Vendor",
    description: "Please wait while product details are being loaded from catalog.",
    status: "Approved",
    isFeatured: true,
  });

  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [userSelectedRatio, setUserSelectedRatio] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadProduct() {
      let data: any[] | null = null;
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com").replace(/\/$/, "");
      const endpoints = [
        `${apiUrl}/api/products?t=${Date.now()}`,
        `https://digital-product-1-l3qr.onrender.com/api/products?t=${Date.now()}`,
        `http://localhost:5000/api/products?t=${Date.now()}`,
      ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { cache: "no-store" }).catch(() => null);
          if (res && res.ok) {
            const json = await res.json().catch(() => null);
            if (Array.isArray(json) && json.length > 0) {
              data = json;
              break;
            }
          }
        } catch (e) {}
      }

      if (isMounted) {
        let match: any = null;
        if (Array.isArray(data)) {
          match = data.find((p: any) => String(p.id) === String(id));
        }

        if (match) {
          setProduct(match);
        } else {
          setProduct({
            id: id,
            title: "Digital Product Package",
            price: 49,
            coverImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1793609839/ChatGPT_Image_Sep_27_2026_10_31_36_AM_ia3ubv.png",
            sellerName: "Admin",
            description: "Full digital assets package included.",
            status: "Approved",
            isFeatured: true,
          });
        }
        setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const cartItem: CartItem = {
    id: String(product.id),
    title: product.title,
    price: Number(product.price),
    coverImage: product.coverImage || "",
    sellerName: product.sellerName || "Vendor",
    fileUrls: product.fileUrls || [],
  };

  const is3dCharProduct =
    product?.aspectRatio === "600:692" ||
    product?.aspectRatio === "600/692" ||
    product?.sectionSlug === "3d-character" ||
    (product?.category && product.category.toLowerCase().includes("character")) ||
    (product?.title && product.title.toLowerCase().includes("character"));

  const isGlowAnimeProduct =
    !is3dCharProduct && (
      product?.aspectRatio === "600:706" ||
      product?.aspectRatio === "600/706" ||
      product?.sectionSlug === "glow-anime-logo" ||
      (product?.category && product.category.toLowerCase().includes("glow anime")) ||
      (product?.title && (product.title.toLowerCase().includes("glow anime") || product.title.toLowerCase().includes("annu palyz") || product.title.toLowerCase().includes("sweety")))
    );

  const is4kBackgroundProduct =
    !is3dCharProduct &&
    !isGlowAnimeProduct && (
      product?.aspectRatio === "600:550" ||
      product?.aspectRatio === "600/550" ||
      product?.aspectRatio === "12:11" ||
      product?.sectionSlug === "4k-backgrounds" ||
      (product?.category && product.category.toLowerCase().includes("background")) ||
      (product?.title && product.title.toLowerCase().includes("background"))
    );

  const isTextEffectProduct =
    !is3dCharProduct &&
    !isGlowAnimeProduct &&
    !is4kBackgroundProduct && (
      product?.aspectRatio === "2:1" ||
      product?.aspectRatio === "2/1" ||
      product?.sectionSlug === "text-effects" ||
      (product?.category && (product.category.toLowerCase().includes("text effect") || product.category.toLowerCase() === "3d text effects psd")) ||
      (product?.title && product.title.toLowerCase().includes("text"))
    );

  const isThumbnailProduct =
    !is3dCharProduct &&
    !isGlowAnimeProduct &&
    !is4kBackgroundProduct &&
    !isTextEffectProduct && (
      (product?.category && product.category.toLowerCase().includes("psd")) ||
      (product?.category && product.category.toLowerCase().includes("thumbnail")) ||
      (product?.title && product.title.toLowerCase().includes("psd")) ||
      (product?.title && product.title.toLowerCase().includes("thumbnail")) ||
      (product?.sectionSlug === "thumbnail-psd") ||
      (product?.aspectRatio === "1.09:1" || product?.aspectRatio === "1:1.09")
    );

  const defaultRatio = is3dCharProduct
    ? "600:692"
    : isGlowAnimeProduct
    ? "600:706"
    : is4kBackgroundProduct
    ? "600:550"
    : isTextEffectProduct
    ? "2:1"
    : isThumbnailProduct
    ? "1.09:1"
    : (product?.aspectRatio || "16:9");
  const currentActiveRatio = userSelectedRatio || product?.aspectRatio || defaultRatio;

  const getAspectRatioClass = (ratio?: string) => {
    const r = String(ratio || "").trim();
    if (r === "600:692" || r === "600/692") {
      return "aspect-[600/692] max-w-[470px] w-full mx-auto";
    }
    if (r === "600:706" || r === "600/706") {
      return "aspect-[600/706] max-w-[460px] w-full mx-auto";
    }
    if (r === "600:550" || r === "600/550" || r === "12:11" || r === "12/11") {
      return "aspect-[600/550] max-w-[550px] w-full mx-auto";
    }
    if (r === "2:1" || r === "2/1") {
      return "aspect-[2/1] max-w-[600px] w-full mx-auto";
    }
    if (r === "1.09:1" || r === "1:1.09" || r === "1.09/1" || r === "1/1.09") {
      return "aspect-[1/1.09] max-w-[440px] w-full mx-auto";
    }
    if (r === "1:1" || r === "1/1") return "aspect-square max-h-[500px] max-w-[500px] mx-auto";
    if (r === "9:16" || r === "9/16") return "aspect-[9/16] max-h-[600px] max-w-[340px] mx-auto";
    if (r === "4:3" || r === "4/3") return "aspect-[4/3] max-h-[520px]";
    return "aspect-video"; // default 16:9
  };

  const displayedMainImage = activeImage || product.coverImage;

  const isCcProduct =
    product?.sectionSlug === "cc" ||
    product?.sectionSlug === "cc-presets" ||
    (product?.category && String(product.category).toLowerCase().includes("cc")) ||
    (Array.isArray(product?.tags) &&
      product.tags.some(
        (t: any) =>
          typeof t === "string" &&
          (t.toLowerCase() === "cc" ||
            t.toLowerCase().includes("cc preset") ||
            t.toLowerCase().includes("color correction"))
      ));

  if (isCcProduct && product?.id) {
    return <CCProductDetailView product={product} />;
  }

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const hasDiscount = originalPrice > price && price >= 0;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const featuresList: string[] =
    Array.isArray(product.features) && product.features.length > 0
      ? product.features
      : [
          "Instant digital file download",
          "Compatible with PC & Mobile workflows",
          "Step-by-step setup documentation",
          "Lifetime updates included",
        ];

  const handleBuyNow = () => {
    if (!inCart) addItem(cartItem);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      <div className="relative z-10 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT SIDE: Large Square Dark Artwork Preview + Thumbnails */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden relative group border border-slate-200 bg-[#0A0A0F] flex items-center justify-center shadow-xl">
              {displayedMainImage ? (
                <img
                  src={displayedMainImage}
                  alt={product.title}
                  className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex items-center justify-center text-6xl">📦</div>
              )}

              {discountPct > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                  -{discountPct}% OFF
                </span>
              )}
            </div>

            {/* Multiple Preview Thumbnails */}
            {Array.isArray(product.previewMedia) && product.previewMedia.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.coverImage && (
                  <button
                    type="button"
                    onClick={() => setActiveImage(product.coverImage)}
                    className={`h-20 w-20 shrink-0 rounded-xl border overflow-hidden cursor-pointer transition-all bg-[#0A0A0F] ${
                      displayedMainImage === product.coverImage
                        ? "border-purple-600 ring-2 ring-purple-600/30"
                        : "border-slate-200 hover:border-purple-400"
                    }`}
                  >
                    <img src={product.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  </button>
                )}
                {product.previewMedia.map((url: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(url)}
                    className={`h-20 w-20 shrink-0 rounded-xl border overflow-hidden cursor-pointer transition-all bg-[#0A0A0F] ${
                      displayedMainImage === url
                        ? "border-purple-600 ring-2 ring-purple-600/30"
                        : "border-slate-200 hover:border-purple-400"
                    }`}
                  >
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video Link Button Section */}
            {product.demoUrl && product.demoUrl.trim() !== "" && product.demoUrl !== "#" && (
              <div className="pt-1">
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-400">▶</span>
                    <span className="tracking-wide uppercase font-black text-xs">Watch Video Preview</span>
                  </div>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-lg font-mono text-slate-200">
                    {product.demoUrl.replace(/^https?:\/\//, "").split("/")[0]} ↗
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Clean Editorial Details matching Reference Image 1 on White */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div className="space-y-3">
              <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {product.category || "4K DIGITAL ASSET"}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.08]">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  Rs. {price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-base font-bold text-slate-400 line-through">
                    Rs. {originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">Taxes included.</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Pill Action Buttons */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => (inCart ? removeItem(cartItem.id) : addItem(cartItem))}
                className={`w-full rounded-full py-3.5 text-sm font-black uppercase tracking-wider border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  inCart
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "bg-white hover:bg-slate-50 border-slate-900 text-slate-900"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{inCart ? "Remove from cart ✓" : "Add to cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full rounded-full py-3.5 text-sm font-black uppercase tracking-wider text-white bg-slate-950 hover:bg-slate-800 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Buy it now</span>
              </button>
            </div>

            {/* Features & Included Files */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
                What&apos;s Included
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {featuresList.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* License Terms Section (Matching Reference Image 1) */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="flex items-center gap-2 font-black text-slate-900">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>License Terms: Personal Use Only</span>
              </div>
              <p className="text-slate-600">
                By purchasing this item, you are granted a license for{" "}
                <strong className="text-slate-900">personal use only</strong>. Commercial use in
                any form is <strong className="text-slate-900">strictly prohibited</strong>. You are{" "}
                <strong className="text-slate-900">
                  not allowed to resell, redistribute, or use this product for merchandise or on
                  any third-party platforms
                </strong>
                . Any violation of these terms — including unauthorized resale or commercial use —
                will result in legal action.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Video Before & After Comparison (ONLY CC & Preset products) */}
        {isCcOrPresetProduct(product) && product.comparisonEnabled !== false && (
          <div className="mt-14">
            <VideoBeforeAfterSlider
              beforeVideoUrl={product.beforeVideoUrl || ""}
              afterVideoUrl={product.afterVideoUrl || product.videoUrl || product.demoUrl || ""}
              poster={product.comparisonThumbnail || product.coverImage}
              defaultSplit={product.comparisonSettings?.defaultSplit}
              displayOrder={product.comparisonSettings?.displayOrder}
            />
          </div>
        )}
      </div>
    </div>
  );
}
