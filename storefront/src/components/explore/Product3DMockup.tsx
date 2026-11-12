"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ExploreProduct } from "@/lib/exploreApi";

interface Product3DMockupProps {
  product: ExploreProduct;
  size?: "shelf" | "hero";
  onClick?: () => void;
  className?: string;
}

export default function Product3DMockup({
  product,
  size = "shelf",
  onClick,
  className = "",
}: Product3DMockupProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 4, rotateY: -18 });
  const [hovered, setHovered] = useState(false);

  const isHero = size === "hero";
  const defaultY = isHero ? -22 : -18;
  const defaultX = isHero ? 6 : 5;
  const depth = isHero ? 36 : 24;
  const halfDepth = depth / 2;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 24 + 5,
      rotateY: x * 32 - 14,
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ rotateX: defaultX, rotateY: defaultY });
  };

  const badgeText =
    Array.isArray(product.tags) && product.tags[0]
      ? String(product.tags[0]).toUpperCase()
      : "BESTSELLER";

  const isNew = badgeText.includes("NEW");
  const spineColor = product.accentColor || "#FF642D";

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* 3D Physical Box / Book Wrapper */}
      <motion.div
        animate={{
          rotateX: hovered ? tilt.rotateX : defaultX,
          rotateY: hovered ? tilt.rotateY : defaultY,
          y: hovered ? (isHero ? -10 : -12) : 0,
          scale: hovered ? 1.03 : 1,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className={`relative mx-auto ${
          isHero
            ? "w-[260px] h-[340px] sm:w-[310px] sm:h-[400px]"
            : "w-[138px] h-[182px] sm:w-[155px] sm:h-[205px]"
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT COVER FACE */}
        <div
          className="absolute inset-0 rounded-r-lg rounded-l-[3px] overflow-hidden bg-[#2A1914] border border-white/15 shadow-2xl flex flex-col justify-between"
          style={{
            transform: `translateZ(${halfDepth}px)`,
            boxShadow:
              "inset 2px 0 6px rgba(255,255,255,0.22), 0 22px 45px rgba(0,0,0,0.65)",
          }}
        >
          {/* Background Cover Image */}
          <img
            src={product.coverImage}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/images/yt-showcase/yt-preeti-live.jpg";
            }}
          />

          {/* Subtle Editorial Contrast Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#17110E]/95 via-[#17110E]/25 to-[#211510]/60 pointer-events-none" />

          {/* Top Micro-Label + Specular Binding Groove */}
          <div className="relative z-10 p-2.5 sm:p-3 flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-sm font-black uppercase tracking-widest shadow-sm ${
                isHero ? "text-[10px]" : "text-[8px]"
              } ${
                isNew
                  ? "bg-[#F3EADB] text-[#17110E]"
                  : "bg-[#FF642D] text-white"
              }`}
            >
              {badgeText.slice(0, 12)}
            </span>
            <span
              className={`font-bold uppercase tracking-widest text-[#F3EADB]/80 ${
                isHero ? "text-[10px]" : "text-[7px]"
              }`}
            >
              {product.formatLabel?.slice(0, 10) || "EDITION"}
            </span>
          </div>

          {/* Bottom Editorial Title & Price */}
          <div className="relative z-10 p-2.5 sm:p-3.5">
            <div
              className="w-6 h-[2px] mb-1.5"
              style={{ backgroundColor: spineColor }}
            />
            <h4
              className={`font-black text-[#FFFFFF] leading-tight line-clamp-2 tracking-tight ${
                isHero ? "text-lg sm:text-xl" : "text-[11px] sm:text-xs"
              }`}
            >
              {product.title}
            </h4>
            <div className="mt-1.5 flex items-center justify-between">
              <span
                className={`uppercase tracking-wider font-semibold text-[#D9C9B5] truncate max-w-[65%] ${
                  isHero ? "text-[11px]" : "text-[8px]"
                }`}
              >
                {product.category}
              </span>
              <span
                className={`font-black text-[#FF642D] ${
                  isHero ? "text-sm" : "text-[10px]"
                }`}
              >
                ₹{product.price}
              </span>
            </div>
          </div>

          {/* Subtle Specular Gloss Highlight */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(125deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 42%)",
              opacity: hovered ? 0.9 : 0.45,
            }}
          />
        </div>

        {/* BACK COVER FACE */}
        <div
          className="absolute inset-0 rounded-l-lg rounded-r-[3px] bg-[#1A0F0B] border border-white/10"
          style={{
            transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
          }}
        />

        {/* LEFT 3D SPINE */}
        <div
          className="absolute top-0 bottom-0 left-0 rounded-l-sm flex items-center justify-center overflow-hidden border-y border-l border-white/10"
          style={{
            width: `${depth}px`,
            backgroundColor: spineColor,
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.16) 45%, rgba(0,0,0,0.55) 100%)",
            transform: `rotateY(-90deg) translateZ(${halfDepth}px)`,
          }}
        >
          <span
            className={`font-black uppercase tracking-[0.2em] text-white/95 whitespace-nowrap ${
              isHero ? "text-[10px]" : "text-[7px]"
            }`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {product.title.slice(0, 18)}
          </span>
        </div>

        {/* RIGHT WARM CREAM PAGE EDGES (Flush with right edge) */}
        <div
          className="absolute top-[2px] bottom-[2px] right-0"
          style={{
            width: `${depth}px`,
            background:
              "repeating-linear-gradient(90deg, #F3EADB 0px, #F3EADB 2px, #D9C9B5 2px, #D9C9B5 3px)",
            transform: `rotateY(90deg) translateZ(${halfDepth}px)`,
            boxShadow: "inset 0 0 10px rgba(33,21,16,0.35)",
          }}
        />

        {/* TOP EDGE */}
        <div
          className="absolute left-[2px] right-[2px] top-0"
          style={{
            height: `${depth}px`,
            backgroundColor: "#241611",
            transform: `rotateX(90deg) translateZ(${halfDepth}px)`,
          }}
        />

        {/* BOTTOM EDGE */}
        <div
          className="absolute left-[2px] right-[2px] bottom-0"
          style={{
            height: `${depth}px`,
            backgroundColor: "#140B08",
            transform: `rotateX(-90deg) translateZ(${halfDepth}px)`,
          }}
        />
      </motion.div>

      {/* Realistic Contact Shadow Underneath */}
      <motion.div
        animate={{
          scaleX: hovered ? 0.88 : 1,
          opacity: hovered ? 0.45 : 0.72,
        }}
        transition={{ duration: 0.25 }}
        className={`mx-auto rounded-full bg-black/80 blur-md ${
          isHero ? "w-56 h-5 mt-5" : "w-28 h-3 mt-3"
        }`}
      />
    </div>
  );
}

