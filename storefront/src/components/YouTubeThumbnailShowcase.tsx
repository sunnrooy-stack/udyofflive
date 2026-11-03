"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Video } from "lucide-react";

const ROW_ONE_THUMBNAILS = [
  { id: "yt-1", src: "/images/yt-showcase/yt-preeti-live.jpg", title: "Preeti Live Free Fire Max" },
  { id: "yt-2", src: "/images/yt-showcase/yt-satvik-face-reveal.jpg", title: "Satvik Face Reveal Special" },
  { id: "yt-3", src: "/images/yt-showcase/yt-creator-custom.jpg", title: "Creator Custom Total Gaming" },
  { id: "yt-4", src: "/images/yt-showcase/yt-krish-gaming.jpg", title: "Krish Gaming Live Now" },
  { id: "yt-5", src: "/images/yt-showcase/yt-priti-samurai.jpg", title: "Priti Samurai Japanese Live" },
  { id: "yt-6", src: "/images/yt-showcase/yt-puja-pink.jpg", title: "Puja Pink Sakura Stream" },
];

const ROW_TWO_THUMBNAILS = [
  { id: "yt-7", src: "/images/yt-showcase/yt-priya-headphones.jpg", title: "Priya Gaming Headphones Vibe" },
  { id: "yt-8", src: "/images/yt-showcase/yt-sejal-vintage.jpg", title: "Sejal Vintage Retro Special" },
  { id: "yt-9", src: "/images/yt-showcase/yt-ayush-jordy.jpg", title: "Ayush No Jordy Challenge" },
  { id: "yt-10", src: "/images/yt-showcase/yt-habibi-1m.jpg", title: "Habibi 1M Celebration QnA" },
  { id: "yt-11", src: "/images/yt-showcase/yt-syco-thriller.jpg", title: "Syco Killer Thriller Tournament" },
  { id: "yt-12", src: "/images/yt-showcase/yt-preeti-live.jpg", title: "Preeti Live 8K Ultra Version" },
];

export default function YouTubeThumbnailShowcase() {
  return (
    <section className="relative w-full bg-black py-8 overflow-hidden isolate">
      {/* Row 1: Leftward Infinite Marquee */}
      <div className="relative w-full overflow-hidden mb-5 group">
        {/* Left & Right fading masks */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

        <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]">
          {[...ROW_ONE_THUMBNAILS, ...ROW_ONE_THUMBNAILS].map((item, idx) => (
            <div
              key={`row1-${item.id}-${idx}`}
              className="relative w-[280px] sm:w-[340px] md:w-[380px] aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 shrink-0 transform transition-all duration-300 hover:scale-105 hover:z-20 hover:border-sky-400/60 hover:shadow-[0_10px_30px_rgba(56,189,248,0.3)] cursor-pointer group/card"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3.5">
                <span className="text-white text-xs font-bold truncate drop-shadow-md">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Rightward Infinite Marquee */}
      <div className="relative w-full overflow-hidden group">
        {/* Left & Right fading masks */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

        <div className="flex w-max gap-4 animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...ROW_TWO_THUMBNAILS, ...ROW_TWO_THUMBNAILS].map((item, idx) => (
            <div
              key={`row2-${item.id}-${idx}`}
              className="relative w-[280px] sm:w-[340px] md:w-[380px] aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 shrink-0 transform transition-all duration-300 hover:scale-105 hover:z-20 hover:border-purple-400/60 hover:shadow-[0_10px_30px_rgba(168,85,247,0.3)] cursor-pointer group/card"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3.5">
                <span className="text-white text-xs font-bold truncate drop-shadow-md">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
