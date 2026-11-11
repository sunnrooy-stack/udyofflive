"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Flame, Volume2, VolumeX } from "lucide-react";
import HeroLeftToRightReel from "./HeroLeftToRightReel";

interface HeroSectionProps {
  carouselItems?: any[];
}

export default function HeroSection({ carouselItems = [] }: HeroSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black pt-28 pb-16 isolate">
      {/* 16:9 Looping Live Wallpaper Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center scale-105 opacity-80 transition-opacity duration-700"
        >
          <source
            src="https://res.cloudinary.com/dh0qmflg7/video/upload/v1793469435/vidssave.com_Halloween_Spooky_Cemetery_Projection_Loop_with_Music_1080P_wmqwic.mp4"
            type="video/mp4"
          />
          <source src="/hero-wallpaper.mp4" type="video/mp4" />
        </video>
        {/* Subtle cinematic gradient vignette for seamless blend & readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_70%)] pointer-events-none" />
      </div>

      {/* Floating Audio Toggle Button */}
      <div className="absolute top-28 right-4 sm:right-8 z-20">
        <button
          type="button"
          onClick={toggleSound}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 border border-white/20 text-white/90 hover:text-white backdrop-blur-md transition-all text-xs font-semibold cursor-pointer shadow-lg active:scale-95"
          title={isMuted ? "Unmute Live Wallpaper Music" : "Mute Live Wallpaper Music"}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Audio Off</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Playing Sound</span>
            </>
          )}
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Main Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
        >
          Everything You Need{" "}
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 drop-shadow-[0_4px_24px_rgba(56,189,248,0.5)]">
            to Create Without Limits.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        >
          Download hyper-realistic YouTube thumbnail PSDs, cinematic After Effects CC enhancers, manga packs, 4K overlays, and presets crafted for elite creators.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="/products"
            className="px-8 py-3.5 rounded-full text-sm font-extrabold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 shadow-[0_4px_25px_rgba(56,189,248,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            Explore Now
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#categories"
            className="px-7 py-3.5 rounded-full text-sm font-bold text-white/90 bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            Browse Categories
          </a>
        </motion.div>

        {/* Left-to-Right Moving Reel with Video On Hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full mt-10"
        >
          <HeroLeftToRightReel />
        </motion.div>
      </div>
    </section>
  );
}
