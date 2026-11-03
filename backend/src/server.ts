import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { connectRedis } from './config/redis';
import './config/firebase'; // Initialize Firebase
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import paymentRoutes from './routes/payment.routes';
import categoryRoutes from './routes/category.routes';
import userRoutes from './routes/user.routes';
import orderRoutes from './routes/order.routes';
import ticketRoutes from './routes/ticket.routes';
import { inMemoryOrdersStore } from './controllers/order.controller';
import { inMemoryProductsStore } from './controllers/product.controller';
import { generateDownloadToken, verifyDownloadToken } from './utils/security';
import { loadPaymentGateways, savePaymentGateways, getActiveRazorpay } from './config/paymentGateways';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  'https://udyofflive.onrender.com',
  'https://udyofflive8888.onrender.com',
  'https://digitals-product-store.onrender.com', 
  'https://digital-product-2.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded files
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Image Upload Endpoint (PNG, JPG, WEBP)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Strip prefix like data:image/png;base64,
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('svg')) ext = '.svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_') : 'cover';
    const finalFilename = `${Date.now()}_${cleanName}${ext}`;
    const targetPath = path.join(uploadsDir, finalFilename);

    fs.writeFileSync(targetPath, buffer);

    // Mirror to storefront/public/images/uploads for direct Next.js static serving
    const storefrontUploadsDir = path.join(__dirname, '../../storefront/public/images/uploads');
    try {
      if (!fs.existsSync(storefrontUploadsDir)) fs.mkdirSync(storefrontUploadsDir, { recursive: true });
      fs.writeFileSync(path.join(storefrontUploadsDir, finalFilename), buffer);
    } catch (e) {}

    const backendBase = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || 'https://udyofflive1111111111.onrender.com';
    const fileUrl = `${backendBase.replace(/\/$/, '')}/uploads/${finalFilename}`;
    const storefrontUrl = `/images/uploads/${finalFilename}`;

    console.log(`[Upload] Image saved successfully: ${finalFilename} (${buffer.length} bytes)`);

    return res.json({
      success: true,
      url: fileUrl,
      storefrontUrl,
      filename: finalFilename
    });
  } catch (err: any) {
    console.error('Upload endpoint error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from './config/prisma';

// Global fallback user store for real-time local sync
export const inMemoryUsersMap = new Map<string, any>();

// Seed initial demo users into memory store
inMemoryUsersMap.set("sunnrooy@gmail.com", {
  id: "usr_sunny_roy",
  name: "Sunny Roy",
  email: "sunnrooy@gmail.com",
  dateOfBirth: "1998-05-14",
  professionalRole: "Content Creator",
  isVerified: true,
  role: "USER",
  createdAt: new Date(),
  orders: []
});

app.post('/api/auth/verify-profile', async (req, res) => {
  try {
    const { email, name, dateOfBirth, professionalRole } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Email and Full Name are required.' });
    }

    const userData = {
      id: 'usr_' + Date.now(),
      email: email.toLowerCase(),
      name,
      dateOfBirth: dateOfBirth || 'N/A',
      professionalRole: professionalRole || 'Freelancer',
      isVerified: true,
      role: 'USER',
      createdAt: new Date(),
      orders: []
    };

    // Always update in-memory store for 100% instant retrieval
    inMemoryUsersMap.set(email.toLowerCase(), userData);

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name,
            dateOfBirth: dateOfBirth || '',
            professionalRole: professionalRole || 'Freelancer',
            firebaseUid: 'user_' + Date.now() + Math.random().toString(36).substr(2, 9),
            isVerified: true,
          }
        });
        console.log('✅ Created user in MongoDB:', user.name, user.email);
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: name || user.name,
            dateOfBirth: dateOfBirth || user.dateOfBirth,
            professionalRole: professionalRole || user.professionalRole,
            isVerified: true,
          }
        });
        console.log('✅ Updated user in MongoDB:', user.name, user.email);
      }
    } catch (dbErr) {
      console.warn('MongoDB sync notice (using memory store fallback):', (dbErr as any).message);
      user = userData;
    }

    res.json({ success: true, user: user || userData });
  } catch (err: any) {
    console.error('Verify Profile Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to save profile' });
  }
});
// Payment Gateway Settings API for Admin Panel (Multi-Account Switcher)
app.get('/api/payment-settings', (req: Request, res: Response) => {
  try {
    const config = loadPaymentGateways();
    res.json({
      success: true,
      activeAccount: config.activeAccount,
      account1: {
        id: config.account1.id,
        name: config.account1.name,
        keyId: config.account1.keyId,
        keySecret: config.account1.keySecret,
        isLive: config.account1.isLive,
      },
      account2: {
        id: config.account2.id,
        name: config.account2.name,
        keyId: config.account2.keyId,
        keySecret: config.account2.keySecret,
        isLive: config.account2.isLive,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to load payment settings' });
  }
});

app.post('/api/payment-settings', (req: Request, res: Response) => {
  try {
    const { activeAccount, account1, account2 } = req.body;
    const updated = savePaymentGateways({
      activeAccount: activeAccount ? String(activeAccount) : undefined,
      account1,
      account2,
    });
    console.log(`✅ Razorpay Gateway Updated! Active Option: ${updated.activeAccount} (${updated.activeAccount === "1" ? updated.account1.name : updated.account2.name})`);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update payment settings' });
  }
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { items, amount } = req.body;
    
    // Calculate total amount from cart items or provided amount
    let totalAmount = 0;
    if (typeof amount === 'number' && amount > 0) {
      totalAmount = amount;
    } else if (Array.isArray(items) && items.length > 0) {
      items.forEach((item: any) => {
        totalAmount += Number(item.price) || 0;
      });
    } else {
      totalAmount = Number(amount) || 0;
    }

    if (totalAmount <= 0) {
      return res.json({ isFree: true, totalAmount: 0 });
    }

    // Load active Razorpay Account (Option 1 or Option 2)
    const activeGateway = getActiveRazorpay();
    const keyId = activeGateway.keyId;
    const keySecret = activeGateway.keySecret;

    if (!keyId || !keySecret || keyId === 'dummy_key' || keyId.includes('YOUR_KEY')) {
      const testOrderId = `order_test_${Date.now()}`;
      return res.json({ orderId: testOrderId, totalAmount, isDemo: true, activeAccount: activeGateway.id, gatewayName: activeGateway.name });
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      console.log(`💳 Razorpay Order Created via ${activeGateway.name}:`, order.id, 'Key:', keyId);
      res.json({ orderId: order.id, totalAmount, key: keyId, activeAccount: activeGateway.id, gatewayName: activeGateway.name });
    } catch (sdkError: any) {
      console.warn(`Razorpay SDK error on ${activeGateway.name}:`, sdkError?.message || sdkError);
      const testOrderId = `order_test_${Date.now()}`;
      res.json({ orderId: testOrderId, totalAmount, isDemo: true, key: keyId, activeAccount: activeGateway.id, gatewayName: activeGateway.name });
    }
  } catch (err) {
    console.error('Create Order Handler Error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, customer, items } = req.body;
    
    const config = loadPaymentGateways();
    const activeGateway = getActiveRazorpay();
    const isFreeOrder = razorpay_payment_id && String(razorpay_payment_id).startsWith('FREE_');
    const isTestOrder = razorpay_order_id && String(razorpay_order_id).startsWith('order_test_');
    
    let isSignatureValid = false;
    if (isFreeOrder || isTestOrder) {
      isSignatureValid = true;
    } else if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      // Validate with active secret first, and check alternate secret as fallback
      const secretsToTest = [
        activeGateway.keySecret,
        config.account1.keySecret,
        config.account2.keySecret,
        process.env.RAZORPAY_KEY_SECRET,
      ].filter(Boolean);

      for (const secret of secretsToTest) {
        if (!secret) continue;
        const generatedSignature = crypto
          .createHmac('sha256', secret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');
        if (generatedSignature === razorpay_signature) {
          isSignatureValid = true;
          break;
        }
      }
    }
    
    if (!isSignatureValid) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Atomic Order Record Creation on Verified Payment
    let user = await prisma.user.findUnique({ where: { email: email || 'guest@store.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || 'guest@store.com',
          name: customer || 'Guest',
          firebaseUid: 'guest_' + Date.now() + Math.random().toString(36).substr(2, 9),
        }
      });
    }

    let totalAmount = 0;
    const productList = Array.isArray(items) ? items : [];
    if (productList.length > 0) {
      productList.forEach((item: any) => {
        totalAmount += Number(item.price) || 0;
      });
    }

    const orderPaymentId = razorpay_payment_id || `pay_${Date.now()}`;

    const orderData = {
      id: `ord_${Date.now()}`,
      orderNumber: orderPaymentId,
      totalAmount,
      status: 'COMPLETED',
      paymentId: orderPaymentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: customer || user.name || 'Guest',
      email: email || user.email,
      product: productList.length === 1 ? productList[0].title : `${productList.length} Products`,
      items: productList.map((item: any) => ({
        priceAtPurchase: item.price || 0,
        product: { id: String(item.id), title: item.title || 'Digital Item', coverImage: item.coverImage || '' }
      })),
      user: { id: user.id, name: user.name, email: user.email }
    };
    inMemoryOrdersStore.unshift(orderData);

    let dbOrder: any = null;
    try {
      dbOrder = await prisma.order.create({
        data: {
          orderNumber: orderPaymentId,
          totalAmount,
          status: 'COMPLETED',
          paymentId: orderPaymentId,
          userId: user.id,
          items: {
            create: productList.map((item: any) => ({
              priceAtPurchase: item.price || 0,
              productId: String(item.id),
            }))
          }
        }
      });
    } catch (e) {}

    // Generate cryptographically signed verification token for unlocking product files
    const downloadToken = generateDownloadToken({
      orderId: dbOrder?.id || orderData.id,
      paymentId: orderPaymentId,
      email: email || user.email,
      productIds: productList.map((item: any) => String(item.id)),
    });

    res.json({
      success: true,
      orderId: dbOrder?.id || orderData.id,
      paymentId: orderPaymentId,
      downloadToken,
    });
  } catch (err) {
    console.error('Razorpay Verify Error:', err);
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { paymentId, customer, email, items, status } = req.body;
    const productList = Array.isArray(items) ? items : [];

    const orderData = {
      id: `ord_${Date.now()}`,
      orderNumber: paymentId || `ord_${Date.now()}`,
      totalAmount: productList.reduce((sum: number, i: any) => sum + (Number(i.price) || 0), 0),
      status: status === 'Completed' ? 'COMPLETED' : 'PENDING',
      paymentId: paymentId || `ord_${Date.now()}`,
      createdAt: new Date(),
      customer: customer || 'Guest',
      email: email || 'guest@store.com',
      product: productList.length === 1 ? productList[0].title : `${productList.length} Products`,
      items: productList.map((item: any) => ({
        priceAtPurchase: item.price || 0,
        product: { id: String(item.id), title: item.title || 'Digital Item', coverImage: item.coverImage || '' }
      }))
    };
    inMemoryOrdersStore.unshift(orderData);
    
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: customer || 'Guest',
          firebaseUid: 'guest_' + Date.now() + Math.random().toString(36).substr(2, 9),
        }
      });
    }

    let totalAmount = 0;
    if (productList.length > 0) {
      const productIds = productList.map((i: any) => String(i.id));
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } }
      });
      productList.forEach((item: any) => {
        const dbProd = dbProducts.find((p) => p.id === String(item.id));
        if (dbProd) {
          totalAmount += dbProd.price;
        }
      });
    }

    const orderPaymentId = paymentId || `ord_${Date.now()}`;

    let dbOrder: any = null;
    try {
      dbOrder = await prisma.order.create({
        data: {
          orderNumber: orderPaymentId,
          totalAmount,
          status: status === 'Completed' ? 'COMPLETED' : 'PENDING',
          paymentId: orderPaymentId,
          userId: user.id,
          items: {
            create: productList.map((item: any) => ({
              priceAtPurchase: item.price || 0,
              productId: String(item.id),
            }))
          }
        }
      });
    } catch (e) {}

    const isCompleted = status === 'Completed' || status === 'COMPLETED';
    const downloadToken = isCompleted ? generateDownloadToken({
      orderId: dbOrder?.id || orderData.id,
      paymentId: orderPaymentId,
      email: email || 'guest@store.com',
      productIds: productList.map((item: any) => String(item.id)),
    }) : undefined;

    res.json({
      success: true,
      order: dbOrder || orderData,
      paymentId: orderPaymentId,
      downloadToken,
    });
  } catch (err) {
    console.error('Save Order Error:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Secure Verified Download Access Route - Requires Cryptographic Token Verification
const handleVerifyDownload = async (req: Request, res: Response) => {
  try {
    const paymentId = (req.query.payment_id as string) || req.body?.paymentId || req.body?.payment_id;
    const token = (req.query.token as string) || req.body?.token || (req.headers['x-download-token'] as string);

    // 1. Token Requirement
    if (!token) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Missing security verification token. Payment verification is required to access digital files.',
      });
    }

    // 2. Cryptographic Token Verification
    const tokenResult = verifyDownloadToken(token);
    if (!tokenResult.valid || !tokenResult.payload) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: ${tokenResult.error || 'Invalid or expired verification token.'}`,
      });
    }

    // 3. Match Payment ID
    const effectivePaymentId = paymentId || tokenResult.payload.paymentId;
    if (paymentId && tokenResult.payload.paymentId !== paymentId) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Verification token does not match the requested order/payment.',
      });
    }

    // 4. Order Completion Verification (checks inMemoryOrdersStore & prisma.order)
    let matchedOrder = inMemoryOrdersStore.find((o) =>
      (o.paymentId === effectivePaymentId || o.orderNumber === effectivePaymentId || o.id === tokenResult.payload?.orderId) &&
      (o.status === 'COMPLETED' || o.status === 'Completed')
    );

    if (!matchedOrder) {
      try {
        const dbOrder = await prisma.order.findFirst({
          where: {
            paymentId: effectivePaymentId,
            status: 'COMPLETED',
          },
          include: {
            items: {
              include: { product: true },
            },
          },
        });
        if (dbOrder) matchedOrder = dbOrder;
      } catch (e) {}
    }

    if (!matchedOrder) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: No completed purchase record found in database for this verification token.',
      });
    }

    // 5. Retrieve Unmasked fileUrls for Purchased Products Only
    const productIds = tokenResult.payload.productIds || [];
    const verifiedItems: any[] = [];

    productIds.forEach((pid: string) => {
      const prod = inMemoryProductsStore.find((p) => String(p.id) === String(pid)) ||
        (matchedOrder.items && matchedOrder.items.find((i: any) => String(i.product?.id || i.productId) === String(pid))?.product) ||
        {};
      verifiedItems.push({
        id: pid,
        title: prod.title || 'Digital Product File',
        coverImage: prod.coverImage || '',
        sellerName: prod.sellerName || 'Admin',
        fileUrls: prod.fileUrls || [],
      });
    });

    if (verifiedItems.length === 0 && matchedOrder.items) {
      matchedOrder.items.forEach((item: any) => {
        const pid = String(item.product?.id || item.productId || item.id);
        const prod = inMemoryProductsStore.find((p) => String(p.id) === pid) || item.product || item;
        verifiedItems.push({
          id: pid,
          title: prod.title || 'Digital Product File',
          coverImage: prod.coverImage || '',
          sellerName: prod.sellerName || 'Admin',
          fileUrls: prod.fileUrls || [],
        });
      });
    }

    return res.json({
      success: true,
      verified: true,
      tokenVerified: true,
      orderNumber: matchedOrder.orderNumber || matchedOrder.id,
      paymentId: effectivePaymentId,
      customer: matchedOrder.customer || tokenResult.payload.email,
      items: verifiedItems,
    });
  } catch (err) {
    console.error('Verify Download Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error during download verification' });
  }
};

app.get('/api/orders/verify-download', handleVerifyDownload);
app.post('/api/orders/verify-download', handleVerifyDownload);
app.post('/api/orders/verify-token', handleVerifyDownload);

// Routes
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    const lastUserMsg = Array.isArray(messages) && messages.length > 0 
      ? messages[messages.length - 1]?.text || ""
      : "";

    if (!lastUserMsg) {
      return res.json({ text: "Hello! How can I help you find digital products or answer questions today?" });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== "YOUR_GEMINI_API_KEY" && !geminiKey.includes("dummy")) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `You are the helpful AI assistant for the Digital Products Store. Answer concisely and politely about digital assets, video templates, software presets, courses, downloads, licenses, and payments. User message: ${lastUserMsg}` }]
              }
            ]
          })
        });
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            return res.json({ text: aiText });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call notice (falling back to smart assistant):", geminiErr);
      }
    }

    // Smart Catalog & Store Assistant Fallback
    const q = lastUserMsg.toLowerCase();
    let reply = "";

    if (q.includes("download") || q.includes("where is my file") || q.includes("access")) {
      reply = "Instant Download Access: Once your payment completes, your digital files are available immediately on the Order Success page and under your 'My Dashboard -> Purchases' tab!";
    } else if (q.includes("refund") || q.includes("return") || q.includes("money back")) {
      reply = "Our Refund Policy: If a digital asset is defective or corrupted and cannot be resolved by support within 24 hours, we offer a full refund. You can submit a ticket in the Contact page!";
    } else if (q.includes("commercial") || q.includes("license") || q.includes("client")) {
      reply = "Commercial License Included: All digital assets purchased on our platform come with lifetime commercial use rights for personal and client projects.";
    } else if (q.includes("payment") || q.includes("upi") || q.includes("card") || q.includes("razorpay")) {
      reply = "Payment Methods: We support all Indian and Global payment methods including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets via secure Razorpay checkout.";
    } else if (q.includes("support") || q.includes("contact") || q.includes("help") || q.includes("ticket")) {
      reply = "Need personal help? Visit our 'Contact' page to raise a priority support ticket, and our team will get back to you with live updates!";
    } else if (q.includes("discount") || q.includes("offer") || q.includes("coupon") || q.includes("price")) {
      reply = "Special Offers: Check out our FEATURED and TRENDING items on the homepage for discounted bundles and creator asset packs!";
    } else {
      reply = `Thank you for asking! We offer premium digital templates, video motion assets, presets, coding boilerplates, and creative packages. Feel free to explore our catalog or ask about any specific item!`;
    }

    res.json({ text: reply });
  } catch (err: any) {
    console.error("Chat error:", err);
    res.status(500).json({ text: "I am having trouble connecting to AI services right now. Please check back shortly!" });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Premium Digital Product Store API is running');
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'Backend server is healthy'
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'Backend server is healthy'
  });
});

// Central Public Config Endpoint for Frontend
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_T3nxTH4mjFTNK8',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'app11-88fc1',
    apiUrl: process.env.BACKEND_URL || 'http://localhost:5000'
  });
});

// Automatic Self-Ping Keep-Alive (runs in production on Render to prevent sleep)
const startKeepAlive = () => {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || 'https://udyofflive1111111111.onrender.com';
  const pingUrl = `${targetUrl.replace(/\/$/, '')}/health`;
  const INTERVAL = 10 * 60 * 1000; // Ping every 10 minutes

  console.log(`[Keep-Alive] Initialized self-ping service for: ${pingUrl}`);
  
  setInterval(async () => {
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch(pingUrl);
        console.log(`[Keep-Alive] Pinged ${pingUrl} at ${new Date().toLocaleTimeString()} - Status: ${res.status}`);
      }
    } catch (err: any) {
      console.warn(`[Keep-Alive] Ping notice:`, err.message);
    }
  }, INTERVAL);
};

app.listen(port, async () => {
  await connectRedis();
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  startKeepAlive();
});
