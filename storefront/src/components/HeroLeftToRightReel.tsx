"use client";

import React, { useState, useEffect, useRef } from "react";

function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0`;
  }
  return url;
}

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
    videoUrl: "https://res.cloudinary.com/demo/video/upload/snow_horses.mp4",
    badge: "TRENDING",
    category: "Stream Pack",
    price: 399,
  },
  {
    id: "hero-yt-3",
    title: "Sejal Vintage Retro Special Live",
    coverImage: "/images/yt-showcase/yt-sejal-vintage.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/kitten_fighting.mp4",
    badge: "VIRAL",
    category: "Vibrant CC",
    price: 549,
  },
  {
    id: "hero-yt-4",
    title: "Syco Killer Obsessed With Me Thriller",
    coverImage: "/images/yt-showcase/yt-syco-thriller.jpg",
    videoUrl: "https://res.cloudinary.com/dh0qmflg7/video/upload/v1793469435/vidssave.com_Halloween_Spooky_Cemetery_Projection_Loop_with_Music_1080P_wmqwic.mp4",
    badge: "HOT PICK",
    category: "Thriller PSD",
    price: 599,
  },
  {
    id: "hero-yt-5",
    title: "Habibi 1M Celebration Special Q&A",
    coverImage: "/images/yt-showcase/yt-habibi-1m.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    badge: "1M SPECIAL",
    category: "Vlog PSD",
    price: 449,
  },
  {
    id: "hero-yt-6",
    title: "Krish Gaming Ultra FPS Pack",
    coverImage: "/images/yt-showcase/yt-krish-gaming.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
    badge: "GAMING PRO",
    category: "Gaming PSD",
    price: 399,
  },
  {
    id: "hero-yt-7",
    title: "Ayush Jordy Japanese Sakura Theme",
    coverImage: "/images/yt-showcase/yt-ayush-jordy.jpg",
    videoUrl: "/hero-wallpaper.mp4",
    badge: "EXCLUSIVE",
    category: "Cinematic PSD",
    price: 499,
  },
  {
    id: "hero-yt-8",
    title: "Satvik Face Reveal Special Premiere",
    coverImage: "/images/yt-showcase/yt-satvik-face-reveal.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/snow_horses.mp4",
    badge: "PREMIERE",
    category: "Viral PSD",
    price: 549,
  },
  {
    id: "hero-yt-9",
    title: "Priya Headphones Neon Cyber Vibe",
    coverImage: "/images/yt-showcase/yt-priya-headphones.jpg",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    badge: "NEON GLOW",
    category: "Music Stream",
    price: 429,
  },
  {
    id: "hero-yt-10",
    title: "Priti Samurai Warrior 4K Action",
    coverImage: "/images/yt-showcase/yt-priti-samurai.jpg",
    videoUrl: "https://res.cloudinary.com/dh0qmflg7/video/upload/v1793469435/vidssave.com_Halloween_Spooky_Cemetery_Projection_Loop_with_Music_1080P_wmqwic.mp4",
    badge: "SAMURAI 4K",
    category: "Action Pack",
    price: 599,
  },
  {
    id: "hero-yt-11",
    title: "Creator Custom Master Suite",
    coverImage: "/images/yt-showcase/yt-creator-custom.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/kitten_fighting.mp4",
    badge: "MASTER SUITE",
    category: "Full Bundle",
    price: 699,
  },
  {
    id: "hero-yt-12",
    title: "Ultra HDR YouTube CC Enhancer",
    coverImage: "/images/demo-sections/demo-thumbnail-editing-main.png",
    videoUrl: "/hero-wallpaper.mp4",
    badge: "HDR CC",
    category: "Color Grade",
    price: 349,
  },
  {
    id: "hero-yt-13",
    title: "Mythic Kingdom 4K Backgrounds Pack",
    coverImage: "/images/demo-sections/demo-4k-backgrounds-main.png",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
    badge: "4K MATTE",
    category: "Backgrounds",
    price: 499,
  },
  {
    id: "hero-yt-14",
    title: "Sweety Queen Plays Glow Anime Logo",
    coverImage: "/images/demo-sections/demo-glow-anime-logo-main.png",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    badge: "GLOW LOGO",
    category: "Anime Vectors",
    price: 399,
  },
  {
    id: "hero-yt-15",
    title: "Elite Cyber 3D Character Renders",
    coverImage: "/images/demo-sections/demo-3d-character-main.png",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/snow_horses.mp4",
    badge: "3D ASSETS",
    category: "Character PNG",
    price: 549,
  },
];

function HeroCard({ item }: { item: HeroReelItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSource = item.videoUrl || "/hero-wallpaper.mp4";
  const isYt = isYouTubeUrl(videoSource);
  const ytEmbed = isYt ? getYouTubeEmbedUrl(videoSource) : "";

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isYt && videoRef.current) {
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
    if (!isYt && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px] aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shrink-0 transform transition-all duration-300 hover:scale-[1.03] hover:z-30 hover:border-sky-400 hover:shadow-[0_12px_45px_rgba(56,189,248,0.35)] select-none shadow-xl pointer-events-auto"
    >
      {/* 1. Pure Clean Thumbnail Photo: NO Title, NO Link, NO Price, NO etc */}
      <img
        src={item.coverImage}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isHovered && (isPlaying || isYt) ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/images/yt-showcase/yt-preeti-live.jpg";
        }}
      />

      {/* 2. Pure Clean Video: Plays automatically when mouse arrow hovers */}
      {isYt ? (
        isHovered && (
          <iframe
            src={ytEmbed}
            title="Video Preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none border-0"
          />
        )
      ) : (
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
      )}
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

  // Merge admin items first, followed by default showcase items so the reel is always rich & diverse
  const baseItems =
    items.length > 0
      ? [
          ...items,
          ...DEFAULT_HERO_REEL.filter(
            (def) => !items.some((it) => it.coverImage === def.coverImage)
          ),
        ]
      : DEFAULT_HERO_REEL;

  // Always keep at least 16 cards in normalized so track is 12,000px+ (zero empty space on right side)
  let normalized = [...baseItems];
  while (normalized.length < 16) {
    normalized = [...normalized, ...baseItems];
  }
  const displayItems = [...normalized, ...normalized];

  return (
    <div
      onMouseEnter={() => setIsReelPaused(true)}
      onMouseLeave={() => setIsReelPaused(false)}
      className="hero-reel-container relative w-full overflow-hidden py-2 sm:py-3 select-none group"
    >
      {/* Subtle left entry fade mask only; right side remains clear and unblocked */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-black/80 to-transparent z-20 pointer-events-none" />

      {/* Pure Clean YouTube Thumbnails Reel moving Left to Right */}
      {/* Instantly freezes when mouse arrow enters any card or the track */}
      <div
        data-marquee-track
        style={{
          animationPlayState: isReelPaused ? "paused" : "running",
        }}
        className="flex w-max gap-3 sm:gap-4 animate-marquee-reverse will-change-transform"
      >
        {displayItems.map((item, idx) => (
          <HeroCard key={`hero-reel-${item.id}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
}

