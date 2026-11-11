#!/usr/bin/env python3
"""Olah data 449 responden DASS-21 dari Google Form.
Skoring identik dengan src/lib/dass21.ts (web):
  - depresi item [3,5,10,13,16,17,21], kecemasan [2,4,7,9,15,19,20], stres [1,6,8,11,12,14,18]
  - skor subskala = jumlah raw × 2
  - kategori per cut-off Lovibond & Lovibond (1995)
Etika: hanya responden "Saya bersedia" yang masuk statistik utama (N=434).
Output: download/obrolan/... -> per-responden CSV utk klasifikasi tema + pickle utk builder Excel.
"""
import pandas as pd
import numpy as np
import json, os

SRC = "/home/z/my-project/upload/RAHASIA-data utk salsa.xlsx"
OUT_DIR = "/home/z/my-project/data_out"
os.makedirs(OUT_DIR, exist_ok=True)

# ---------- konstanta identik src/lib/dass21.ts ----------
SUBSCALE_ITEMS = {
    "depresi": [3, 5, 10, 13, 16, 17, 21],
    "kecemasan": [2, 4, 7, 9, 15, 19, 20],
    "stres": [1, 6, 8, 11, 12, 14, 18],
}
BANDS = {
    "depresi": [(0, 9, "Normal"), (10, 13, "Ringan"), (14, 20, "Sedang"), (21, 27, "Berat"), (28, 999, "Sangat Berat")],
    "kecemasan": [(0, 7, "Normal"), (8, 9, "Ringan"), (10, 14, "Sedang"), (15, 19, "Berat"), (20, 999, "Sangat Berat")],
    "stres": [(0, 14, "Normal"), (15, 18, "Ringan"), (19, 25, "Sedang"), (26, 33, "Berat"), (34, 999, "Sangat Berat")],
}
LABEL2VAL = {"Tidak Pernah": 0, "Kadang-kadang": 1, "Sering": 2, "Selalu": 3}

def classify(sub, score):
    for lo, hi, label in BANDS[sub]:
        if lo <= score <= hi:
            return label
    return "Tidak terkategori"

# ---------- baca ----------
df = pd.read_excel(SRC)
df.columns = [str(c).strip() for c in df.columns]
cols = list(df.columns)
assert df.shape[0] == 449, f"jumlah baris tak terduga: {df.shape[0]}"

item_cols = {i: cols[4 + i] for i in range(1, 22)}  # kolom ke-5..25 = item 1..21

# verifikasi semua label dikenali
for i, c in item_cols.items():
    unk = set(df[c].dropna().unique()) - set(LABEL2VAL)
    assert not unk, f"item {i}: label tak dikenal {unk}"

# ---------- skor per responden ----------
out = pd.DataFrame()
out["ID"] = [f"R-{i+1:03d}" for i in range(len(df))]
out["Timestamp"] = pd.to_datetime(df[cols[0]], errors="coerce").dt.strftime("%Y-%m-%d %H:%M")
out["Persetujuan"] = df[cols[1]].str.strip()
out["IkutAnalisis"] = np.where(out["Persetujuan"] == "Saya bersedia", "Ya", "Tidak (etika)")
bahagia = df[cols[2]].str.strip()
out["KeluargaBahagia"] = bahagia
out["AlasanTidakBahagia"] = df[cols[3]].fillna("").astype(str).str.strip()
out["Keluhan"] = df[cols[4]].fillna("").astype(str).str.strip()

for i in range(1, 22):
    out[f"Item{i:02d}"] = df[item_cols[i]].map(LABEL2VAL).astype(int)

for sub, items in SUBSCALE_ITEMS.items():
    raw = out[[f"Item{i:02d}" for i in items]].sum(axis=1)
    out[f"Raw_{sub}"] = raw
    out[f"Skor_{sub}"] = raw * 2
    out[f"Kategori_{sub}"] = out[f"Skor_{sub}"].apply(lambda s: classify(sub, s))

# kesesuaian rentang skor (raw 0-21, skor x2 = 0-42)
assert out["Skor_depresi"].between(0, 42).all() and out["Skor_kecemasan"].between(0, 42).all() and out["Skor_stres"].between(0, 42).all()

n = len(out)
n_ok = (out["IkutAnalisis"] == "Ya").sum()
print(f"Total baris: {n} | bersedia (ikut analisis): {n_ok} | tidak bersedia: {n - n_ok}")

# ---------- statistik (hanya yang bersedia) ----------
d = out[out["IkutAnalisis"] == "Ya"].copy()
stats = {}
for sub in SUBSCALE_ITEMS:
    s = d[f"Skor_{sub}"]
    stats[sub] = {
        "n": int(s.count()), "mean": round(float(s.mean()), 2), "median": float(s.median()),
        "sd": round(float(s.std()), 2), "min": int(s.min()), "max": int(s.max()),
    }
    print(sub, stats[sub])
    print("  distribusi kategori:", d[f"Kategori_{sub}"].value_counts().to_dict())

# ---------- simpan ----------
out.to_csv(f"{OUT_DIR}/dass21_per_responden.csv", index=False, encoding="utf-8-sig")
with open(f"{OUT_DIR}/stats_dass21.json", "w") as f:
    json.dump(stats, f, ensure_ascii=False, indent=1)

# crosstalk: keluarga bahagia vs kategori (untuk sheet tambahan)
ct = pd.crosstab(d["KeluargaBahagia"], [d["Kategori_depresi"], ], normalize="index")
print("\nProporsi kategori depresi menurut kebahagiaan keluarga:")
print((ct * 100).round(1))
print("\nOK -> CSV per responden & stats tersimpan di", OUT_DIR)
