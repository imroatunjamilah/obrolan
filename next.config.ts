import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" dipakai untuk menjalankan server produksi di sandbox ini;
  // di Vercel output ditangani sendiri oleh platform, jadi dinonaktifkan.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  // Sistem prompt chatbot dibaca dari file di runtime — pastikan file-nya
  // ikut terpaket ke fungsi /api/chat/* saat deploy (Vercel).
  outputFileTracingIncludes: {
    "/api/chat/**": ["./prompts/**"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
