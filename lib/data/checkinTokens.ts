import { createHmac, randomUUID, timingSafeEqual } from "crypto";

const CHECKIN_TOKEN_TTL_MS = 5 * 60 * 1000;

function getTokenSecret() {
  const secret =
    process.env.CHECKIN_TOKEN_SECRET ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!secret) {
    throw new Error("チェックイントークンの秘密鍵が設定されていません。");
  }

  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", getTokenSecret()).update(payload).digest("base64url");
}

export async function createCheckinToken(storeId: string) {
  const expiresAt = new Date(Date.now() + CHECKIN_TOKEN_TTL_MS).toISOString();
  const payload = toBase64Url(
    JSON.stringify({
      storeId,
      expiresAt,
      nonce: randomUUID()
    })
  );
  const signature = sign(payload);

  return {
    token: `${payload}.${signature}`,
    expiresAt
  };
}

export function validateCheckinToken(storeId: string, token: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    throw new Error("QRコードの有効期限が切れています。店頭のQRコードを読み直してください。");
  }

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error("QRコードの有効期限が切れています。店頭のQRコードを読み直してください。");
  }

  const parsed = JSON.parse(fromBase64Url(payload)) as {
    storeId?: string;
    expiresAt?: string;
  };

  if (parsed.storeId !== storeId || !parsed.expiresAt || new Date(parsed.expiresAt) <= new Date()) {
    throw new Error("QRコードの有効期限が切れています。店頭のQRコードを読み直してください。");
  }
}
