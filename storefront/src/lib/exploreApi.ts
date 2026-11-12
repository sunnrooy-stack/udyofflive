"use client";

export interface ExploreProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  sectionSlug?: string;
  coverImage: string;
  previewMedia?: string[];
  tags?: string[];
  rating: number;
  salesCount?: number;
  fileUrls?: string[];
  sellerName?: string;
  accentColor?: string;
  formatLabel?: string;
}

const ACCENT_COLORS = [
  "#FF642D",
  "#D97706",
  "#0EA5E9",
  "#10B981",
  "#8B5CF6",
  "#E11D48",
];

export function normalizeExploreProduct(p: any, idx = 0): ExploreProduct {
  const price = Number(p.price) || 299;
  const originalPrice =
    Number(p.originalPrice) > price
      ? Number(p.originalPrice)
      : Math.round(price * 1.45);

  return {
    id: String(p.id),
    title: p.title || "Premium Creator Asset",
    description:
      p.description ||
      "Production-ready digital toolkit crafted for creators, editors, and designers with lifetime updates.",
    price,
    originalPrice,
    category: p.category || "Digital Toolkit",
    sectionSlug: p.sectionSlug || "",
    coverImage:
      p.coverImage ||
      "/images/yt-showcase/yt-preeti-live.jpg",
    previewMedia: Array.isArray(p.previewMedia) ? p.previewMedia : [],
    tags: Array.isArray(p.tags) ? p.tags : ["BESTSELLER"],
    rating: typeof p.rating === "number" ? p.rating : 4.9,
    salesCount: Number(p.salesCount) || 140 + ((idx * 37) % 320),
    fileUrls: Array.isArray(p.fileUrls) ? p.fileUrls : [],
    sellerName: p.sellerName || "Studio Shelf",
    accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length],
    formatLabel: p.sectionSlug
      ? String(p.sectionSlug).replace(/-/g, " ").toUpperCase()
      : "DIGITAL PACK",
  };
}

export async function fetchExploreProducts(): Promise<ExploreProduct[]> {
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
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("admin_local_products");
      if (stored) localItems = JSON.parse(stored);
    } catch (e) {}
  }

  let deletedIds: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const d = localStorage.getItem("admin_deleted_products");
      if (d) deletedIds = JSON.parse(d);
    } catch (e) {}
  }

  const map = new Map<string, any>();
  [...rawItems, ...localItems].forEach((p) => {
    if (p && p.id && !deletedIds.includes(String(p.id))) {
      map.set(String(p.id), p);
    }
  });

  return Array.from(map.values()).map((p, i) => normalizeExploreProduct(p, i));
}

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocal) return "http://localhost:5000";
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://udyofflive1111111111.onrender.com"
  ).replace(/\/$/, "");
}
