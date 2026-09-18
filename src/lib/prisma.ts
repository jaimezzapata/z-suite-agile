import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Instanciamos el cliente
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// En desarrollo, guardamos la instancia en globalThis para evitar saturar la base de datos
// con nuevas conexiones en cada recarga por el Hot Module Replacement (HMR) de Next.js.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
