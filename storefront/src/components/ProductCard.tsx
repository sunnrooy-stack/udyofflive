"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Check, Star, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { motion } from "framer-motion";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  category?: string;
  sellerName?: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  discountPercent?: number;
  tags?: string[];
  isFeatured?: boolean;
  sectionSlug?: string;
}

interface ProductCardProps {
  product: Product;
  aspectRatio?: "video" | "square" | "portrait";
  onRequireAuth?: () => void;
}

export default function ProductCard({
  product,
  aspectRatio = "video",
  onRequireAuth,
}: ProductCardProps) {
  const { addItem, removeItem, isInCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inCart = mounted ? isInCart(product.id) : false;
  const inWishlist = mounted ? isInWishlist(product.id) : false;

  const originalPrice = product.originalPrice || (product.price > 0 ? Math.round(product.price * 1.45) : 0);
  const discountPercent =
    product.discountPercent ||
    (originalPrice > product.price && product.price > 0
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : null);

  const rating = product.rating || 4.9;
  const reviewsCount = product.reviewsCount || 128;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check verified user
    try {
      const stored = localStorage.getItem("verified_user");
      const isVerified = stored ? JSON.parse(stored)?.isVerified : false;
      if (!isVerified && onRequireAuth) {
        onRequireAuth();
        return;
      }
    } catch {}

    if (inCart) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        coverImage: product.coverImage || "",
        sellerName: product.sellerName || "Admin",
      });
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      coverImage: product.coverImage,
      sellerName: product.sellerName,
      category: product.category,
    });
  };

  const isThumbnail =
    product.sectionSlug === "thumbnail-psd" ||
    (product.category && product.category.toLowerCase().includes("thumbnail")) ||
    (product.title && product.title.toLowerCase().includes("thumbnail"));

  const aspectClass = isThumbnail
    ? "aspect-[1/1.09]"
    : {
        video: "aspect-[16/10]",
        square: "aspect-square",
        portrait: "aspect-[1/1.09]",
      }[aspectRatio] || "aspect-[16/10]";

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-[0_12px_30px_rgba(56,189,248,0.18)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Thumbnail Image Container */}
        <Link href={`/product?id=${product.id}`} className="block relative overflow-hidden bg-slate-100">
          <div className={`${aspectClass} w-full overflow-hidden relative`}>
            <img
              src={product.coverImage || "/images/yt-showcase/yt-preeti-live.jpg"}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/yt-showcase/yt-preeti-live.jpg";
              }}
            />

            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Discount Badge */}
            {discountPercent && discountPercent > 0 && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-md">
                {discountPercent}% OFF
              </span>
            )}

            {/* Wishlist Button */}
            <button
              suppressHydrationWarning
              onClick={handleWishlistClick}
              aria-label="Add to Wishlist"
              className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md ${
                inWishlist
                  ? "bg-rose-50 text-rose-500 border border-rose-200 scale-105"
                  : "bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${inWishlist ? "fill-rose-500 stroke-rose-500 scale-110" : ""}`}
              />
            </button>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-4">
          {/* Seller / Creator */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
            <span>By {product.sellerName || "Verified Studio"}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span className="font-bold text-slate-700">{rating}</span>
              <span className="text-slate-400">({reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/product?id=${product.id}`}>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>
      </div>

      {/* Card Footer: Pricing & Add to Cart */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-slate-100 mt-auto">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            {product.price <= 0 ? (
              <span className="text-base font-black text-emerald-600">FREE</span>
            ) : (
              <>
                <span className="text-base font-black text-slate-900">
                  ₹{product.price}
                </span>
                {originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add to Cart CTA */}
        <button
          suppressHydrationWarning
          onClick={handleCartClick}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
            inCart
              ? "bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
              : "bg-white text-slate-800 border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
          }`}
        >
          {inCart ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>In Cart</span>
            </>
          ) : (
            <>
              <span className="font-bold text-sm leading-none">+</span>
              <span>ADD</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
