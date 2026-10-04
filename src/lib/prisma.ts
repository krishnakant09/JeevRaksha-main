import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  _v?: number;
};

// Increment SCHEMA_VERSION to force re-instantiation when Prisma schema changes
const SCHEMA_VERSION = 3;

if (globalForPrisma._v !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma._v = SCHEMA_VERSION;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
