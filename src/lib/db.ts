import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In production we reuse a single shared client (cached on globalThis) to
// avoid opening a new connection per module evaluation. In development we
// intentionally create a fresh client each time this module is evaluated so
// that schema changes picked up via `prisma db:push` + `prisma generate`
// (which rewrite the generated client files in node_modules) are reflected
// without having to fully restart the Next.js dev server.
export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ?? new PrismaClient())
    : new PrismaClient()

if (process.env.NODE_ENV === 'production') globalForPrisma.prisma = db
