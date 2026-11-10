// Seed akun admin pengembangan (port dari create_admin.py + seed_data.py asli).
// Dipakai: bun run db:seed
// Username/sandi dibaca dari env ADMIN_USERNAME/ADMIN_PASSWORD (default: admin/admin123).
// HANYA untuk pengembangan — ganti sandi untuk layanan nyata.

import { PrismaClient } from '@prisma/client';
import { pbkdf2, randomBytes } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);
const db = new PrismaClient();

async function hashPassword(password) {
  const salt = randomBytes(16);
  const dk = await pbkdf2Async(password, salt, 390000, 32, 'sha256');
  return ['pbkdf2_sha256', '390000', salt.toString('base64'), dk.toString('base64')].join('$');
}

const username = (process.env.ADMIN_USERNAME || 'admin').trim();
const password = process.env.ADMIN_PASSWORD || 'admin123';

const existing = await db.adminUser.findUnique({ where: { username } });
if (existing) {
  console.log(`Akun admin '${username}' sudah ada - dilewati.`);
} else {
  await db.adminUser.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      role: 'admin',
      namaLengkap: 'Admin UPA BK (dev)',
    },
  });
  console.log(`Akun admin '${username}' berhasil dibuat (password dari ADMIN_PASSWORD / default dev).`);
}
await db.$disconnect();
