"use client";

import Link from "next/link";
import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function BrandLogo({ className = "", size = "md", showText = true }: BrandLogoProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const textMap = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-3 shrink-0 group ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(59,130,246,0.35)]`}>
        <img
          src="/logo-tight.png"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/logo.png";
          }}
          alt="UDYO FF Digital Marketplace"
          className="w-full h-full object-contain filter drop-shadow-md rounded-xl"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black ${textMap[size]} tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 group-hover:opacity-90 transition-opacity`}>
            UDYO FF
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground -mt-1">
            CREATOR VAULT
          </span>
        </div>
      )}
    </Link>
  );
}
