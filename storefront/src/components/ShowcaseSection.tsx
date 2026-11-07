"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard, { Product } from "./ProductCard";

interface ShowcaseSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  products: Product[];
  aspectRatio?: "video" | "square" | "portrait" | "2:1" | "600:550" | "600:706" | "600:692";
  onRequireAuth?: () => void;
  badge?: string;
}

export default function ShowcaseSection({
  id,
  title,
  subtitle,
  viewAllHref = "/products",
  products = [],
  aspectRatio = "video",
  onRequireAuth,
  badge,
}: ShowcaseSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const progress = scrollLeft / maxScroll;
        const totalDots = Math.min(products.length, 7);
        const index = Math.round(progress * (totalDots - 1));
        setActiveDot(index);
      }
    }
  };

  if (!products || products.length === 0) return null;

  const totalDots = Math.min(products.length, 7);

  return (
    <section id={id} className="w-full bg-white py-10 border-b border-slate-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>

          <div className="flex items-center gap-3 shrink-0">
            {/* View All Link */}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors group"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Carousel Container with Floating Left & Right Arrows */}
        <div className="relative group/carousel">
          {/* Floating Left Arrow */}
          {products.length > 1 && (
            <button
              onClick={() => scroll("left")}
              aria-label="Previous Products"
              className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-slate-200/90 flex items-center justify-center text-slate-800 hover:text-sky-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Floating Right Arrow */}
          {products.length > 1 && (
            <button
              onClick={() => scroll("right")}
              aria-label="Next Products"
              className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-slate-200/90 flex items-center justify-center text-slate-800 hover:text-sky-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Horizontal Slider */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1 py-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {products.map((product) => {
              const is3dChar =
                aspectRatio === "600:692" ||
                product.aspectRatio === "600:692" ||
                product.aspectRatio === "600/692" ||
                product.sectionSlug === "3d-character" ||
                (product.category && product.category.toLowerCase().includes("character"));

              const isGlowAnime =
                !is3dChar && (
                  aspectRatio === "600:706" ||
                  product.aspectRatio === "600:706" ||
                  product.aspectRatio === "600/706" ||
                  product.sectionSlug === "glow-anime-logo" ||
                  (product.category && product.category.toLowerCase().includes("glow anime"))
                );

              const is4k =
                !is3dChar &&
                !isGlowAnime && (
                  aspectRatio === "600:550" ||
                  product.aspectRatio === "600:550" ||
                  product.aspectRatio === "600/550" ||
                  product.sectionSlug === "4k-backgrounds" ||
                  (product.category && product.category.toLowerCase().includes("background"))
                );

              const is2to1 =
                !is3dChar &&
                !isGlowAnime &&
                !is4k && (
                  aspectRatio === "2:1" ||
                  product.aspectRatio === "2:1" ||
                  product.sectionSlug === "text-effects" ||
                  (product.category && product.category.toLowerCase().includes("text"))
                );

              return (
                <div
                  key={product.id}
                  className={
                    is3dChar
                      ? "w-[245px] sm:w-[270px] md:w-[290px] shrink-0"
                      : isGlowAnime
                      ? "w-[240px] sm:w-[265px] md:w-[285px] shrink-0"
                      : is4k
                      ? "w-[270px] sm:w-[295px] md:w-[325px] shrink-0"
                      : is2to1
                      ? "w-[300px] sm:w-[350px] md:w-[390px] shrink-0"
                      : "w-[260px] sm:w-[285px] md:w-[310px] shrink-0"
                  }
                  style={{ scrollSnapAlign: "start" }}
                >
                  <ProductCard
                    product={product}
                    aspectRatio={aspectRatio}
                    onRequireAuth={onRequireAuth}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Pagination Dots */}
        {totalDots > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (scrollRef.current) {
                    const clientWidth = scrollRef.current.clientWidth;
                    scrollRef.current.scrollTo({
                      left: idx * (clientWidth * 0.7),
                      behavior: "smooth",
                    });
                  }
                }}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeDot
                    ? "w-6 bg-slate-900 shadow-sm"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
