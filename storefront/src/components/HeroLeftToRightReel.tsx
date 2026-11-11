"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Play } from "lucide-react";

export interface HeroReelItem {
  id: string;
  title: string;
  price?: number;
  coverImage: string;
  videoUrl?: string;
  badge?: string;
  category?: string;
  href?: string;
}

const DEFAULT_HERO_REEL: HeroReelItem[] = [
  {
    id: "hero-yt-1",
    title: "Preeti Live Free Fire Max 8K PSD",
    coverImage: "/images/yt-showcase/yt-preeti-live.jpg",
    videoUrl: "/hero-wallpaper.mp4",
    badge: "BESTSELLER",
    category: "YouTube PSD",
    price: 499,
  },
  {
    id: "hero-yt-2",
    title: "Puja Pink Sakura Stream Overlay",
    coverImage: "/images/yt-showcase/yt-puja-pink.jpg",
    videoUrl: "/hero-wallpaper.mp4",
    badge: "TRENDING",
    category: "Stream Pack",
    price: 399,
  },
  {
    id: "hero-yt-3",
    title: "Sejal Vintage Retro Special Live",
    coverImage: "/images/yt-showcase/yt-sejal-vintage.jpg",
    videoUrl: "/hero-wallpaper.mp4",
    badge: "VIRAL",
    category: "Vibrant CC",
    price: 549,
  },
  {
    id: "hero-yt-4",
    title: "Syco Killer Obsessed With Me Thriller",
    coverImage: "/images/yt-showcase/yt-syco-thriller.jpg",
    videoUrl: "/hero-wallpaper.mp4",
    badge: "HOT PICK",
    category: "Thriller PSD",
    price: 599,
  },
  {
    id: "hero-yt-5",
    title: "Habibi 1M Celebration Special Q&A",
    coverImage: "/images/yt-showcase/yt-habibi-1m.jpg",
    videoUrl: "/hero-wallpaper.mp4",
    badge: "1M SPECIAL",
    category: "Vlog PSD",
    price: 449,
  },
];

function HeroCard({ item }: { item: HeroReelItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSource = item.videoUrl || "/hero-wallpaper.mp4";

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleClick = () => {
    if (item.href) {
      window.location.href = item.href;
    } else if (item.id && !item.id.startsWith("hero-yt")) {
      window.location.href = `/product/${item.id}`;
    } else {
      window.location.href = "/products";
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-[340px] sm:w-[480px] md:w-[620px] lg:w-[760px] xl:w-[860px] aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-white/20 shrink-0 transform transition-all duration-300 hover:scale-[1.02] hover:z-30 hover:border-sky-400 hover:shadow-[0_20px_60px_rgba(56,189,248,0.4)] cursor-pointer group select-none shadow-2xl"
    >
      {/* 1. Full Photo Thumbnail: Initially moving left-to-right */}
      <img
        src={item.coverImage}
        alt={item.title}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isHovered && isPlaying ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/images/yt-showcase/yt-preeti-live.jpg";
        }}
      />

      {/* 2. Full Video: Plays automatically when mouse arrow hovers */}
      <video
        ref={videoRef}
        src={videoSource}
        muted
        loop
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Subtle bottom vignette so thumbnail art stays crisp & vibrant */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none transition-opacity duration-300" />

      {/* Top Badges */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-none z-10">
        <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md text-[11px] sm:text-xs font-black uppercase tracking-wider text-white border border-white/20 shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          {item.badge || "EXCLUSIVE"}
        </span>
        {isHovered ? (
          <span className="px-3 py-1 rounded-full bg-rose-600/95 text-[11px] sm:text-xs font-black uppercase text-white tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            LIVE VIDEO PLAYING
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-bold text-white/90 border border-white/10">
            {item.category || "PRO 8K"}
          </span>
        )}
      </div>

      {/* Bottom Title & Price */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex flex-col justify-end z-10 pointer-events-none">
        <h4 className="text-white font-black text-base sm:text-xl md:text-2xl leading-tight line-clamp-1 group-hover:text-sky-300 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {item.title}
        </h4>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-xs sm:text-sm">
          <span className="text-white/80 font-semibold text-xs sm:text-sm flex items-center gap-1.5">
            {isHovered ? "🎬 Hovering - Video Playing" : "Hover mouse to play video preview"}
          </span>
          {item.price !== undefined && item.price > 0 && (
            <span className="font-black text-sky-400 text-base sm:text-lg drop-shadow">
              ₹{item.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HeroLeftToRightReel({
  customItems = [],
}: {
  customItems?: HeroReelItem[];
}) {
  const [items, setItems] = useState<HeroReelItem[]>(
    customItems.length > 0 ? customItems : DEFAULT_HERO_REEL
  );
  const [isReelPaused, setIsReelPaused] = useState(false);

  // Dynamic API Fetch to sync with Admin Panel "hero" section
  useEffect(() => {
    let isMounted = true;
    async function fetchHeroItems() {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const envApi = process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
        : "";
      const endpoints = isLocal
        ? [
            `http://localhost:5000/api/products?t=${Date.now()}`,
            `${envApi}/api/products?t=${Date.now()}`,
            `https://udyofflive1111111111.onrender.com/api/products?t=${Date.now()}`,
          ]
        : [
            `${envApi}/api/products?t=${Date.now()}`,
            `https://udyofflive1111111111.onrender.com/api/products?t=${Date.now()}`,
            `http://localhost:5000/api/products?t=${Date.now()}`,
          ];

      let raw: any[] = [];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              raw = data;
              break;
            }
          }
        } catch (e) {}
      }

      // Check admin local storage
      let local: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) local = JSON.parse(stored);
      } catch (e) {}

      const all = [...raw, ...local];
      const heroItems = all.filter(
        (p: any) =>
          p.sectionSlug === "hero" ||
          p.sectionSlug === "hero-showcase" ||
          (p.category && p.category.toLowerCase().includes("hero"))
      );

      if (isMounted && heroItems.length > 0) {
        const mapped: HeroReelItem[] = heroItems.map((p: any) => ({
          id: String(p.id),
          title: p.title || "Hero Showcase Item",
          price: Number(p.price) || 0,
          coverImage: p.coverImage || "/images/yt-showcase/yt-preeti-live.jpg",
          videoUrl: p.videoUrl || p.demoUrl || "/hero-wallpaper.mp4",
          badge: Array.isArray(p.tags) && p.tags[0] ? p.tags[0] : "HERO EXCLUSIVE",
          category: p.category || "Hero Showcase",
        }));
        setItems(mapped);
      }
    }

    fetchHeroItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // Normalize items so we always have enough to seamlessly loop from -50% to 0%
  const baseItems = items.length > 0 ? items : DEFAULT_HERO_REEL;
  let normalized = [...baseItems];
  while (normalized.length < 5) {
    normalized = [...normalized, ...baseItems];
  }
  const displayItems = [...normalized, ...normalized];

  return (
    <div
      onMouseEnter={() => setIsReelPaused(true)}
      onMouseLeave={() => setIsReelPaused(false)}
      className="hero-reel-container relative w-full overflow-hidden py-4 sm:py-6 select-none group"
    >
      {/* Subtle edge masks for seamless entry/exit without hiding large parts */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-black/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-black/80 to-transparent z-20 pointer-events-none" />

      {/* FULL SIZE LEFT-TO-RIGHT Continuous Infinite Moving Reel */}
      {/* Instantly freezes when mouse arrow enters any card or the track */}
      <div
        data-marquee-track
        style={{
          animationPlayState: isReelPaused ? "paused" : "running",
        }}
        className="flex w-max gap-5 sm:gap-7 animate-marquee-reverse will-change-transform"
      >
        {displayItems.map((item, idx) => (
          <HeroCard key={`hero-reel-${item.id}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
}

