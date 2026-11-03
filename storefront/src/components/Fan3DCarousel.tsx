"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

export interface CarouselItem {
  id: string;
  title: string;
  category: string;
  price: number;
  coverImage: string;
  badge?: string;
  description?: string;
}

interface Fan3DCarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    id: "hero-1",
    title: "Ultra HDR YouTube Thumbnail Pack PSD",
    category: "Photoshop PSD",
    price: 499,
    coverImage: "/images/yt-showcase/yt-preeti-live.jpg",
    badge: "BESTSELLER",
    description: "Multi-layered 8K creator thumbnails with editable lighting & glow.",
  },
  {
    id: "hero-2",
    title: "Anime & Manga Cinematic CC Enhancer",
    category: "After Effects CC",
    price: 699,
    coverImage: "/images/yt-showcase/yt-satvik-face-reveal.jpg",
    badge: "TRENDING",
    description: "Hollywood level color grading presets for PC and Mobile editors.",
  },
  {
    id: "hero-3",
    title: "Pro Creator Custom Gaming Suite 2026",
    category: "Full Asset Bundle",
    price: 899,
    coverImage: "/images/yt-showcase/yt-creator-custom.jpg",
    badge: "HOT VIP",
    description: "Includes overlays, animated alerts, 3D text and sound FX.",
  },
  {
    id: "hero-4",
    title: "Neon Cyberpunk Free Fire Max Suite",
    category: "Gaming Graphics",
    price: 399,
    coverImage: "/images/yt-showcase/yt-krish-gaming.jpg",
    badge: "NEW",
    description: "Vibrant high-contrast lightning effects and 3D character cuts.",
  },
  {
    id: "hero-5",
    title: "Vintage Japanese Samurai Manga Shading",
    category: "After Effects Presets",
    price: 549,
    coverImage: "/images/yt-showcase/yt-priti-samurai.jpg",
    badge: "EXCLUSIVE",
    description: "Dynamic ink motion graphics, half-tone filters and speedlines.",
  },
];

export default function Fan3DCarousel({
  items = [],
  autoPlayInterval = 4500,
}: Fan3DCarouselProps) {
  const carouselItems = items.length >= 3 ? items : DEFAULT_ITEMS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  }, [carouselItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  }, [carouselItems.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoPlayInterval]);

  const getItemAtOffset = (offset: number) => {
    const len = carouselItems.length;
    const index = (currentIndex + offset + len * 10) % len;
    return { item: carouselItems[index], originalIndex: index };
  };

  const activeItem = carouselItems[currentIndex];

  return (
    <div
      className="relative w-full max-w-5xl mx-auto px-4 py-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[320px] bg-gradient-to-r from-sky-500/25 via-indigo-600/30 to-purple-600/25 blur-3xl rounded-full transform-gpu" />
      </div>

      {/* 3D Carousel Stage */}
      <div className="relative h-[340px] sm:h-[400px] md:h-[460px] flex items-center justify-center perspective-[1200px]">
        {[-2, -1, 0, 1, 2].map((offset) => {
          const { item, originalIndex } = getItemAtOffset(offset);
          const isCenter = offset === 0;

          // Compute 3D transform properties
          const xTranslation = offset * (typeof window !== "undefined" && window.innerWidth < 640 ? 110 : 210);
          const zTranslation = -Math.abs(offset) * 110;
          const rotateY = offset * -18;
          const scale = isCenter ? 1 : 1 - Math.abs(offset) * 0.16;
          const opacity = isCenter ? 1 : Math.max(0.3, 0.9 - Math.abs(offset) * 0.28);
          const zIndex = 20 - Math.abs(offset) * 5;

          return (
            <motion.div
              key={`${item.id}-${originalIndex}`}
              className="absolute cursor-pointer will-change-transform"
              style={{
                zIndex,
              }}
              animate={{
                x: xTranslation,
                z: zTranslation,
                rotateY: rotateY,
                scale: scale,
                opacity: opacity,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
              onClick={() => {
                if (offset !== 0) {
                  setCurrentIndex(originalIndex);
                }
              }}
            >
              <div
                className={`relative w-[260px] sm:w-[320px] md:w-[380px] aspect-[16/10] rounded-2xl overflow-hidden transition-all duration-300 ${
                  isCenter
                    ? "ring-2 ring-sky-400 shadow-[0_20px_50px_rgba(56,189,248,0.35)] bg-slate-900"
                    : "ring-1 ring-white/10 shadow-xl bg-slate-950/80 hover:ring-white/30"
                }`}
              >
                {/* Thumbnail Image */}
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/yt-showcase/yt-preeti-live.jpg";
                  }}
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Badge */}
                {item.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {item.badge}
                    </span>
                  </div>
                )}

                {/* Category Pill */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
                    {item.category}
                  </span>
                </div>

                {/* Card Bottom Details */}
                <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end">
                  <h3 className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-sky-300">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-white/60">Price:</span>
                      <span className="text-base font-black text-sky-400">
                        ₹{item.price}
                      </span>
                    </div>
                    {isCenter && (
                      <Link
                        href={`/product?id=${item.id}`}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-950 hover:bg-sky-400 hover:text-white transition-colors flex items-center gap-1 shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Explore <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 inset-x-2 sm:inset-x-8 pointer-events-none z-30">
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="pointer-events-auto p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="pointer-events-auto p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-4 z-20 relative">
        {carouselItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? "w-8 bg-gradient-to-r from-sky-400 to-indigo-500 shadow-md shadow-sky-500/50"
                : "w-2 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
