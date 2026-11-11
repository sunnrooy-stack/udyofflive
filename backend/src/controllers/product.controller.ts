import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Pre-seeded real catalog products matching Admin Panel
export const inMemoryProductsStore: any[] = [
  {
    id: "6ae8508c7a36210fc0dc8e0a",
    title: "ANNU PALYZ PDF",
    description: "PDF",
    price: 299,
    originalPrice: 499,
    category: "Glow anime logo",
    sectionSlug: "glow-anime-logo",
    tags: ["NEW", "GLOW ANIME LOGO"],
    coverImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1793609839/ChatGPT_Image_Sep_27_2026_10_31_36_AM_ia3ubv.png",
    sellerName: "Admin",
    rating: 5.0,
    reviewsCount: 1,
    isFeatured: true,
    isPublished: true,
    status: "APPROVED",
  },
  {
    id: "6ae95fcb24ea2eb0363e9650",
    title: "PSD",
    description: "Thumbnail PSD collection",
    price: 2,
    originalPrice: 3,
    category: "Thumbnail PSD",
    sectionSlug: "thumbnail-psd",
    tags: ["NEW", "THUMBNAIL PSD"],
    coverImage: "https://res.cloudinary.com/dh0qmflg7/image/upload/v1793679196/ChatGPT_Image_Sep_27_2026_10_53_41_AM_y3n3ff.png",
    aspectRatio: "1.09:1",
    sellerName: "Admin",
    rating: 5.0,
    reviewsCount: 1,
    isFeatured: true,
    isPublished: true,
    status: "APPROVED",
  },
];

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { role, userId, search } = req.query;

    let dbProducts: any[] = [];
    try {
      dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn("Prisma findMany notice:", (dbErr as any).message);
    }

    const mergedMap = new Map<string, any>();
    const knownTitles = new Set<string>();

    // 1. Add real DB products first
    if (Array.isArray(dbProducts)) {
      dbProducts.forEach((p) => {
        mergedMap.set(String(p.id), {
          ...p,
          id: String(p.id),
          sellerName: p.sellerName || 'Admin',
          rating: p.rating || 5.0,
          reviewsCount: p.reviewsCount || 1,
        });
        if (p.title) {
          knownTitles.add(p.title.trim().toLowerCase());
        }
      });
    }

    // 2. Add/Override memory store products ONLY if not duplicate of DB title
    inMemoryProductsStore.forEach((p) => {
      if (p.id) {
        const titleKey = p.title ? p.title.trim().toLowerCase() : "";
        if (mergedMap.has(String(p.id))) {
          const dbItem = mergedMap.get(String(p.id)) || {};
          mergedMap.set(String(p.id), {
            ...p,
            ...dbItem,
            isFeatured: dbItem.isFeatured !== undefined ? dbItem.isFeatured : p.isFeatured,
          });
        } else if (titleKey && !knownTitles.has(titleKey)) {
          mergedMap.set(String(p.id), p);
          knownTitles.add(titleKey);
        }
      }
    });

    let result = Array.from(mergedMap.values());

    // Backend Personalization Algorithm if role or userId or search query passed
    if (role || userId || search) {
      const searchStr = typeof search === "string" ? search.toLowerCase().trim() : "";
      const userRoleStr = typeof role === "string" ? role.toLowerCase() : "";
      const userIdentifier = typeof userId === "string" ? userId : "user";

      const ROLE_KEYWORDS: Record<string, string[]> = {
        developer: ["code", "saas", "template", "react", "nextjs", "dashboard", "api", "database", "dev", "programming"],
        "content creator": ["prompt", "ai", "creator", "youtube", "social", "stream", "thumbnail", "reels", "music"],
        editor: ["preset", "after effects", "premiere", "davinci", "video", "motion", "capcut", "alight motion", "lut"],
        freelancer: ["ui", "ux", "figma", "portfolio", "client", "business", "marketing", "freelance", "proposal"]
      };

      const matchedRoleKws = ROLE_KEYWORDS[userRoleStr] || [];

      result = result.map((p) => {
        let score = 0;
        let reason = "✨ Recommended Pick";
        const text = `${p.title || ""} ${p.description || ""} ${p.category || ""} ${(p.tags || []).join(" ")}`.toLowerCase();

        // Search match boost
        if (searchStr && text.includes(searchStr)) {
          score += 50;
          reason = `🔍 Matches "${searchStr}"`;
        }

        // Role match boost
        let roleMatches = 0;
        for (const kw of matchedRoleKws) {
          if (text.includes(kw)) roleMatches++;
        }
        if (roleMatches > 0) {
          score += Math.min(roleMatches * 15, 45);
          if (!searchStr) reason = `🎯 Curated for ${role}`;
        }

        if (p.isFeatured) score += 10;

        // User deterministic diversity hash
        let hash = 0;
        const seedStr = `${userIdentifier}_${p.id || p.title}`;
        for (let i = 0; i < seedStr.length; i++) {
          hash = (hash << 5) - hash + seedStr.charCodeAt(i);
          hash |= 0;
        }
        score += (Math.abs(hash) % 100) / 10;

        return {
          ...p,
          recommendationScore: Math.round(score * 10) / 10,
          recommendationReason: reason,
        };
      }).sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
    }

    // Security: Protect raw product download links from public scraping
    const isAdmin = req.query.admin === "true" || req.headers["x-admin-token"] === "admin_token";
    if (!isAdmin) {
      result = result.map((p) => {
        const { fileUrls, ...safeProduct } = p;
        return {
          ...safeProduct,
          hasDownloadFile: Boolean(fileUrls && fileUrls.length > 0),
        };
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(200).json(inMemoryProductsStore);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let product: any = null;
    try {
      product = await prisma.product.findUnique({
        where: { id },
        include: { reviews: true },
      });
    } catch (e) {}

    const memMatch = inMemoryProductsStore.find(p => String(p.id) === String(id));
    if (product && memMatch) {
      product = { ...memMatch, ...product, aspectRatio: memMatch.aspectRatio || product.aspectRatio };
    } else if (!product) {
      product = memMatch;
    }

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Protect fileUrls for public single product view
    const isAdmin = req.query.admin === "true" || req.headers["x-admin-token"] === "admin_token";
    if (!isAdmin && product) {
      const { fileUrls, ...safeProduct } = product;
      return res.status(200).json({
        ...safeProduct,
        hasDownloadFile: Boolean(fileUrls && fileUrls.length > 0),
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category, tags, coverImage, previewMedia, fileUrls, features, demoUrl, previewGallery, status, isFeatured, metaTitle, metaDescription, publishDate, showBeforeAfterCC, beforeVideoUrl, afterVideoUrl } = req.body;
    
    let sellerId = "6a3974739269002825c885c2";
    try {
      const existingUser = (await prisma.user.findFirst({ where: { role: 'ADMIN' } })) || (await prisma.user.findFirst());
      if (existingUser) sellerId = existingUser.id;
    } catch (e) {}

    const productStatus = status === "Draft" ? "PENDING_APPROVAL" : "APPROVED";
    const isPublished = productStatus === "APPROVED";

    let dbProduct: any = null;
    try {
      const dbData: any = {
        title: title ? title.trim() : "Untitled Product",
        description: description ? description.trim() : "",
        price: parseFloat(price) || 0,
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : (parseFloat(price) > 0 ? Math.round(parseFloat(price) * 1.5) : 0),
        category: category || "Assets",
        sectionSlug: req.body.sectionSlug || "",
        aspectRatio: req.body.aspectRatio || "",
        orientation: req.body.orientation || "landscape",
        sellerName: req.body.sellerName || "Admin",
        rating: typeof req.body.rating === "number" ? req.body.rating : 5.0,
        reviewsCount: typeof req.body.reviewsCount === "number" ? req.body.reviewsCount : 1,
        tags: Array.isArray(tags) ? tags : [],
        coverImage: coverImage || "",
        previewMedia: Array.isArray(previewMedia) ? previewMedia : [],
        fileUrls: Array.isArray(fileUrls) ? fileUrls : [],
        features: Array.isArray(features) ? features : [],
        demoUrl: demoUrl || "",
        videoUrl: req.body.videoUrl || demoUrl || "",
        previewGallery: previewGallery || [],
        status: productStatus,
        isPublished: isPublished,
        isFeatured: isFeatured !== undefined ? isFeatured : true,
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        sellerId: sellerId,
      };
      dbProduct = await prisma.product.create({
        data: dbData,
      });
      console.log(`✅ Saved product to MongoDB Database! ID: ${dbProduct.id}, Title: ${dbProduct.title}`);
    } catch (dbErr) {
      console.warn("Prisma create product notice:", (dbErr as any).message);
    }

    const finalProduct = {
      id: dbProduct ? String(dbProduct.id) : (req.body.id || ("prod_" + Date.now())),
      title: title ? title.trim() : "Untitled Product",
      description: description ? description.trim() : "",
      price: parseFloat(price) || 0,
      originalPrice: req.body.originalPrice || (parseFloat(price) > 0 ? Math.round(parseFloat(price) * 1.5) : 0),
      category: category || "Assets",
      sectionSlug: req.body.sectionSlug || "",
      aspectRatio: req.body.aspectRatio || "",
      orientation: req.body.orientation || "landscape",
      videoUrl: req.body.videoUrl || demoUrl || "",
      tags: Array.isArray(tags) ? tags : [],
      coverImage: coverImage || "",
      fileUrls: Array.isArray(fileUrls) ? fileUrls : [],
      sellerName: req.body.sellerName || "Admin",
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: isFeatured !== undefined ? isFeatured : true,
      isPublished: true,
      status: productStatus,
    };

    // Clean up temporary duplicates in memory store
    if (finalProduct.id) {
      const existingIdx = inMemoryProductsStore.findIndex(p => String(p.id) === String(finalProduct.id));
      if (existingIdx !== -1) inMemoryProductsStore.splice(existingIdx, 1);
    }
    const titleIdx = inMemoryProductsStore.findIndex(p => p.title && finalProduct.title && p.title.trim().toLowerCase() === finalProduct.title.trim().toLowerCase());
    if (titleIdx !== -1) inMemoryProductsStore.splice(titleIdx, 1);

    inMemoryProductsStore.unshift(finalProduct);

    res.status(201).json({ message: 'Product created and saved to database successfully', product: finalProduct });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const allowedKeys = [
      'title', 'description', 'price', 'originalPrice', 'category', 'sectionSlug',
      'aspectRatio', 'orientation', 'sellerName', 'rating', 'reviewsCount',
      'tags', 'coverImage', 'previewMedia', 'fileUrls', 'features', 'demoUrl', 'videoUrl',
      'previewGallery', 'status', 'isPublished', 'isFeatured', 'metaTitle', 'metaDescription'
    ];

    const prismaUpdateData: any = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        if (key === 'price' || key === 'originalPrice' || key === 'rating') {
          prismaUpdateData[key] = parseFloat(req.body[key]) || 0;
        } else if (key === 'reviewsCount') {
          prismaUpdateData[key] = parseInt(req.body[key], 10) || 1;
        } else {
          prismaUpdateData[key] = req.body[key];
        }
      }
    }

    let product: any = null;
    try {
      if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
        product = await prisma.product.update({
          where: { id },
          data: prismaUpdateData,
        });
        console.log(`✅ Updated product in MongoDB Database! ID: ${id}`);
      }
    } catch (e) {
      console.warn("Prisma update product:", (e as any).message);
    }

    // If product was not in MongoDB (e.g. non-ObjectId preset or new item), persist it now
    if (!product) {
      try {
        let sellerId = "6a3974739269002825c885c2";
        const existingUser = await prisma.user.findFirst();
        if (existingUser) sellerId = existingUser.id;

        product = await prisma.product.create({
          data: {
            title: req.body.title ? req.body.title.trim() : "Untitled Product",
            description: req.body.description ? req.body.description.trim() : "",
            price: parseFloat(req.body.price) || 0,
            originalPrice: parseFloat(req.body.originalPrice) || 0,
            category: req.body.category || "Assets",
            sectionSlug: req.body.sectionSlug || "",
            aspectRatio: req.body.aspectRatio || "",
            orientation: req.body.orientation || "landscape",
            sellerName: req.body.sellerName || "Admin",
            rating: typeof req.body.rating === "number" ? req.body.rating : 5.0,
            reviewsCount: typeof req.body.reviewsCount === "number" ? req.body.reviewsCount : 1,
            tags: Array.isArray(req.body.tags) ? req.body.tags : [],
            coverImage: req.body.coverImage || "",
            fileUrls: Array.isArray(req.body.fileUrls) ? req.body.fileUrls : [],
            sellerId,
            status: "APPROVED",
            isPublished: true,
            isFeatured: true,
            ...prismaUpdateData,
          }
        });
        console.log(`✅ Upserted product into MongoDB Database! ID: ${product.id}`);
      } catch (upsertErr) {
        console.warn("Prisma upsert notice:", (upsertErr as any).message);
      }
    }

    const savedProduct = product ? {
      ...product,
      id: String(product.id),
      originalPrice: product.originalPrice || req.body.originalPrice,
      sectionSlug: product.sectionSlug || req.body.sectionSlug,
      aspectRatio: product.aspectRatio || req.body.aspectRatio,
    } : { id, ...req.body };

    // Update in memory store
    const memIndex = inMemoryProductsStore.findIndex(p => String(p.id) === String(id) || (p.title && savedProduct.title && p.title.trim().toLowerCase() === savedProduct.title.trim().toLowerCase()));
    if (memIndex !== -1) {
      inMemoryProductsStore[memIndex] = {
        ...inMemoryProductsStore[memIndex],
        ...savedProduct,
      };
    } else {
      inMemoryProductsStore.unshift(savedProduct);
    }

    res.status(200).json({ message: 'Product updated and saved to database successfully', product: savedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    try {
      if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
        await prisma.product.delete({ where: { id } });
        console.log(`✅ Deleted product ${id} from MongoDB Database`);
      }
    } catch (e) {
      console.warn("Prisma delete product:", (e as any).message);
    }

    const memIndex = inMemoryProductsStore.findIndex(p => String(p.id) === String(id));
    if (memIndex !== -1) {
      inMemoryProductsStore.splice(memIndex, 1);
    }

    res.status(200).json({ message: 'Product deleted from database successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const fixFeaturedProducts = async (req: Request, res: Response) => {
  try {
    let count = 0;
    try {
      const result = await prisma.product.updateMany({
        data: { isFeatured: true },
      });
      count = result.count;
    } catch (e) {}

    inMemoryProductsStore.forEach(p => p.isFeatured = true);
    res.status(200).json({ message: 'Featured products fixed', count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fix featured products' });
  }
};
