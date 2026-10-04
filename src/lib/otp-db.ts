import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface OtpAttemptRecord {
  id: string;
  phone: string;
  hashedCode: string;
  expiresAt: Date | string;
  attempts: number;
  createdAt: Date | string;
}

export async function findOtpAttempt(phone: string): Promise<OtpAttemptRecord | null> {
  if (prisma.otpAttempt?.findUnique) {
    try {
      return await prisma.otpAttempt.findUnique({ where: { phone } });
    } catch {
      // Fall through to raw query fallback
    }
  }

  const results: any[] = await prisma.$queryRawUnsafe(
    "SELECT id, phone, hashedCode, expiresAt, attempts, createdAt FROM OtpAttempt WHERE phone = ? LIMIT 1",
    phone
  );

  if (results && results.length > 0) {
    const row = results[0];
    return {
      id: row.id,
      phone: row.phone,
      hashedCode: row.hashedCode,
      expiresAt: new Date(row.expiresAt),
      attempts: Number(row.attempts || 0),
      createdAt: new Date(row.createdAt),
    };
  }

  return null;
}

export async function saveOtpAttempt(
  phone: string,
  hashedCode: string,
  expiresAt: Date
): Promise<void> {
  const now = new Date();

  if (prisma.otpAttempt?.upsert) {
    try {
      await prisma.otpAttempt.upsert({
        where: { phone },
        update: {
          hashedCode,
          expiresAt,
          attempts: { increment: 1 },
          createdAt: now,
        },
        create: {
          phone,
          hashedCode,
          expiresAt,
          attempts: 1,
          createdAt: now,
        },
      });
      return;
    } catch {
      // Fall through to raw query
    }
  }

  const existing = await findOtpAttempt(phone);
  if (existing) {
    await prisma.$executeRawUnsafe(
      "UPDATE OtpAttempt SET hashedCode = ?, expiresAt = ?, attempts = attempts + 1, createdAt = ? WHERE phone = ?",
      hashedCode,
      expiresAt.toISOString(),
      now.toISOString(),
      phone
    );
  } else {
    const id = `otp_${crypto.randomBytes(8).toString("hex")}`;
    await prisma.$executeRawUnsafe(
      "INSERT INTO OtpAttempt (id, phone, hashedCode, expiresAt, attempts, createdAt) VALUES (?, ?, ?, ?, 1, ?)",
      id,
      phone,
      hashedCode,
      expiresAt.toISOString(),
      now.toISOString()
    );
  }
}

export async function removeOtpAttempt(phone: string): Promise<void> {
  if (prisma.otpAttempt?.delete) {
    try {
      await prisma.otpAttempt.delete({ where: { phone } }).catch(() => {});
      return;
    } catch {
      // Fall through to raw query
    }
  }

  await prisma.$executeRawUnsafe(
    "DELETE FROM OtpAttempt WHERE phone = ?",
    phone
  ).catch(() => {});
}
