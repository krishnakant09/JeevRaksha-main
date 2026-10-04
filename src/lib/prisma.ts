import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  _v?: number;
};

// Increment SCHEMA_VERSION to force re-instantiation when Prisma schema changes
const SCHEMA_VERSION = 4;

if (globalForPrisma._v !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma._v = SCHEMA_VERSION;
}

function createPrismaClient(): PrismaClient {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NOW_REGION
  );

  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const src = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, tmpDbPath);
          const wal = path.join(process.cwd(), 'prisma', 'dev.db-wal');
          if (fs.existsSync(wal)) {
            try { fs.copyFileSync(wal, tmpDbPath + '-wal'); } catch {}
          }
          const shm = path.join(process.cwd(), 'prisma', 'dev.db-shm');
          if (fs.existsSync(shm)) {
            try { fs.copyFileSync(shm, tmpDbPath + '-shm'); } catch {}
          }
        } catch (e) {
          console.warn('[Prisma] Failed to copy SQLite file to /tmp:', e);
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
      return new PrismaClient({
        datasources: {
          db: {
            url: `file:${tmpDbPath}`,
          },
        },
      });
    }
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
