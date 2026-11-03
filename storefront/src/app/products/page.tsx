"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cart";
import { motion } from "framer-motion";
import { recordProductView } from "@/lib/personalization";

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  sellerName: string;
  isFeatured: boolean;
  aspectRatio?: string;
}

const REAL_CATALOG_PRODUCTS: Product[] = [
  {
    id: "6ae8508c7a36210fc0dc8e0a",
    title: "ANNU PALYZ PDF",
    price: 299,
    originalPrice: 499,
    description: "PDF",
    category: "Glow anime logo",
    tags: ["NEW", "GLOW ANIME LOGO"],
    coverImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1793609839/ChatGPT_Image_Sep_27_2026_10_31_36_AM_ia3ubv.png",
    sellerName: "Admin",
    isFeatured: true,
  },
  {
    id: "6ae95fcb24ea2eb0363e9650",
    title: "PSD",
    price: 2,
    originalPrice: 3,
    description: "Thumbnail PSD collection",
    category: "Thumbnail PSD",
    tags: ["NEW", "THUMBNAIL PSD"],
    coverImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1793679196/ChatGPT_Image_Sep_27_2026_10_53_41_AM_y3n3ff.png",
    aspectRatio: "1.09:1",
    sellerName: "Admin",
    isFeatured: true,
  },
];

const gradients = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
];

function ProductsContent() {
  const { addItem, removeItem, isInCart } = useCartStore();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>(REAL_CATALOG_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTagBadge, setSelectedTagBadge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "newest">("featured");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    async function loadData() {
      let fetchedProducts: any[] | null = null;
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com").replace(/\/$/, "");
      const endpoints = [
        `${apiUrl}/api/products?t=${Date.now()}`,
        `https://digital-product-1-l3qr.onrender.com/api/products?t=${Date.now()}`,
        `http://localhost:5000/api/products?t=${Date.now()}`,
      ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { cache: "no-store" }).catch(() => null);
          if (res && res.ok) {
            const json = await res.json().catch(() => null);
            if (Array.isArray(json) && json.length > 0) {
              fetchedProducts = json;
              break;
            }
          }
        } catch (e) {}
      }

      let localProducts: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) localProducts = JSON.parse(stored);
      } catch (e) {}

      if (isMounted) {
        const baseList = Array.isArray(fetchedProducts) && fetchedProducts.length > 0 ? fetchedProducts : REAL_CATALOG_PRODUCTS;
        const map = new Map<string, any>();

        baseList.forEach((p) => {
          map.set(String(p.id), p);
        });

        localProducts.forEach((p) => {
          map.set(String(p.id), { ...map.get(String(p.id)), ...p });
        });

        const formatted: Product[] = Array.from(map.values()).map((p: any) => ({
          id: String(p.id),
          title: p.title || "Untitled Product",
          price: Number(p.price) || 0,
          originalPrice: p.originalPrice || (Number(p.price) > 0 ? Math.round(Number(p.price) * 1.45) : 0),
          coverImage: p.coverImage || "/images/demo-sections/demo-thumbnail-psd.png",
          category: p.category || "General",
          description: p.description || "",
          sellerName: p.sellerName || "Admin",
          isFeatured: p.isFeatured !== false,
          tags: Array.isArray(p.tags) ? p.tags : [],
        }));

        setProducts(formatted);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    "all",
    "Thumbnail PSD",
    "4K Backgrounds",
    "3D Character",
    "Glow anime logo",
    "3D Text Effects PSD",
  ];

  const badgeTagOptions = ["all", "FEATURED", "NEW", "POPULAR", "TRENDING", "PREMIUM"];

  const filteredProducts = products.filter((p) => {
    const pTitle = p.title || "";
    const pDesc = p.description || "";
    const pCat = p.category || "";
    const pTagsLower = (p.tags || []).map((t) => (t ? String(t).toLowerCase() : ""));
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch =
      q === "" ||
      pTitle.toLowerCase().includes(q) ||
      pDesc.toLowerCase().includes(q) ||
      pCat.toLowerCase().includes(q) ||
      pTagsLower.some((t) => t.includes(q));

    const matchesCategory =
      selectedCategory === "all" ||
      pCat.toLowerCase() === selectedCategory.toLowerCase() ||
      pCat.toLowerCase().includes(selectedCategory.toLowerCase());

    let matchesBadge = true;
    if (selectedTagBadge !== "all") {
      const pTagsUpper = (p.tags || []).map((t) => String(t).toUpperCase());
      if (selectedTagBadge === "FEATURED") {
        matchesBadge = p.isFeatured || pTagsUpper.includes("FEATURED");
      } else {
        matchesBadge = pTagsUpper.includes(selectedTagBadge);
      }
    }

    return matchesSearch && matchesCategory && matchesBadge;
  });

  const processedProducts = React.useMemo(() => {
    let list = [...filteredProducts];
    if (sortBy === "featured") {
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } else if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list.reverse();
    }
    return list;
  }, [filteredProducts, sortBy]);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full min-h-screen space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Store Products
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real products synchronized live from the Admin Panel.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search Bar + Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full max-w-lg relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search products by title, tag, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 shadow-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs font-bold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="featured">⭐ Featured First</option>
              <option value="newest">🕒 Newest Added</option>
              <option value="price-low">💵 Price: Low to High</option>
              <option value="price-high">💎 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-1">Category:</span>
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>

        {/* Badge Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-1">Badge:</span>
          {badgeTagOptions.map((badge) => {
            const isActive = selectedTagBadge === badge;
            return (
              <button
                key={badge}
                onClick={() => setSelectedTagBadge(badge)}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  isActive
                    ? badge === "FEATURED"
                      ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                      : badge === "NEW"
                      ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm"
                      : badge === "POPULAR"
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : badge === "TRENDING"
                      ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-sm"
                      : badge === "PREMIUM"
                      ? "bg-red-600 text-white border-red-500 shadow-sm"
                      : "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                {badge === "all" ? "All Badges" : badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        {loading && products.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading catalog items...</div>
        ) : processedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-base font-bold text-slate-800">No products match your search or filter.</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting "All Categories" or clearing the search query.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedTagBadge("all");
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {processedProducts.map((product, index) => {
              const inCart = mounted && isInCart(product.id);
              const gradientIndex = index % gradients.length;
              const cartItem: CartItem = {
                id: product.id,
                title: product.title,
                price: product.price,
                coverImage: product.coverImage,
                sellerName: product.sellerName || "Admin",
              };

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-200 border border-slate-200 relative group"
                  onClick={() => recordProductView(product as any)}
                >
                  <div>
                    <a href={`/product?id=${product.id}`}>
                      <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${gradients[gradientIndex]} mb-3 flex items-center justify-center relative overflow-hidden`}>
                        {product.coverImage ? (
                          <img
                            src={product.coverImage}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-white/80 text-4xl">🎨</span>
                        )}

                        {/* Feature Badge Overlay */}
                        {(() => {
                          const tagsUpper = (product.tags || []).map((t: string) => String(t).toUpperCase());
                          if (product.isFeatured || tagsUpper.includes("FEATURED")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  FEATURED
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("NEW")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  NEW
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("POPULAR")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  POPULAR
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("TRENDING")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-cyan-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  TRENDING
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("PREMIUM")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  PREMIUM
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </a>

                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                      by {product.sellerName || "Admin"}
                    </p>
                    <h3 className="font-extrabold text-base text-slate-900 mb-2 line-clamp-1">
                      {product.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <div>
                      <span className="font-black text-lg text-slate-900">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        inCart ? removeItem(product.id) : addItem(cartItem);
                      }}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                        inCart
                          ? "bg-slate-100 text-slate-700 border border-slate-300"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {inCart ? "In Cart ✓" : "+ ADD"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StorefrontProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400 text-sm">Loading Products Catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
