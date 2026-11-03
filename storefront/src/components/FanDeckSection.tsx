"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface FanDeckCard {
  id: string;
  imageIcon: string;
  isImageSrc?: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
  bgGradient: string;
  categoryTag: "New" | "Psd" | "Popular" | "Sale" | "All";
}

const FAN_DECK_CARDS: FanDeckCard[] = [
  {
    id: "card-glow-anime",
    imageIcon: "/images/category-circles/anime-pfp.png",
    isImageSrc: true,
    title: "GLOW ANIME LOGO",
    subtitle: "50+ Glow Logos",
    buttonText: "Download",
    href: "/products?category=anime-pfp",
    bgGradient: "from-[#c084fc] via-[#a855f7] to-[#7e22ce]",
    categoryTag: "New",
  },
  {
    id: "card-char-pack",
    imageIcon: "/images/category-circles/character-pack.png",
    isImageSrc: true,
    title: "Character pack",
    subtitle: "750+ models",
    buttonText: "View All",
    href: "/products?category=character-pack",
    bgGradient: "from-[#d97706] via-[#b45309] to-[#78350f]",
    categoryTag: "Popular",
  },
  {
    id: "card-bg-pack",
    imageIcon: "/images/yt-showcase/yt-ayush-jordy.jpg",
    isImageSrc: true,
    title: "Background",
    subtitle: "200+ background",
    buttonText: "Download",
    href: "/products?category=presets",
    bgGradient: "from-[#22c55e] via-[#16a34a] to-[#14532d]",
    categoryTag: "Sale",
  },
  {
    id: "card-psd-hero",
    imageIcon: "/images/category-circles/psd.png",
    isImageSrc: true,
    title: "Thumbnail PSD",
    subtitle: "200+ Thumbnail PSD",
    buttonText: "Explore",
    href: "/products?category=thumbnail-pack",
    bgGradient: "from-[#0284c7] via-[#0369a1] to-[#0c4a6e]",
    categoryTag: "Psd",
  },
  {
    id: "card-yt-tn",
    imageIcon: "/images/yt-showcase/yt-creator-custom.jpg",
    isImageSrc: true,
    title: "Thumbnails",
    subtitle: "Trending TN",
    buttonText: "Explore",
    href: "/products?category=thumbnail-pack",
    bgGradient: "from-[#e11d48] via-[#be123c] to-[#881337]",
    categoryTag: "Popular",
  },
  {
    id: "card-gfx-box",
    imageIcon: "/images/category-circles/vfx-box.png",
    isImageSrc: true,
    title: "GFX Box",
    subtitle: "Get gfx elements",
    buttonText: "check now",
    href: "/products?category=vfx",
    bgGradient: "from-[#ca8a04] via-[#a16207] to-[#713f12]",
    categoryTag: "New",
  },
  {
    id: "card-text-pack",
    imageIcon: "/images/category-circles/text.png",
    isImageSrc: true,
    title: "Text pack",
    subtitle: "150+ text",
    buttonText: "Explore",
    href: "/products?category=text-effects",
    bgGradient: "from-[#f472b6] via-[#d946ef] to-[#a21caf]",
    categoryTag: "Sale",
  },
];

interface FanDeckSectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  badge?: string;
}

export default function FanDeckSection({
  id = "most-popular-fan",
  title = "Most popular",
}: FanDeckSectionProps = {}) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeIndex, setActiveIndex] = useState(3); // Start with center card (Thumbnail PSD)

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % FAN_DECK_CARDS.length);
  }, []);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + FAN_DECK_CARDS.length) % FAN_DECK_CARDS.length);
  }, []);

  const filterButtons = ["New", "Psd", "Popular", "Sale"];

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    const targetIdx = FAN_DECK_CARDS.findIndex((c) => c.categoryTag === filter);
    if (targetIdx !== -1) {
      setActiveIndex(targetIdx);
    }
  };

  return (
    <section
      id="most-popular-fan"
      className="relative w-full py-12 select-none overflow-hidden border-b border-slate-200"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "36px 36px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Matching Screenshot Exactly */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Most popular
            </h2>
            <span className="text-xs sm:text-sm font-medium text-slate-400">
              Categories
            </span>
            <div className="flex items-center gap-2 ml-1">
              {filterButtons.map((filter) => {
                const isActive = selectedFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white/90 text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fanning Card Animation Stage Matching Screenshot */}
        <div className="relative w-full h-[370px] sm:h-[430px] md:h-[480px] flex items-center justify-center perspective-[1200px] my-6">
          {FAN_DECK_CARDS.map((card, idx) => {
            const numCards = FAN_DECK_CARDS.length;
            let offset = idx - activeIndex;
            if (offset > numCards / 2) offset -= numCards;
            if (offset < -numCards / 2) offset += numCards;

            const isCenter = offset === 0;

            // Accurate 3D Fan geometry
            const xTranslation = offset * 115;
            const yTranslation = Math.abs(offset) * 18 - (isCenter ? 14 : 0);
            const rotationZ = offset * 6.5;
            const scale = isCenter ? 1.15 : Math.max(0.78, 1 - Math.abs(offset) * 0.08);
            const zIndex = 30 - Math.abs(offset) * 3;
            const opacity = Math.abs(offset) > 3 ? 0 : isCenter ? 1 : Math.max(0.65, 1 - Math.abs(offset) * 0.12);

            return (
              <motion.div
                key={card.id}
                className="absolute cursor-pointer will-change-transform"
                style={{
                  zIndex,
                }}
                animate={{
                  x: xTranslation,
                  y: yTranslation,
                  rotateZ: rotationZ,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 24,
                }}
                onClick={() => setActiveIndex(idx)}
              >
                {/* Glowing Blue Light Outer Halo around Center Card */}
                {isCenter && (
                  <div className="absolute -inset-2.5 rounded-[40px] bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 opacity-80 blur-md -z-10 pointer-events-none drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]" />
                )}

                {/* Single Fanned Card */}
                <div
                  className={`relative w-[190px] sm:w-[220px] md:w-[240px] h-[270px] sm:h-[310px] md:h-[340px] rounded-[32px] p-5 flex flex-col justify-between shadow-2xl transition-all duration-300 bg-gradient-to-b ${card.bgGradient} ${
                    isCenter
                      ? "shadow-[0_0_35px_rgba(56,189,248,0.75),0_25px_50px_rgba(0,0,0,0.25)] hover:scale-[1.02]"
                      : "shadow-lg hover:brightness-105"
                  }`}
                >
                  {/* Top: Black App Icon Square */}
                  <div className="flex items-center justify-center pt-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 shadow-xl flex items-center justify-center p-2.5 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                      <img
                        src={card.imageIcon}
                        alt={card.title}
                        className="w-full h-full object-contain filter drop-shadow-md"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/category-circle-strip.png";
                        }}
                      />
                    </div>
                  </div>

                  {/* Middle / Bottom Content */}
                  <div className="flex flex-col items-center text-center mt-auto">
                    {/* Glassmorphic Pill Button */}
                    <Link
                      href={card.href}
                      onClick={(e) => {
                        if (!isCenter) {
                          e.preventDefault();
                          setActiveIndex(idx);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2.5 transition-all ${
                        isCenter
                          ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 shadow-md hover:scale-105"
                          : "bg-white/20 text-white/90 hover:bg-white/30 backdrop-blur-sm"
                      }`}
                    >
                      {card.buttonText}
                    </Link>

                    {/* Card Title */}
                    <h3 className="font-black text-lg sm:text-xl leading-tight text-white drop-shadow-sm">
                      {card.title}
                    </h3>

                    {/* Card Subtitle */}
                    <p className="text-[11px] sm:text-xs font-semibold mt-1 text-white/90 line-clamp-1">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Circular Controls Matching Screenshot Exactly */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
            onClick={prevCard}
            aria-label="Previous Fan Card"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextCard}
            aria-label="Next Fan Card"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
