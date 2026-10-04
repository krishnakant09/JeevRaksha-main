import crypto from "crypto";

const OTP_SECRET =
  process.env.OTP_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "jeevraksha-secure-otp-secret-key-2026";

export interface OtpChallengeData {
  phone: string;
  hashedCode: string;
  expiresAt: number; // timestamp ms
  attempts?: number;
}

export function createOtpChallengeToken(data: OtpChallengeData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyOtpChallengeToken(token: string): OtpChallengeData | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(payload)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const data: OtpChallengeData = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    if (!data.phone || !data.hashedCode || !data.expiresAt) return null;

    if (Date.now() > data.expiresAt) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
