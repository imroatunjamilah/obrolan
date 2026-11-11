// Memastikan selalu ada minimal satu akun admin internal sehingga aplikasi
// yang baru dideploy (mis. di Vercel dengan database kosong) tetap bisa
// dimasuki petugas tanpa langkah seed manual. Idempoten: hanya membuat akun
// jika tabel AdminUser masih kosong. Username/sandi dari env
// ADMIN_USERNAME/ADMIN_PASSWORD (default: admin/admin123).
//
// CATATAN KEAMANAN: untuk layanan nyata, set ADMIN_PASSWORD baru di env
// Vercel sebelum deploy pertama.

import { db } from './db';
import { hashPassword } from './auth';

let ensured = false;

export async function ensureDefaultAdmin(): Promise<void> {
  if (ensured) return;
  try {
    const count = await db.adminUser.count();
    if (count === 0) {
      const username = (process.env.ADMIN_USERNAME || 'admin').trim();
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      await db.adminUser.create({
        data: {
          username,
          passwordHash: await hashPassword(password),
          role: 'admin',
          namaLengkap: 'Admin UPA BK',
        },
      });
      console.log(`[ensure-admin] akun admin awal dibuat: ${username}`);
    }
    ensured = true;
  } catch (err: unknown) {
    // Jangan pernah blokir login karena seeding gagal (mis. DB belum siap);
    // biarkan rute login menangani error lanjutannya.
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ensure-admin] gagal:', message);
  }
}
