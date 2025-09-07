import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance across hot reloads in Next.js dev
const globalForPrisma = global as typeof global & { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
