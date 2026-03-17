import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient instance to avoid connection limit issues
let globalPrisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient();
  }
  return globalPrisma;
}
