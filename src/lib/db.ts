import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------- url alias
// Di Vercel (Storage > Neon Postgres), nama env bisa berbeda tergantung cara
// koneksi: DATABASE_URL, POSTGRES_PRISMA_URL, atau POSTGRES_URL. Skema Prisma
// membaca env("DATABASE_URL") — jadi di sini kita alias-kan sekali di awal.
// Sambungan via pooler (pgbouncer) juga perlu parameter pgbouncer=true agar
// Prisma tidak memakai prepared statement yang ditolak pgbouncer.
function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  let url = raw.trim();
  if (!url) return url;
  if (/pooler\.[^/]+/i.test(url) && !/pgbouncer=true/i.test(url)) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=10';
  }
  return url;
}

if (!process.env.DATABASE_URL) {
  const fallback =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    undefined;
  const aliased = normalizeDatabaseUrl(fallback);
  if (aliased) process.env.DATABASE_URL = aliased;
} else {
  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)!;
}

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
