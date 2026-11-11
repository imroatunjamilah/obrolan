#!/usr/bin/env python3
"""Bangun Excel hasil olahan DASS-21 (multi-sheet + grafik) untuk user.
Sumber: data_out/dass21_per_responden.csv, stats_dass21.json, tema_keluhan.json
Output: download/Hasil-Olah-DASS21-449-Responden.xlsx  (dipakai juga utk upload GitHub)
"""
import pandas as pd
import numpy as np
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# Font (aturan proyek): Noto Sans SC + DejaVu
try:
    fm.fontManager.addfont("/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf")
except Exception:
    pass
plt.rcParams["font.sans-serif"] = ["Noto Sans SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.drawing.image import Image as XLImage
from openpyxl.chart import BarChart, Reference

D = "/home/z/my-project/data_out"
OUT_XLSX = "/home/z/my-project/download/Hasil-Olah-DASS21-449-Responden.xlsx"
os.makedirs("/home/z/my-project/download", exist_ok=True)
os.makedirs(f"{D}/grafik", exist_ok=True)

df = pd.read_csv(f"{D}/dass21_per_responden.csv", encoding="utf-8-sig")
stats = json.load(open(f"{D}/stats_dass21.json"))
temas = json.load(open(f"{D}/tema_keluhan.json"))["temas"]

df["Timestamp"] = df["Timestamp"].fillna("tidak terbaca")
df["TemaKeluhan"] = df["ID"].map(temas).fillna("Tidak ada keluhan spesifik")

d = df[df["IkutAnalisis"] == "Ya"].copy()  # N=434 utk statistik
N_ALL, N = len(df), len(d)

# ---------- tema utk N=434 ----------
tema_n = d["TemaKeluhan"].value_counts()
KATEGORI = ["Normal", "Ringan", "Sedang", "Berat", "Sangat Berat"]
dist = {}
for sub in ["depresi", "kecemasan", "stres"]:
    vc = d[f"Kategori_{sub}"].value_counts()
    dist[sub] = [int(vc.get(k, 0)) for k in KATEGORI]

# ---------- gaya ----------
HEADER_BG = PatternFill("solid", fgColor="1F4E79")
SUB_BG = PatternFill("solid", fgColor="D9E2F3")
WARN_BG = PatternFill("solid", fgColor="FFF2CC")
HEADER_FT = Font(bold=True, color="FFFFFF", size=11)
TITLE_FT = Font(bold=True, size=14, color="1F4E79")
BOLD = Font(bold=True)
THIN = Border(*[Side(style="thin", color="B0B7C3")] * 4)
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)
LEFT = Alignment(horizontal="left", vertical="top", wrap_text=True)

def style_header(ws, row, ncols):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = HEADER_BG
        cell.font = HEADER_FT
        cell.alignment = CENTER
        cell.border = THIN

def set_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

wb = Workbook()

# ============================================================ 1. RINGKASAN
ws = wb.active
ws.title = "Ringkasan"
set_widths(ws, [46, 14, 14, 14])
rows = [
    ("HASIL OLAHAN DATA SKRINING DASS-21 — 449 RESPONDEN", None),
    ("", None),
    ("Sumber data", "Kuesioner Google Form (449 respons masuk), diisi 11–12 Agustus 2026"),
    ("Instrumen", "DASS-21 (Depression Anxiety Stress Scales, 21 item; Lovibond & Lovibond, 1995)"),
    ("Responden bersedia dianalisis (N)", f"{N} dari {N_ALL} — 15 orang menyatakan 'tidak bersedia' dan DIKECUALIKAN dari semua statistik (etika penelitian)"),
    ("Periode pengisian", "11–12 Agustus 2026 (402 respons tgl 12, 46 respons tgl 11; 1 timestamp tidak terbaca)"),
    ("", None),
    ("TEMUAN UTAMA", None),
    ("Kecemasan paling menonjol", f"Rata-rata skor {stats['kecemasan']['mean']} (tertinggi di antara 3 subskala); {dist['kecemasan'][3]+dist['kecemasan'][4]} orang ({(dist['kecemasan'][3]+dist['kecemasan'][4])/N:.1%}) masuk kategori Berat/Sangat Berat"),
    ("Depresi", f"Rata-rata {stats['depresi']['mean']}; {dist['depresi'][2]} orang ({dist['depresi'][2]/N:.1%}) Sedang, {dist['depresi'][3]+dist['depresi'][4]} orang ({(dist['depresi'][3]+dist['depresi'][4])/N:.1%}) Berat/Sangat Berat"),
    ("Stres", f"Rata-rata {stats['stres']['mean']} (paling rendah); mayoritas {dist['stres'][0]} orang ({dist['stres'][0]/N:.1%}) Normal"),
    ("Tema keluhan terbanyak", f"{tema_n.index[0]} ({tema_n.iloc[0]} orang, {tema_n.iloc[0]/N:.1%}), disusul {tema_n.index[1]} ({tema_n.iloc[1]}) dan {tema_n.index[2]} ({tema_n.iloc[2]})"),
    ("Keluarga", "Dari 20 responden 'tidak bahagia' yang bersedia dianalisis, proporsi depresi Sedang/Sangat Berat jauh lebih tinggi dibanding yang 'bahagia' (lihat sheet Keluarga)"),
    ("", None),
    ("PERINGATAN", "DASS-21 adalah ALAT SKRINING, bukan diagnosis. Kategori memakai cut-off publikasi umum, bukan kategori resmi UPA BK."),
]
r = 1
for label, val in rows:
    if val is None:
        c = ws.cell(row=r, column=1, value=label)
        c.font = TITLE_FT
    elif label == "TEMUAN UTAMA":
        c = ws.cell(row=r, column=1, value=label)
        c.font = TITLE_FT
    else:
        c1 = ws.cell(row=r, column=1, value=label)
        c2 = ws.cell(row=r, column=2, value=val)
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=4)
        c2.alignment = LEFT
        if label in ("PERINGATAN",):
            c1.fill = WARN_BG; c2.fill = WARN_BG
        elif label in ("Sumber data", "Instrumen", "Responden bersedia dianalisis (N)", "Periode pengisian") or label in ("Kecemasan paling menonjol", "Depresi", "Stres", "Tema keluhan terbanyak", "Keluarga"):
            c1.font = BOLD
    r += 1

# ============================================================ 2. DISTRIBUSI KATEGORI + GRAFIK
ws = wb.create_sheet("Distribusi Kategori")
ws.cell(row=1, column=1, value="Distribusi Kategori DASS-21 (N=434 responden bersedia)").font = TITLE_FT
hdr = ["Kategori", "Depresi (org)", "Depresi (%)", "Kecemasan (org)", "Kecemasan (%)", "Stres (org)", "Stres (%)"]
for j, h in enumerate(hdr, 1):
    ws.cell(row=3, column=j, value=h)
style_header(ws, 3, len(hdr))
r = 4
for i, kat in enumerate(KATEGORI):
    ws.cell(row=r, column=1, value=kat)
    for s, sub in enumerate(["depresi", "kecemasan", "stres"]):
        n_k = dist[sub][i]
        ws.cell(row=r, column=2 + s * 2, value=n_k)
        c = ws.cell(row=r, column=3 + s * 2, value=n_k / N)
        c.number_format = "0.0%"
    for j in range(1, 8):
        ws.cell(row=r, column=j).border = THIN
    r += 1
ws.cell(row=r, column=1, value="TOTAL").font = BOLD
for s, sub in enumerate(["depresi", "kecemasan", "stres"]):
    ws.cell(row=r, column=2 + s * 2, value=N).font = BOLD
    c = ws.cell(row=r, column=3 + s * 2, value=1.0)
    c.number_format = "0.0%"

# grafik batang (native Excel chart)
ch = BarChart()
ch.type = "col"
ch.grouping = "clustered"
ch.title = "Distribusi Kategori DASS-21 (N=434)"
ch.y_axis.title = "Jumlah orang"
ch.x_axis.title = "Kategori"
data = Reference(ws, min_col=2, min_row=3, max_col=2, max_row=8)  # hanya Depresi (org)
# seri lain ditambah manual agar chart lengkap
data2 = Reference(ws, min_col=4, min_row=3, max_col=4, max_row=8)
data3 = Reference(ws, min_col=6, min_row=3, max_col=6, max_row=8)
cats = Reference(ws, min_col=1, min_row=4, max_row=8)
ch.add_data(data, titles_from_data=True)
ch.add_data(data2, titles_from_data=True)
ch.add_data(data3, titles_from_data=True)
ch.set_categories(cats)
ch.width = 22
ch.height = 11
ws.add_chart(ch, "J3")

# ============================================================ 3. DESKRIPTIF SKOR
ws = wb.create_sheet("Deskriptif Skor")
ws.cell(row=1, column=1, value="Statistik Deskriptif Skor DASS-21 (N=434)").font = TITLE_FT
ws.cell(row=2, column=1, value="Skor = jumlah jawaban mentah 7 item × 2 (setara DASS-42), rentang 0–42")
hdr = ["Subskala", "N", "Rata-rata", "Median", "SD", "Min", "Maks"]
for j, h in enumerate(hdr, 1):
    ws.cell(row=4, column=j, value=h)
style_header(ws, 4, len(hdr))
r = 5
for sub in ["depresi", "kecemasan", "stres"]:
    s = stats[sub]
    vals = [sub.capitalize(), s["n"], s["mean"], s["median"], s["sd"], s["min"], s["max"]]
    for j, v in enumerate(vals, 1):
        c = ws.cell(row=r, column=j, value=v)
        c.border = THIN
        if j >= 3:
            c.number_format = "0.00" if j in (3, 5) else "0"
    r += 1
note = ("Interpretasi: skor lebih tinggi = gejala lebih banyak/sering. Cut-off kategori ada di sheet Kamus Skoring. "
        "Skor dan kategori TIDAK PERNAH ditampilkan kepada mahasiswa oleh sistem web — hanya petugas UPA BK.")
ws.cell(row=r + 1, column=1, value=note).alignment = LEFT
ws.merge_cells(start_row=r + 1, start_column=1, end_row=r + 3, end_column=7)
set_widths(ws, [14, 8, 11, 10, 10, 8, 8])

# ============================================================ 4. TEMA KELUHAN + GRAFIK
ws = wb.create_sheet("Tema Keluhan")
ws.cell(row=1, column=1, value="Tema Keluhan Mahasiswa (2 minggu terakhir) — N=434").font = TITLE_FT
ws.cell(row=2, column=1, value="Klasifikasi teks keluhan: kata kunci terdefinisi + model bahasa (GLM) untuk kalimat ambigu")
hdr = ["Tema", "Jumlah", "Persen"]
for j, h in enumerate(hdr, 1):
    ws.cell(row=4, column=j, value=h)
style_header(ws, 4, 3)
r = 5
for tema, cnt in tema_n.items():
    ws.cell(row=r, column=1, value=tema)
    ws.cell(row=r, column=2, value=int(cnt))
    c = ws.cell(row=r, column=3, value=cnt / N)
    c.number_format = "0.0%"
    for j in range(1, 4):
        ws.cell(row=r, column=j).border = THIN
    r += 1
ws.cell(row=r, column=1, value="TOTAL").font = BOLD
ws.cell(row=r, column=2, value=N).font = BOLD

# matplotlib horizontal bar → PNG
fig, ax = plt.subplots(figsize=(9, 5.2), constrained_layout=True)
tt = tema_n.sort_values()
colors = ["#1F4E79" if t != "Tidak ada keluhan spesifik" else "#9DB2CC" for t in tt.index]
bars = ax.barh(tt.index, tt.values, color=colors)
for b, v in zip(bars, tt.values):
    ax.text(v + 1.5, b.get_y() + b.get_height() / 2, f"{v} ({v/N:.0%})", va="center", fontsize=9)
ax.set_xlabel("Jumlah responden")
ax.set_title("Tema keluhan mahasiswa (N=434)")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig(f"{D}/grafik/tema_keluhan.png", dpi=130)
plt.close(fig)

img = XLImage(f"{D}/grafik/tema_keluhan.png")
img.width, img.height = 640, 370
ws.add_image(img, "F4")
set_widths(ws, [44, 10, 10])

# ============================================================ 5. KELUARGA
ws = wb.create_sheet("Keluarga")
ws.cell(row=1, column=1, value="Kondisi Kebahagiaan Keluarga & Kaitannya dengan Depresi (N=434)").font = TITLE_FT
n_bah = int((d["KeluargaBahagia"] == "Bahagia").sum())
n_tbah = int((d["KeluargaBahagia"] == "Tidak Bahagia").sum())
ws.cell(row=2, column=1, value=f"Bahagia bersama orang tua/saudara: {n_bah} orang ({n_bah/N:.1%})  |  Tidak bahagia: {n_tbah} orang ({n_tbah/N:.1%})")
hdr = ["Kategori Depresi", "Bahagia (org)", "Bahagia (%)", "Tidak Bahagia (org)", "Tidak Bahagia (%)"]
for j, h in enumerate(hdr, 1):
    ws.cell(row=4, column=j, value=h)
style_header(ws, 4, len(hdr))
ct = pd.crosstab(d["KeluargaBahagia"], d["Kategori_depresi"])
r = 5
for kat in KATEGORI:
    b = int(ct.loc["Bahagia"].get(kat, 0)) if "Bahagia" in ct.index else 0
    t = int(ct.loc["Tidak Bahagia"].get(kat, 0)) if "Tidak Bahagia" in ct.index else 0
    ws.cell(row=r, column=1, value=kat)
    ws.cell(row=r, column=2, value=b)
    c = ws.cell(row=r, column=3, value=b / n_bah); c.number_format = "0.0%"
    ws.cell(row=r, column=4, value=t)
    c = ws.cell(row=r, column=5, value=t / n_tbah); c.number_format = "0.0%"
    for j in range(1, 6):
        ws.cell(row=r, column=j).border = THIN
    r += 1
note = ("Catatan: kelompok 'Tidak Bahagia' kecil ({} orang) sehingga persentasenya mudah berayun; gunakan sebagai indikasi awal, "
        "bukan kesimpulan statistik. Alasan mereka ditulis di sheet Data Per Responden (kolom AlasanTidakBahagia).").format(n_tbah)
ws.cell(row=r + 1, column=1, value=note).alignment = LEFT
ws.merge_cells(start_row=r + 1, start_column=1, end_row=r + 2, end_column=5)
set_widths(ws, [18, 13, 12, 17, 16])

# ============================================================ 6. DATA PER RESPONDEN
ws = wb.create_sheet("Data Per Responden")
kolom = ["ID", "Timestamp", "Persetujuan", "IkutAnalisis", "KeluargaBahagia", "AlasanTidakBahagia",
         "Keluhan", "TemaKeluhan"] + [f"Item{i:02d}" for i in range(1, 22)] + \
        ["Skor_depresi", "Kategori_depresi", "Skor_kecemasan", "Kategori_kecemasan", "Skor_stres", "Kategori_stres"]
sub = df[kolom]
for j, h in enumerate(sub.columns, 1):
    ws.cell(row=1, column=j, value=h)
style_header(ws, 1, len(sub.columns))
for i, row in enumerate(sub.itertuples(index=False), 2):
    for j, v in enumerate(row, 1):
        ws.cell(row=i, column=j, value=v)
        if j in (2, 6, 7, 8):
            ws.cell(row=i, column=j).alignment = Alignment(vertical="top")
ws.freeze_panes = "C2"
ws.auto_filter.ref = f"A1:{get_column_letter(len(sub.columns))}{len(sub)+1}"
ws.row_dimensions[1].height = 30
set_widths(ws, [8, 17, 14, 13, 14, 22, 38, 24] + [7] * 21 + [10, 13, 10, 14, 10, 12])
# tandai baris tidak bersedia
for i, v in enumerate(sub["IkutAnalisis"], 2):
    if v != "Ya":
        for j in range(1, len(sub.columns) + 1):
            ws.cell(row=i, column=j).fill = PatternFill("solid", fgColor="FCE4EC")

# ============================================================ 7. KAMUS SKORING
ws = wb.create_sheet("Kamus Skoring")
set_widths(ws, [30, 62])
ws.cell(row=1, column=1, value="KAMUS SKORING & METODOLOGI").font = TITLE_FT
r = 3
def blok(judul, isi=None):
    global r
    c = ws.cell(row=r, column=1, value=judul)
    c.font = BOLD; c.fill = SUB_BG; c.border = THIN
    c2 = ws.cell(row=r, column=2, value=isi or "")
    c2.alignment = LEFT; c2.border = THIN
    if isi is None:
        c2.fill = SUB_BG
    r += 1

blok("Sumber data", "Google Form 'RAHASIA-data utk salsa.xlsx' — 449 respons, diisi 11–12 Agustus 2026")
blok("Instrumen", "DASS-21 (Lovibond & Lovibond, 1995): 21 pernyataan, 3 subskala × 7 item (Depresi, Kecemasan, Stres)")
blok("Skala jawaban", "Tidak Pernah = 0, Kadang-kadang = 1, Sering = 2, Selalu = 3 (frekuensi dalam 7 hari terakhir)")
blok("Rumus skor", "Skor subskala = jumlah jawaban mentah 7 item × 2 (setara DASS-42). Rentang 0–42 per subskala.")
blok("Pemetaan item → subskala", "Depresi: item 3, 5, 10, 13, 16, 17, 21 | Kecemasan: item 2, 4, 7, 9, 15, 19, 20 | Stres: item 1, 6, 8, 11, 12, 14, 18")
blok("Cut-off Depresi", "Normal 0–9 | Ringan 10–13 | Sedang 14–20 | Berat 21–27 | Sangat Berat ≥28")
blok("Cut-off Kecemasan", "Normal 0–7 | Ringan 8–9 | Sedang 10–14 | Berat 15–19 | Sangat Berat ≥20")
blok("Cut-off Stres", "Normal 0–14 | Ringan 15–18 | Sedang 19–25 | Berat 26–33 | Sangat Berat ≥34")
blok("Cut-off", "Sumber cut-off: publikasi umum DASS-21 (Lovibond & Lovibond, 1995) — sama dengan yang dipakai aplikasi web (src/lib/dass21.ts)")
blok("Etika penelitian", "15 responden menjawab 'Saya tidak bersedia' → data lengkap tetap ditampilkan di sheet Data Per Responden (diberi warna merah muda) tetapi DIKECUALIKAN dari seluruh statistik (Kamus ini, Ringkasan, Distribusi, Deskriptif, Tema, Keluarga)")
blok("Klasifikasi tema keluhan", "2 tahap: (1) aturan kata kunci terdefinisi (deterministik, bisa diaudit); (2) sisa kalimat ambigu diklasifikasi model bahasa GLM (temperature 0.1) ke 12 tema tetap")
blok("Tools pengolahan", "Python: pandas (tabel), numpy (hitung), openpyxl (Excel), matplotlib (grafik); Node.js: z-ai-web-dev-sdk (tema keluhan)")
blok("Limitasi 1", "Item 15 dan 16 di kuesioner Google Form tertulis sama ('Saya merasa hampir panik') — kemungkinan salah cetak form; item 16 dianalisis sesuai penomoran standar DASS-21 (depresi: 'tidak dapat bersemangat')")
blok("Limitasi 2", "DASS-21 adalah alat SKRINING, bukan diagnosis; kategori bukan keputusan klinis")
blok("Limitasi 3", "1 dari 449 timestamp tidak terbaca (tertulis 1970); tidak memengaruhi skor")
blok("Jejak file", "skrip: scripts/olah_dass_excel.py, scripts/tema_keluhan.mjs, scripts/buat_excel_olah.py (di ZIP kode & GitHub)")

wb.save(OUT_XLSX)
print("OK ->", OUT_XLSX, f"({os.path.getsize(OUT_XLSX)/1024:.0f} KB)")

# verifikasi cepat
from openpyxl import load_workbook
wb2 = load_workbook(OUT_XLSX)
print("Sheets:", wb2.sheetnames)
ws2 = wb2["Data Per Responden"]
print("Baris data per responden:", ws2.max_row - 1, "| kolom:", ws2.max_column)
