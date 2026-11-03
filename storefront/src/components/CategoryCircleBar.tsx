"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface CategoryCircleItem {
  id: string;
  name: string;
  image: string;
  href: string;
  badge?: string;
}

const CATEGORIES: CategoryCircleItem[] = [
  {
    id: "psd",
    name: "PSD",
    image: "/images/category-circles/psd.png",
    href: "/products?category=thumbnail-pack",
  },
  {
    id: "cc-enhancer",
    name: "CC Enhancer",
    image: "/images/category-circles/cc-enhancer.png",
    href: "/cc-explore",
    badge: "POPULAR",
  },
  {
    id: "manga",
    name: "Manga Animation",
    image: "/images/category-circles/manga.png",
    href: "/products?category=manga",
  },
  {
    id: "character-pack",
    name: "character pack",
    image: "/images/category-circles/character-pack.png",
    href: "/products?category=character-pack",
  },
  {
    id: "vfx-box",
    name: "VFX box",
    image: "/images/category-circles/vfx-box.png",
    href: "/products?category=vfx",
  },
  {
    id: "anime-pfp",
    name: "Anime PFP",
    image: "/images/category-circles/anime-pfp.png",
    href: "/products?category=anime-pfp",
  },
  {
    id: "text",
    name: "TEXT",
    image: "/images/category-circles/text.png",
    href: "/products?category=text-effects",
  },
];

export default function CategoryCircleBar() {
  return (
    <section className="w-full bg-white py-8 border-b border-slate-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 lg:gap-12 overflow-x-auto no-scrollbar py-2">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="flex-shrink-0"
            >
              <Link
                href={cat.href}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* Circle Container */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-slate-100 to-white shadow-sm border border-slate-200/80 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(56,189,248,0.35)] group-hover:border-sky-400">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-950">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/category-circle-strip.png";
                      }}
                    />
                  </div>

                  {cat.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full shadow">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Category Label */}
                <span className="mt-2 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors text-center whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
