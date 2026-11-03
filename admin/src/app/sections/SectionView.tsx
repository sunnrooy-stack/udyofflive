"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export interface SectionConfig {
  slug: string;
  title: string;
  icon: string;
  badge: string;
  description: string;
  defaultCover: string;
  defaultAspectRatio?: string;
  defaultOrientation?: "portrait" | "landscape";
}

export const SECTIONS_CONFIG: Record<string, SectionConfig> = {
  "thumbnail-psd": {
    slug: "thumbnail-psd",
    title: "Thumbnail PSD",
    icon: "🎨",
    badge: "BESTSELLER",
    description: "Ultra 8K resolution YouTube templates with custom lighting and editable fonts.",
    defaultCover: "/images/demo-sections/demo-thumbnail-psd.png",
    defaultAspectRatio: "1.09:1",
    defaultOrientation: "portrait",
  },
  "4k-backgrounds": {
    slug: "4k-backgrounds",
    title: "4K Backgrounds",
    icon: "🖼️",
    badge: "4K ULTRA",
    description: "Ultra high-definition gaming environments, battlegrounds, and atmospheric skies.",
    defaultCover: "/images/demo-sections/demo-4k-backgrounds.png",
    defaultAspectRatio: "16:10",
    defaultOrientation: "landscape",
  },
  "3d-character": {
    slug: "3d-character",
    title: "3D Character",
    icon: "🎮",
    badge: "EXCLUSIVE",
    description: "Battle-royale character models, weapon renders, and transparent PNG cutouts.",
    defaultCover: "/images/demo-sections/demo-3d-character.png",
    defaultAspectRatio: "16:10",
    defaultOrientation: "landscape",
  },
  "glow-anime-logo": {
    slug: "glow-anime-logo",
    title: "Glow anime logo",
    icon: "✨",
    badge: "TRENDING",
    description: "Solo Leveling style glowing eyes, aura vector logos, and streaming avatars.",
    defaultCover: "/images/demo-sections/demo-glow-anime-logo.png",
    defaultAspectRatio: "16:10",
    defaultOrientation: "landscape",
  },
  "text-effects": {
    slug: "text-effects",
    title: "3D Text Effects PSD",
    icon: "🔤",
    badge: "NEW ARRIVALS",
    description: "Photoshop smart-object styles for titles, logos, and YouTube banners.",
    defaultCover: "/images/demo-sections/demo-thumbnail-psd.png",
    defaultAspectRatio: "16:10",
    defaultOrientation: "landscape",
  },
};

export function matchProductForSection(p: any, slug: string, title?: string) {
  if (!p) return false;
  const cat = (p.category || "").toLowerCase();
  const pTitle = (p.title || "").toLowerCase();
  const sSlug = (p.sectionSlug || "").toLowerCase();
  if (sSlug === slug) return true;
  if (cat === slug) return true;

  if (slug === "thumbnail-psd") {
    return (
      cat.includes("thumbnail") ||
      cat.includes("psd") ||
      pTitle.includes("thumbnail") ||
      pTitle.includes("psd")
    );
  }
  if (slug === "4k-backgrounds") {
    return (
      cat.includes("background") ||
      cat.includes("4k") ||
      pTitle.includes("background") ||
      pTitle.includes("4k")
    );
  }
  if (slug === "3d-character") {
    const hasCharTag =
      Array.isArray(p.tags) &&
      p.tags.some(
        (t: string) =>
          typeof t === "string" &&
          (t.toLowerCase().includes("character") || t.toLowerCase().includes("3d character"))
      );
    return (
      sSlug === "3d-character" ||
      cat.includes("character") ||
      pTitle.includes("character") ||
      hasCharTag
    );
  }
  if (slug === "glow-anime-logo") {
    const hasTag =
      Array.isArray(p.tags) &&
      p.tags.some(
        (t: string) =>
          typeof t === "string" &&
          (t.toLowerCase().includes("glow") || t.toLowerCase().includes("anime"))
      );
    return (
      cat.includes("glow") ||
      cat.includes("anime") ||
      pTitle.includes("glow") ||
      pTitle.includes("anime") ||
      hasTag
    );
  }
  if (slug === "text-effects") {
    const hasTextTag =
      Array.isArray(p.tags) &&
      p.tags.some(
        (t: string) =>
          typeof t === "string" &&
          (t.toLowerCase().includes("text") || t.toLowerCase().includes("text effect"))
      );
    return (
      sSlug === "text-effects" ||
      cat.includes("text") ||
      pTitle.includes("text") ||
      hasTextTag
    );
  }
  if (title) {
    const target = title.toLowerCase();
    return cat.includes(target) || pTitle.includes(target);
  }
  return false;
}

export default function SectionView({ slug }: { slug: string }) {
  const section = SECTIONS_CONFIG[slug] || SECTIONS_CONFIG["thumbnail-psd"];
  const isThumbnailPsd = slug === "thumbnail-psd";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [originalPrice, setOriginalPrice] = useState<number | string>("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [badgeTag, setBadgeTag] = useState("NEW");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(
    isThumbnailPsd ? "1.09:1" : "16:10"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [apiSource, setApiSource] = useState<string>("Local API");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSectionProducts = async () => {
    setLoading(true);
    let localItems: any[] = [];
    try {
      const stored = localStorage.getItem("admin_local_products");
      if (stored) localItems = JSON.parse(stored);
    } catch (e) {}

    const primaryApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const fallbackApi = "https://digital-product-1-l3qr.onrender.com";

    let apiItems: any[] = [];

    try {
      const res = await fetch(`${primaryApi}/api/products?admin=true&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        apiItems = await res.json();
        setApiSource(primaryApi);
      } else {
        throw new Error("Primary API failed");
      }
    } catch {
      try {
        const fRes = await fetch(`${fallbackApi}/api/products?admin=true&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (fRes.ok) {
          apiItems = await fRes.json();
          setApiSource(fallbackApi);
        }
      } catch (e) {
        console.error("Both primary and fallback APIs failed:", e);
      }
    }

    const allItems = Array.isArray(apiItems) ? [...apiItems, ...localItems] : localItems;
    // Deduplicate by id
    const uniqueMap = new Map();
    allItems.forEach((p) => {
      if (p && p.id) uniqueMap.set(String(p.id), p);
    });
    const uniqueItems = Array.from(uniqueMap.values());

    let deletedIds: string[] = [
      "6ae869e86dc9e35a6d5051b7", // 3D Text Effects demo
      "6ae85671efbc320141ab02c1", // 4K Thumbnail demo
      "6ae85ebadd55de6b68b7520f", // FF Bundle demo
      "6ae869e86dc9e35a6d5051b6", // 3D Character Pack demo
    ];
    try {
      const d = localStorage.getItem("admin_deleted_products");
      if (d) deletedIds = [...deletedIds, ...JSON.parse(d)];
    } catch (e) {}

    const filtered = uniqueItems
      .filter((p: any) => !deletedIds.includes(String(p.id)))
      .filter((p: any) => matchProductForSection(p, slug, section.title));
    setProducts(filtered);
    setLoading(false);
  };

  useEffect(() => {
    loadSectionProducts();
  }, [slug]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setPrice("");
    setOriginalPrice("");
    setCoverImage("");
    setDescription("");
    setFileUrl("");
    setBadgeTag("NEW");
    setSelectedAspectRatio(isThumbnailPsd ? "1.09:1" : "16:10");
    setUploadMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setPrice(item.price !== undefined ? item.price : "");
    setOriginalPrice(item.originalPrice !== undefined ? item.originalPrice : "");
    setCoverImage(item.coverImage || "");
    setDescription(item.description || "");
    setFileUrl(item.fileUrls && item.fileUrls.length > 0 ? item.fileUrls[0] : "");
    setBadgeTag(item.tags?.[0] || "NEW");
    setSelectedAspectRatio(item.aspectRatio || (isThumbnailPsd ? "1.09:1" : "16:10"));
    setUploadMessage("");
    setIsModalOpen(true);
  };

  // Upload PNG / Image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("Uploading PNG cover...");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      try {
        const primaryApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${primaryApi}/api/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            filename: file.name.replace(/\.[^/.]+$/, ""),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && (data.storefrontUrl || data.url)) {
            const finalUrl = data.url;
            setCoverImage(finalUrl);
            setUploadMessage("✅ Uploaded successfully!");
            setTimeout(() => setUploadMessage(""), 2500);
            setIsUploading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend upload failed, falling back to base64 preview:", err);
      }

      // Fallback: save data URL directly so it always works immediately
      setCoverImage(base64Data);
      setUploadMessage("✅ Cover PNG loaded!");
      setTimeout(() => setUploadMessage(""), 2500);
      setIsUploading(false);
    };

    reader.onerror = () => {
      alert("Failed to read file.");
      setIsUploading(false);
      setUploadMessage("");
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const numericPrice = Number(price) || 0;
    const numericOrigPrice =
      Number(originalPrice) || (numericPrice > 0 ? Math.round(numericPrice * 1.5) : 0);

    const isPortrait = selectedAspectRatio === "1.09:1";

    const newProduct: any = {
      title: title.trim(),
      price: numericPrice,
      originalPrice: numericOrigPrice,
      coverImage: coverImage.trim() || section.defaultCover,
      category: section.title,
      sectionSlug: slug,
      description: description.trim() || `${section.title} collection`,
      fileUrls: fileUrl ? [fileUrl.trim()] : [],
      tags: [badgeTag, section.title.toUpperCase()],
      aspectRatio: selectedAspectRatio,
      orientation: isPortrait ? "portrait" : "landscape",
      sellerName: "Admin",
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
      isPublished: true,
      status: "APPROVED",
    };

    if (editingId) {
      newProduct.id = editingId;
    }

    // 1. Save directly to Database via backend API
    const primaryApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      if (editingId) {
        await fetch(`${primaryApi}/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        });
      } else {
        const res = await fetch(`${primaryApi}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        });
        if (res.ok) {
          const resJson = await res.json();
          if (resJson && resJson.product && resJson.product.id) {
            newProduct.id = resJson.product.id;
          }
        }
      }
    } catch (err) {
      console.error("Backend database save failed:", err);
    }

    // 2. Save locally as persistent cache
    try {
      const stored = localStorage.getItem("admin_local_products");
      let list = stored ? JSON.parse(stored) : [];
      if (editingId) {
        list = list.map((item: any) =>
          item.id === editingId ? { ...item, ...newProduct } : item
        );
      } else {
        list = [newProduct, ...list];
      }
      localStorage.setItem("admin_local_products", JSON.stringify(list));
    } catch (e) {}

    setIsModalOpen(false);
    await loadSectionProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from the database?")) return;

    try {
      const stored = localStorage.getItem("admin_local_products");
      if (stored) {
        const list = JSON.parse(stored).filter((p: any) => String(p.id) !== String(id));
        localStorage.setItem("admin_local_products", JSON.stringify(list));
      }
      const d = localStorage.getItem("admin_deleted_products");
      const dList = d ? JSON.parse(d) : [];
      if (!dList.includes(String(id))) {
        dList.push(String(id));
        localStorage.setItem("admin_deleted_products", JSON.stringify(dList));
      }
    } catch (e) {}

    const primaryApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      await fetch(`${primaryApi}/api/products/${id}`, { method: "DELETE" });
    } catch (e) {}

    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Section Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Link
          href="/sections"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-all mr-2"
        >
          <span>←</span>
          <span>All Sections</span>
        </Link>
        {Object.values(SECTIONS_CONFIG).map((cfg) => {
          const isActive = cfg.slug === slug;
          return (
            <Link
              key={cfg.slug}
              href={`/sections/${cfg.slug}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
            {section.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {section.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                {section.badge}
              </span>
              {isThumbnailPsd && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  📱 Orientation: Portrait (1.09:1)
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              {section.description}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                API Synced: {apiSource}
              </span>
              <span>•</span>
              <span>
                Matched {products.length} item{products.length === 1 ? "" : "s"}
              </span>
              {isThumbnailPsd && (
                <>
                  <span>•</span>
                  <span className="text-sky-400 font-semibold">
                    Vertical Cover Ratio: 1.09:1
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadSectionProducts}
            className="px-3.5 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh items from API"
          >
            <span>🔄</span> Refresh API
          </button>
          <a
            href={`http://localhost:3000/#${slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <span>👁️</span> Live Storefront
          </a>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer"
          >
            <span>+</span> Add Product
          </button>
        </div>
      </div>

      {/* Products Grid in Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Products Assigned to this Section ({products.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            {isThumbnailPsd
              ? "Displaying in Portrait (Vertical) 1.09:1 Aspect Ratio"
              : "Fetched live via backend API & auto-synchronized to storefront"}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground animate-pulse">
            <span className="text-3xl block mb-2">⚡</span>
            Fetching products from API...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/20">
            <span className="text-4xl block mb-2">{section.icon}</span>
            <p className="font-bold text-foreground">No matching products yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &quot;+ Add Product&quot; to upload your first asset to this showcase.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-5 ${
              isThumbnailPsd
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {products.map((item) => {
              const itemIsPortrait =
                isThumbnailPsd ||
                item.aspectRatio === "1.09:1" ||
                item.orientation === "portrait";

              return (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-primary/50 transition-colors group"
                >
                  <div>
                    {/* Card Cover with Dynamic Aspect Ratio */}
                    <div
                      className="bg-muted relative overflow-hidden w-full flex items-center justify-center"
                      style={{
                        aspectRatio: itemIsPortrait ? "1 / 1.09" : "16 / 10",
                      }}
                    >
                      <img
                        src={item.coverImage || section.defaultCover}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = section.defaultCover;
                        }}
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
                        ₹{item.price}
                      </div>
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {item.category && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/85 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-wider">
                            {item.category}
                          </span>
                        )}
                        {itemIsPortrait && (
                          <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[8px] font-bold text-amber-300 border border-amber-300/30">
                            📱 1.09:1
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-foreground line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description || section.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-border/50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">
                        ⭐ {item.rating || 5.0}
                      </span>
                      {item.fileUrls && item.fileUrls.length > 0 ? (
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          🔒 Secured
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          ⚠️ No Link
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <span>{section.icon}</span>
                <span>
                  {editingId ? "Edit Product in" : "Add Product to"} {section.title}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter real product title (e.g. YouTube Gaming Thumbnail PSD)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 29"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 49"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* COVER PNG UPLOAD & ASPECT RATIO SECTION */}
              <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🖼️ Cover PNG Upload</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">
                    {selectedAspectRatio === "1.09:1"
                      ? "Orientation: Portrait (Vertical 1.09:1)"
                      : `Aspect: ${selectedAspectRatio}`}
                  </span>
                </div>

                {/* Aspect Ratio Selector Pills */}
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { id: "1.09:1", label: "📱 1.09:1 Portrait (Vertical)" },
                    { id: "1:1", label: "🔲 1:1 Square" },
                    { id: "16:10", label: "🖥️ 16:10 Landscape" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedAspectRatio(mode.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        selectedAspectRatio === mode.id
                          ? "bg-sky-600 text-white border-sky-400 shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* File Upload Button / Drop Area */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>📁</span>
                    <span>
                      {isUploading
                        ? "Uploading PNG..."
                        : "Upload PNG Cover (Portrait 1.09:1)"}
                    </span>
                  </button>

                  {uploadMessage && (
                    <span className="text-xs font-semibold text-emerald-400 animate-pulse">
                      {uploadMessage}
                    </span>
                  )}
                </div>

                {/* Live Image Preview in Selected Aspect Ratio */}
                {coverImage && (
                  <div className="mt-2 pt-2 border-t border-sky-500/20 flex items-center gap-4">
                    <div
                      className="w-20 rounded-lg overflow-hidden border border-sky-400/40 bg-black/40 shrink-0 relative flex items-center justify-center shadow-md"
                      style={{
                        aspectRatio:
                          selectedAspectRatio === "1.09:1"
                            ? "1 / 1.09"
                            : selectedAspectRatio === "1:1"
                            ? "1 / 1"
                            : "16 / 10",
                      }}
                    >
                      <img
                        src={coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-foreground truncate">
                        Preview: Portrait (Vertical 1.09:1)
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {coverImage.startsWith("data:")
                          ? "Loaded from disk (PNG)"
                          : coverImage}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 mt-1 cursor-pointer"
                      >
                        Remove Cover
                      </button>
                    </div>
                  </div>
                )}

                {/* Or paste direct URL */}
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Or paste direct image URL:
                  </label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://.../cover.png"
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter real product description, contents, and features..."
                  className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                  Instant Download Link / Google Drive
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/..."
                  className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 font-medium flex items-start gap-1.5 leading-snug">
                  <span className="text-xs">🔒</span>
                  <span>
                    <strong>Cryptographically Protected:</strong> This download link is
                    never exposed to public visitors. Upon payment, backend creates a
                    signed verification token to unlock this link securely.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md cursor-pointer"
                >
                  Save &amp; Publish to Storefront
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
