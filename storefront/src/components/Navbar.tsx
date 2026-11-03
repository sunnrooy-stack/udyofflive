"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import BrandLogo from "./BrandLogo";
import AuthVerificationModal from "./AuthVerificationModal";
import { recordUserSearch, getUserSearches } from "@/lib/personalization";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Layers,
  Flame,
  Clock,
  Compass,
} from "lucide-react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.itemCount());

  const syncUserToBackend = async (uData: any) => {
    if (!uData || !uData.email) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com";
      fetch(`${apiUrl}/api/auth/verify-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uData.displayName || uData.name || uData.email.split("@")[0],
          email: uData.email,
          dateOfBirth: uData.dateOfBirth || "N/A",
          professionalRole: uData.role || uData.professionalRole || "Freelancer",
        }),
      }).catch(() => null);
    } catch (e) {}
  };

  const checkVerifiedUser = () => {
    try {
      const stored = localStorage.getItem("verified_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setVerifiedUser(parsed);
        syncUserToBackend(parsed);
        setRecentSearches(getUserSearches(parsed.email));
      } else {
        setVerifiedUser(null);
        setRecentSearches(getUserSearches("guest"));
      }
    } catch (e) {}
  };

  useEffect(() => {
    setMounted(true);
    checkVerifiedUser();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        syncUserToBackend(currentUser);
      }
      checkVerifiedUser();
    });
    return () => unsubscribe();
  }, []);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const q = query.trim();
    recordUserSearch(q, verifiedUser?.email || user?.email);
    setSearchFocused(false);
    window.location.href = `/products?search=${encodeURIComponent(q)}`;
  };

  const categoryLinks = [
    { name: "Thumbnail PSDs", href: "/products?category=thumbnail-pack", icon: "🎨" },
    { name: "After Effects CC Enhancers", href: "/cc-explore", icon: "✨" },
    { name: "Manga & Anime Animation", href: "/products?category=manga", icon: "💥" },
    { name: "Gaming Character Packs", href: "/products?category=character-pack", icon: "🎮" },
    { name: "VFX Box & Overlays", href: "/products?category=vfx", icon: "📦" },
    { name: "3D Text Effects PSD", href: "/products?category=text-effects", icon: "🔤" },
    { name: "Color LUTs & Presets", href: "/products?category=presets", icon: "🎬" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-18 px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <BrandLogo size="md" />

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Home
          </Link>
          <Link href="/products" className="hover:text-sky-600 transition-colors flex items-center gap-1">
            <Compass className="w-4 h-4 text-sky-500" />
            Explore
          </Link>

          {/* Categories Dropdown */}
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              onMouseEnter={() => setCategoriesOpen(true)}
              className="flex items-center gap-1 hover:text-sky-600 transition-colors cursor-pointer py-2"
            >
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`} />
            </button>

            {categoriesOpen && (
              <div
                onMouseLeave={() => setCategoriesOpen(false)}
                className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
              >
                {categoryLinks.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/products?sort=newest" className="hover:text-sky-600 transition-colors flex items-center gap-1">
            <Clock className="w-4 h-4 text-emerald-500" />
            New Arrivals
          </Link>
          <Link href="/products?sort=popular" className="hover:text-sky-600 transition-colors flex items-center gap-1">
            <Flame className="w-4 h-4 text-rose-500" />
            Best Sellers
          </Link>
        </nav>

        {/* Live Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative" ref={searchContainerRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={verifiedUser ? `Search presets & PSDs for ${verifiedUser.role || "you"}...` : "Search PSDs, CC Enhancers, Overlays..."}
            value={searchQuery}
            onFocus={() => {
              setSearchFocused(true);
              setRecentSearches(getUserSearches(verifiedUser?.email || user?.email));
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit(searchQuery);
              }
            }}
            className="w-full bg-slate-100/90 border border-slate-200/90 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all shadow-inner"
          />

          {/* Recent Searches Suggestions */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Search
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(recentSearches.length > 0 ? recentSearches : ["Thumbnail PSD", "CC Enhancer", "Manga Pack", "Character VFX", "Free Fire"]).map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearchSubmit(term);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-slate-100 hover:bg-sky-500 hover:text-white transition-all text-slate-700 cursor-pointer"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Wishlist, Cart, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Icon */}
          <Link
            href="/products?filter=wishlist"
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-slate-700 hover:text-rose-500 transition-colors" />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            href="/checkout"
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5 text-slate-700 hover:text-sky-600 transition-colors" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Auth / Profile */}
          {user || verifiedUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 text-white font-black text-xs flex items-center justify-center uppercase shadow-sm">
                  {(verifiedUser?.name || user?.displayName || "U").charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[90px] truncate">
                  {verifiedUser?.name || user?.displayName || "Creator"}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 text-xs space-y-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">
                      {verifiedUser?.name || user?.displayName || "Verified Creator"}
                    </p>
                    <p className="text-slate-500 truncate text-[11px]">
                      {verifiedUser?.email || user?.email || ""}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-semibold"
                  >
                    Dashboard & Orders
                  </Link>
                  <button
                    onClick={async () => {
                      if (auth) await signOut(auth).catch(() => null);
                      localStorage.removeItem("verified_user");
                      setUser(null);
                      setVerifiedUser(null);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-semibold cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-95 transition-all shadow-md cursor-pointer"
              >
                Join Free
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit(searchQuery);
                  setMobileOpen(false);
                }
              }}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="flex flex-col space-y-1 font-semibold text-slate-800 text-sm">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              Explore All Products
            </Link>
            <Link
              href="/cc-explore"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 text-sky-600 font-bold"
            >
              ⚡ CC Enhancers Vault
            </Link>
            <Link
              href="/products?sort=newest"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              New Arrivals
            </Link>
            <Link
              href="/products?sort=popular"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              Best Sellers
            </Link>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerifiedSuccess={(userData) => {
          setIsAuthModalOpen(false);
          setVerifiedUser(userData);
        }}
        actionTitle="accessing your creator vault"
      />
    </header>
  );
}
