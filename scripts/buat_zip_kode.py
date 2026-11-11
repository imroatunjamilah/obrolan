#!/usr/bin/env python3
"""Buat ZIP kode proyek obrolan untuk diunduh & diekstrak di laptop.
Exclude: kredensial (.env), data sensitif (upload/), build artifacts, sandbox infra.
"""
import os, zipfile, fnmatch

ROOT = "/home/z/my-project"
OUT = "/home/z/my-project/download/obrolan-kode.zip"

EXCLUDE_DIRS = {"node_modules", ".next", ".git", ".ssh-deploy", "data_out", "upload", "download", "skills", ".turbo", ".vercel", "agent-ctx", "__pycache__", "hasil", "db"}
EXCLUDE_FILES = {".env", ".z-ai-config", "dev.log", "next-env.d.ts"}
EXCLUDE_PATTERNS = ["*.db", "*.db-journal", "*.log", "*.zip"]

count = 0
total_size = 0
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for dirpath, dirnames, filenames in os.walk(ROOT):
        # filter direktori
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for f in filenames:
            if f in EXCLUDE_FILES:
                continue
            if any(fnmatch.fnmatch(f, p) for p in EXCLUDE_PATTERNS):
                continue
            full = os.path.join(dirpath, f)
            rel = os.path.relpath(full, ROOT)
            # folder root proyek dinamai "obrolan" agar saat ekstrak jadi 1 folder rapi
            z.write(full, arcname=os.path.join("obrolan", rel))
            count += 1
            total_size += os.path.getsize(full)

print(f"OK: {OUT}")
print(f"File: {count} | ukuran asli: {total_size/1024/1024:.1f} MB | zip: {os.path.getsize(OUT)/1024/1024:.1f} MB")

# Verifikasi keamanan: pastikan TIDAK ada file sensitif
with zipfile.ZipFile(OUT) as z:
    names = z.namelist()
    bad = [n for n in names if any(x in n for x in ("RAHASIA", ".ssh-deploy", "data_out", "upload/", "node_modules/", ".git/", "skills/", ".db")) or n.endswith("/.env") or n.endswith("/.env.")]
    print("CEK SENSITIF:", "AMAN - tidak ada file sensitif" if not bad else f"BAHAYA: {bad}")
    top = sorted(set(n.split("/")[1] for n in names if n.count("/") >= 1))
    print("Top-level:", top)
