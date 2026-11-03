import fs from 'fs';
import path from 'path';

export interface RazorpayAccount {
  id: string;
  name: string;
  keyId: string;
  keySecret: string;
  isLive: boolean;
}

export interface PaymentGatewaysConfig {
  activeAccount: string; // "1" or "2"
  account1: RazorpayAccount;
  account2: RazorpayAccount;
}

const SETTINGS_FILE = path.join(__dirname, '../../data/payment_settings.json');

const DEFAULT_CONFIG: PaymentGatewaysConfig = {
  activeAccount: process.env.RAZORPAY_ACTIVE_ACCOUNT || "2",
  account1: {
    id: "1",
    name: "Razorpay Option 1 (Test / Sandbox)",
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TvF0iIwMv1MxWV",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "4Ucfs5fbQLMkTBoEajVfDoQp",
    isLive: false,
  },
  account2: {
    id: "2",
    name: "Razorpay Option 2 (Live / Production)",
    keyId: process.env.RAZORPAY_KEY_ID_2 || "rzp_live_T3nxTH4mjFTNK8",
    keySecret: process.env.RAZORPAY_KEY_SECRET_2 || "spFAtkmHQhl5hpcgin3MkJX5",
    isLive: true,
  },
};

let inMemoryConfig: PaymentGatewaysConfig = { ...DEFAULT_CONFIG };

export function loadPaymentGateways(): PaymentGatewaysConfig {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      inMemoryConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        account1: { ...DEFAULT_CONFIG.account1, ...(parsed.account1 || {}) },
        account2: { ...DEFAULT_CONFIG.account2, ...(parsed.account2 || {}) },
      };
    }
  } catch (err) {
    console.warn("Could not read payment_settings.json, using defaults", err);
  }
  return inMemoryConfig;
}

export function savePaymentGateways(newConfig: Partial<PaymentGatewaysConfig>): PaymentGatewaysConfig {
  inMemoryConfig = {
    ...inMemoryConfig,
    ...newConfig,
    account1: { ...inMemoryConfig.account1, ...(newConfig.account1 || {}) },
    account2: { ...inMemoryConfig.account2, ...(newConfig.account2 || {}) },
  };

  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(inMemoryConfig, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write payment_settings.json", err);
  }
  return inMemoryConfig;
}

export function getActiveRazorpay(): RazorpayAccount {
  const config = loadPaymentGateways();
  if (config.activeAccount === "1") {
    return config.account1;
  }
  return config.account2;
}
