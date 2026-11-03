"use client";

import Link from "next/link";
import React from "react";
import BrandLogo from "./BrandLogo";
import { Sparkles, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="lg" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India&apos;s premier digital marketplace for video editors, YouTube creators, graphic artists, and game streamers. Elevate your content with industry-standard assets.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products?category=thumbnail-pack" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Thumbnail PSDs
                </Link>
              </li>
              <li>
                <Link href="/cc-explore" className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <span>CC Color Enhancers</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/products?category=manga" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Manga Animation
                </Link>
              </li>
              <li>
                <Link href="/products?category=character-pack" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Character Packs
                </Link>
              </li>
              <li>
                <Link href="/products?category=vfx" className="text-slate-400 hover:text-sky-400 transition-colors">
                  VFX Box & Overlays
                </Link>
              </li>
              <li>
                <Link href="/products?category=text-effects" className="text-slate-400 hover:text-sky-400 transition-colors">
                  3D Text Effects PSD
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-slate-400 hover:text-sky-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="text-slate-400 hover:text-sky-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?sort=popular" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/cc-explore?platform=pc" className="text-slate-400 hover:text-sky-400 transition-colors">
                  PC CC (Ae & Pr)
                </Link>
              </li>
              <li>
                <Link href="/cc-explore?platform=mobile" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Mobile CC (CapCut & AM)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Account */}
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase text-white mb-4">
              Help & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-sky-400 transition-colors">
                  My Orders & Downloads
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Creator Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms#refund" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GEONIXEDITZ Digital Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Secured with 256-bit SSL</span>
            <span>•</span>
            <span>Razorpay Payment Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
