// Build command untuk Vercel (dipanggil lewat vercel.json).
//
// Urutan:
//  1. Jika DATABASE_URL Postgres sudah tersambung (Vercel Storage > Neon),
//     buat/selaraskan tabel dengan `prisma db push` memakai skema Postgres
//     dan koneksi langsung (unpooled) agar tidak bentrok dengan pgbouncer.
//  2. Generate Prisma Client varian Postgres.
//  3. next build (tanpa langkah copy standalone — Vercel menangani outputnya).
//
// Jika database belum tersambung saat deploy pertama, langkah 1 dilewati
// (aplikasi tetap ter-build; tabel dibuat otomatis pada deploy berikutnya).

import { spawnSync } from 'child_process';

function run(cmd, args, extraEnv = {}) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...extraEnv },
  });
  if (r.status !== 0) {
    console.error(`[vercel-build] gagal: ${cmd} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

const poolUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  '';
const directUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DIRECT_URL ||
  poolUrl;

if (/^postgres(ql)?:\/\//i.test(poolUrl)) {
  console.log('[vercel-build] Database Postgres terdeteksi — jalankan prisma db push …');
  // db push memakai env DATABASE_URL dari skema; diarahkan ke koneksi langsung
  // (unpooled) karena pgbouncer tidak mendukung migrasi/prepared statement.
  run('npx', [
    'prisma', 'db', 'push',
    '--accept-data-loss',
    '--skip-generate',
    '--schema', 'prisma/schema.postgres.prisma',
  ], { DATABASE_URL: directUrl });
} else {
  console.log(
    '[vercel-build] DATABASE_URL Postgres belum diset — lewati db push. ' +
      'Hubungkan Storage > Neon Postgres di dashboard Vercel, lalu redeploy.'
  );
}

run('npx', ['prisma', 'generate', '--schema', 'prisma/schema.postgres.prisma']);
run('npx', ['next', 'build']);
