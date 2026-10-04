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

// In-memory fallback store shared across serverless function lifetime
const globalForOtp = globalThis as unknown as {
  _inMemoryOtpStore?: Map<string, OtpAttemptRecord>;
};

if (!globalForOtp._inMemoryOtpStore) {
  globalForOtp._inMemoryOtpStore = new Map<string, OtpAttemptRecord>();
}

const memoryStore = globalForOtp._inMemoryOtpStore;

export async function findOtpAttempt(phone: string): Promise<OtpAttemptRecord | null> {
  const now = new Date();

  // 1. Check in-memory store first
  const memoryRecord = memoryStore.get(phone);
  if (memoryRecord) {
    if (new Date(memoryRecord.expiresAt) > now) {
      return memoryRecord;
    }
    // Expired in memory
    memoryStore.delete(phone);
  }

  // 2. Query Prisma with safe try-catch
  try {
    if (prisma.otpAttempt?.findUnique) {
      const record = await prisma.otpAttempt.findUnique({ where: { phone } }).catch(() => null);
      if (record) {
        memoryStore.set(phone, {
          id: record.id,
          phone: record.phone,
          hashedCode: record.hashedCode,
          expiresAt: record.expiresAt,
          attempts: record.attempts,
          createdAt: record.createdAt,
        });
        return record;
      }
    }

    const results = (await prisma.$queryRawUnsafe(
      "SELECT id, phone, hashedCode, expiresAt, attempts, createdAt FROM OtpAttempt WHERE phone = ? LIMIT 1",
      phone
    ).catch(() => [])) as any[];

    if (results && results.length > 0) {
      const row = results[0];
      const parsed: OtpAttemptRecord = {
        id: row.id,
        phone: row.phone,
        hashedCode: row.hashedCode,
        expiresAt: new Date(row.expiresAt),
        attempts: Number(row.attempts || 0),
        createdAt: new Date(row.createdAt),
      };
      memoryStore.set(phone, parsed);
      return parsed;
    }
  } catch (err) {
    // If DB read fails, silently rely on memory
    console.warn("[OTP-DB] Database read unavailable, falling back to memory:", (err as any)?.message);
  }

  return null;
}

export async function saveOtpAttempt(
  phone: string,
  hashedCode: string,
  expiresAt: Date
): Promise<void> {
  const now = new Date();
  const existingMemory = memoryStore.get(phone);
  const attempts = (existingMemory?.attempts || 0) + 1;
  const id = existingMemory?.id || `otp_${crypto.randomBytes(8).toString("hex")}`;

  const record: OtpAttemptRecord = {
    id,
    phone,
    hashedCode,
    expiresAt,
    attempts,
    createdAt: now,
  };

  // 1. Always store in memory store (guarantees OTP is preserved even if DB is read-only)
  memoryStore.set(phone, record);

  // 2. Safely attempt to persist to DB
  try {
    if (prisma.otpAttempt?.upsert) {
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
    }

    const existing = await findOtpAttempt(phone).catch(() => null);
    if (existing) {
      await prisma.$executeRawUnsafe(
        "UPDATE OtpAttempt SET hashedCode = ?, expiresAt = ?, attempts = attempts + 1, createdAt = ? WHERE phone = ?",
        hashedCode,
        expiresAt.toISOString(),
        now.toISOString(),
        phone
      );
    } else {
      await prisma.$executeRawUnsafe(
        "INSERT INTO OtpAttempt (id, phone, hashedCode, expiresAt, attempts, createdAt) VALUES (?, ?, ?, ?, 1, ?)",
        id,
        phone,
        hashedCode,
        expiresAt.toISOString(),
        now.toISOString()
      );
    }
  } catch (dbErr) {
    // When deploying on read-only environments like Vercel Lambda without external DB,
    // catch error so the HTTP request succeeds and OTP is verified from memory/cookie!
    console.warn("[OTP-DB] Database write bypassed (using memory/stateless OTP):", (dbErr as any)?.message);
  }
}

export async function removeOtpAttempt(phone: string): Promise<void> {
  // 1. Remove from memory store
  memoryStore.delete(phone);

  // 2. Safely attempt to remove from DB
  try {
    if (prisma.otpAttempt?.delete) {
      await prisma.otpAttempt.delete({ where: { phone } }).catch(() => {});
      return;
    }
    await prisma.$executeRawUnsafe("DELETE FROM OtpAttempt WHERE phone = ?", phone).catch(() => {});
  } catch {
    // Ignore DB removal failures
  }
}
