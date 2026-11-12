"use client";

import Link from "next/link";
import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function BrandLogo({
  className = "",
  size = "md",
  showText = true,
}: BrandLogoProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-12 w-12",
  };

  const textMap = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 shrink-0 group ${className}`}
    >
      {/* Transparent Geometric Purple/Magenta GV Logo */}
      <div
        className={`relative ${sizeMap[size]} shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]`}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="GEONIX VFX Logo"
        >
          <defs>
            <linearGradient id="gvGradMain" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="gvGradAccent" x1="16" y1="12" x2="58" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          {/* Geometric G Blade */}
          <path
            d="M14 14H42L35 23H21L17 31H34L29 40H11L6 31L14 14Z"
            fill="url(#gvGradMain)"
          />
          {/* Geometric V Wing */}
          <path
            d="M35 23L45 14L58 14L38 50L26 50L35 33L29 33L35 23Z"
            fill="url(#gvGradAccent)"
            opacity="0.95"
          />
          {/* Inner Neon Highlight */}
          <path
            d="M17 31H34L30 38H15L17 31Z"
            fill="#FFFFFF"
            fillOpacity="0.22"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-black ${textMap[size]} tracking-tight text-white group-hover:text-purple-200 transition-colors`}
        >
          GEONIX{" "}
          <span className="bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#06B6D4] bg-clip-text text-transparent">
            VFX
          </span>
        </span>
      )}
    </Link>
  );
}
