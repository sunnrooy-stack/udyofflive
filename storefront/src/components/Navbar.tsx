"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import BrandLogo from "./BrandLogo";
import AuthVerificationModal from "./AuthVerificationModal";
import {
  ShoppingCart,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Feedback", href: "/contact#feedback" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const itemCount = useCartStore((s) => s.itemCount());

  const syncUserToBackend = async (uData: any) => {
    if (!uData || !uData.email) return;
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://udyofflive1111111111.onrender.com";
      fetch(`${apiUrl}/api/auth/verify-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uData.displayName || uData.name || uData.email.split("@")[0],
          email: uData.email,
          dateOfBirth: uData.dateOfBirth || "N/A",
          professionalRole:
            uData.role || uData.professionalRole || "Freelancer",
        }),
      }).catch(() => null);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("verified_user");
      if (stored) {
        syncUserToBackend(JSON.parse(stored));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) syncUserToBackend(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      className={`${
        isHome ? "fixed top-0 left-0 right-0" : "sticky top-0"
      } z-50 w-full px-3 sm:px-6 lg:px-8 pt-3 pb-2 bg-transparent pointer-events-none`}
    >
      {/* Floating Glassmorphism Pill Navbar */}
      <div className="pointer-events-auto max-w-7xl mx-auto rounded-2xl bg-[#160A29]/60 backdrop-blur-xl border border-purple-500/35 shadow-[0_8px_32px_rgba(124,58,237,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] px-4 sm:px-6 h-16 flex items-center justify-between gap-4 transition-all">
        {/* LEFT: GENOIX VFX Logo & Brand Text */}
        <BrandLogo size="md" />

        {/* CENTER: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-sm font-semibold">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href.split("#")[0]);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#2A1748]/80 text-white shadow-[inset_0_0_14px_rgba(168,85,247,0.2)]"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute left-4 right-4 bottom-1.5 h-[2px] rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] shadow-[0_0_8px_#A855F7]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Cart Icon + Gradient Browse Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/checkout"
            aria-label="Shopping Cart"
            className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-purple-500/30 hover:border-purple-400/70 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#2563EB] hover:brightness-110 text-white text-xs sm:text-sm font-black shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:shadow-[0_0_32px_rgba(37,99,235,0.65)] transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Browse</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-purple-500/30 text-white flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphism Drawer */}
      {mobileOpen && (
        <div className="pointer-events-auto md:hidden max-w-7xl mx-auto mt-2 rounded-2xl bg-[#160A29]/90 backdrop-blur-xl border border-purple-500/35 p-4 space-y-2 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href.split("#")[0]);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-purple-600/25 border border-purple-400/40 text-white"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/products"
            onClick={() => setMobileOpen(false)}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#2563EB] text-white text-sm font-black shadow-[0_0_20px_rgba(124,58,237,0.45)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Browse All VFX Packs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerifiedSuccess={() => setIsAuthModalOpen(false)}
        actionTitle="accessing your creator vault"
      />
    </header>
  );
}
