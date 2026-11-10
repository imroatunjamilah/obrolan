# Ruang Layanan Konseling UPA BK UTM

Prototipe riset layanan konseling mahasiswa berbasis web: **pendaftaran →
skrining DASS-21 → konseling awal ber-LLM → tindak lanjut petugas**.
Dikembangkan untuk riset chatbot konseling UPA BK (Unit Pelayanan dan
Pembinaan Konseling) Universitas Trunojoyo Madura.

## Modul

| Modul | Untuk siapa | Isi |
| --- | --- | --- |
| **Konseling** | Mahasiswa | Chatbot konseling berbasis LLM dengan arsitektur keamanan 3 lapis |
| **Skrining DASS-21** | Mahasiswa | 21 pernyataan DASS-21 (Bahasa Indonesia) — hasil hanya untuk petugas |
| **Pendaftaran** | Mahasiswa | Data diri, jenis layanan, preferensi jadwal, consent |
| **Petugas** | Admin/petugas | Statistik, daftar pendaftaran, skor & kategori DASS-21, transcript percakapan, status tindak lanjut |

## Arsitektur keamanan chatbot (3 lapis)

1. **Layer 1 — Krisis**: kata kunci krisis ditangani **tanpa LLM** → pesan
   keselamatan (112 / 119 ext. 8) + penanda audit `[ESKALASI]`.
2. **Layer 2 — Pendampingan**: permintaan bertemu konselor → jawaban tetap +
   penanda audit `[OTOMATIS]`, percakapan berlanjut.
3. **Layer 3 — LLM**: percakapan umum dijawab LLM dengan system prompt
   `prompts/chatbot_system_prompt.md` (file terpisah, mudah diedit untuk
   eksperimen).

## Kebijakan privasi DASS-21

- Mahasiswa **hanya** melihat konfirmasi generik setelah mengirim jawaban.
- Skor (jumlah item × 2) dan kategori (Normal/Ringan/Sedang/Berat/Sangat
  Berat, cut-off Lovibond & Lovibond 1995) dihitung di server dan **hanya
  tampil di panel petugas**.
- Akses jawaban mahasiswa dilindungi `chat_token` (HMAC-SHA256 dari id
  pendaftaran).
- Redaksi soal adalah terjemahan kerja — wajib divalidasi UPA BK sebelum
  dipakai untuk layanan nyata. Skrining **bukan diagnosis**.

## Teknologi

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui ·
Prisma + SQLite · z-ai-web-dev-sdk (LLM, server-side only) · TanStack Query.

## Menjalankan

```bash
cp .env.example .env          # sesuaikan SECRET_KEY utk produksi
bun install
bun run db:push               # buat/selaraskan tabel SQLite
bun run db:seed               # akun admin awal (admin/admin123, dev saja)
bun run dev                   # http://localhost:3000
```

Kredensial panel petugas bawaan pengembangan: `admin` / `admin123`
(atur lewat `ADMIN_USERNAME`/`ADMIN_PASSWORD` di `.env`, WAJIB diganti untuk
layanan nyata).

## Struktur penting

```
prisma/schema.prisma          # Registration, Dass21Response, Followup, AdminUser, Conversation, Message
src/lib/dass21.ts             # 21 soal + scoring + kategori (port dari proyek asli)
src/lib/auth.ts               # PBKDF2-SHA256, chat token HMAC, sesi admin
src/app/api/registrations/    # pendaftaran + opsi form
src/app/api/screening/dass21/ # questions (publik) & submit (tanpa skor)
src/app/api/admin/            # login/sesi, statistik, data petugas, tindak lanjut
src/app/api/chat/             # percakapan + pesan (LLM + keamanan 3 lapis)
prompts/chatbot_system_prompt.md
```

## Batasan prototipe

Prototipe riset, bukan pengganti konseling profesional. Dalam kondisi darurat
hubungi **112** atau **119 ext. 8** (Sejiwa, Kementerian Kesehatan RI).
