"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Monitor, Smartphone } from "lucide-react";

function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0`;
  }
  return url;
}

export default function CCShowcaseSection() {
  const [ccProducts, setCcProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCcProducts() {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
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

      let rawItems: any[] = [];
      for (const ep of endpoints) {
        if (!ep || ep.startsWith("/")) continue;
        try {
          const res = await fetch(ep, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              rawItems = data;
              break;
            }
          }
        } catch (e) {}
      }

      let localItems: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) localItems = JSON.parse(stored);
      } catch (e) {}

      let deletedIds: string[] = [];
      try {
        const d = localStorage.getItem("admin_deleted_products");
        if (d) deletedIds = JSON.parse(d);
      } catch (e) {}

      const map = new Map();
      [...rawItems, ...localItems].forEach((p) => {
        if (p && p.id) map.set(String(p.id), p);
      });

      const filtered = Array.from(map.values())
        .filter((p: any) => !deletedIds.includes(String(p.id)))
        .filter((p: any) => {
          const sSlug = (p.sectionSlug || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();
          const pTitle = (p.title || "").toLowerCase();
          const hasCcTag =
            Array.isArray(p.tags) &&
            p.tags.some(
              (t: string) =>
                typeof t === "string" &&
                (t.toLowerCase() === "cc" ||
                  t.toLowerCase().includes("cc preset") ||
                  t.toLowerCase().includes("color correction") ||
                  t.toLowerCase().includes("lut"))
            );
          return (
            sSlug === "cc" ||
            sSlug === "cc-presets" ||
            cat === "cc" ||
            cat === "cc presets" ||
            cat.includes("color correction") ||
            pTitle.includes(" cc") ||
            pTitle.startsWith("cc ") ||
            hasCcTag
          );
        });

      if (isMounted) {
        setCcProducts(filtered);
        setLoaded(true);
      }
    }

    loadCcProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loaded || ccProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-10 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              CC Presets &amp; LUTs
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600/10 text-rose-600 border border-rose-500/20 text-[11px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              Auto-Play
            </span>
          </div>

          <Link
            href="/cc-explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-rose-600 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Auto-Playing 16:9 CC Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ccProducts.slice(0, 6).map((item) => {
            const videoSource = item.videoUrl || item.demoUrl || "/hero-wallpaper.mp4";
            const isYt = isYouTubeUrl(videoSource);
            const ytEmbed = isYt ? getYouTubeEmbedUrl(videoSource) : "";
            const pTags = Array.isArray(item.tags)
              ? item.tags.map((t: any) => String(t).toLowerCase())
              : [];
            const isMobile = pTags.some((t: string) => t.includes("mobile"));
            const isPc = pTags.some((t: string) => t.includes("pc"));

            return (
              <Link
                key={item.id}
                href={`/cc-product?id=${item.id}`}
                className="group relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 hover:border-rose-500 shadow-sm hover:shadow-[0_14px_40px_rgba(225,29,72,0.25)] transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* 16:9 Auto-Playing Video Box */}
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  {isYt ? (
                    <iframe
                      src={ytEmbed}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="w-full h-full border-0 pointer-events-none"
                    />
                  ) : (
                    <video
                      src={videoSource}
                      poster={item.coverImage}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Top Live Auto-Play Pill */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black uppercase text-white border border-white/15">
                      {isMobile && !isPc ? (
                        <>
                          <Smartphone className="w-3 h-3 text-sky-400" />
                          MOBILE CC
                        </>
                      ) : isPc && !isMobile ? (
                        <>
                          <Monitor className="w-3 h-3 text-rose-400" />
                          PC CC
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          PC + MOBILE
                        </>
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600/95 text-[10px] font-black uppercase text-white shadow-md">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      PLAYING
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 flex items-center justify-between bg-slate-950 text-white">
                  <div className="min-w-0 pr-3">
                    <h3 className="font-extrabold text-sm sm:text-base truncate group-hover:text-rose-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      16:9 Cinema CC &bull; Instant Download
                    </p>
                  </div>
                  <span className="shrink-0 font-black text-base text-rose-400">
                    ₹{item.price}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

