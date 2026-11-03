import crypto from 'crypto';

const TOKEN_SECRET = process.env.DOWNLOAD_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || 'secure_jwt_token_secret_digital_marketplace_2026';

export interface DownloadTokenPayload {
  orderId: string;
  paymentId: string;
  email: string;
  productIds: string[];
  exp: number; // timestamp in milliseconds
  iat: number;
}

/**
 * Generate a cryptographically signed HMAC-SHA256 download token.
 * Contains order and product metadata, protected against tampering.
 */
export function generateDownloadToken(
  payload: Omit<DownloadTokenPayload, 'exp' | 'iat'>,
  expiresInHours: number = 72
): string {
  const now = Date.now();
  const fullPayload: DownloadTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInHours * 60 * 60 * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify HMAC signature, validity, and expiration of a download token.
 */
export function verifyDownloadToken(token: string): {
  valid: boolean;
  payload?: DownloadTokenPayload;
  error?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is missing' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token format' };
  }

  const [payloadBase64, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Invalid token signature (Tampering detected)' };
    }

    const payload: DownloadTokenPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8')
    );

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Download token has expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification failed' };
  }
}
