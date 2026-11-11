// Fase B — Klasifikasi tema keluhan responden dengan LLM (z-ai-web-dev-sdk, mode sandbox).
// Input : data_out/dass21_per_responden.csv
// Output: data_out/tema_keluhan.json  ({ "R-001": "Rindu keluarga/rumah", ... })
import fs from 'fs';
import ZAI from 'z-ai-web-dev-sdk';

const CSV = '/home/z/my-project/data_out/dass21_per_responden.csv';
const OUT = '/home/z/my-project/data_out/tema_keluhan.json';

const TEMAS = [
  'Rindu keluarga/rumah',
  'Masalah keluarga (konflik/kondisi orang tua)',
  'Akademik (tugas/nilai/jadwal/dosen/skripsi)',
  'Cemas & overthinking',
  'Kelelahan & stres',
  'Sedih/hilang semangat/mood turun',
  'Hubungan sosial (teman/lingkungan baru)',
  'Keuangan/ekonomi',
  'Tidur & kesehatan fisik',
  'Percaya diri/takut gagal',
  'Tidak ada keluhan spesifik',
  'Lainnya',
];

const LISTS = TEMAS.map((t, i) => `${i + 1}. ${t}`).join('\n');

function parseCsv(text) {
  text = text.replace(/^\uFEFF/, ''); // buang BOM utf-8-sig
  const rows = [];
  let cur = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { cur.push(field); field = ''; }
    else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field !== '' || cur.length) { cur.push(field); rows.push(cur); }
  const header = rows.shift();
  return rows.filter(r => r.length === header.length)
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const NO_COMPLAINT = /^(tidak ada|tidak punya|gak ada|gk ada|ga ada|gada|ngga ada|nggak ada|nihil|none|kosong|aman(\s|$)|aman sentosa|sentosa|biasa aja|baik[- ]?baik saja|baik saja|baik|lancar|normal|ok|oke|nope|kan|hgpt|-|\(-\)|tiada)$/;

function keywordTheme(t) {
  const s = t.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!s || s === '-' || s === '(-)' || NO_COMPLAINT.test(s)) return 'Tidak ada keluhan spesifik';
  if (/(kangen|rindu|homesick|rumah|ortu|orang tua|ayah|ibu|mamak|bapak|keluarga|pulang kampung|merantau|pertama kali keluar kota)/.test(s))
    return /konflik|marah|ribut|(orang tua|ortu|ayah|ibu|bapak|mamak).*(sakit|meninggal|cerai)|orang tua.*sakit|meninggal|cerai|benci pada.*orang tua/.test(s)
      ? 'Masalah keluarga (konflik/kondisi orang tua)' : 'Rindu keluarga/rumah';
  if (/(tugas|ujian|kuliah|kelas|dosen|nilai|skripsi|laporan|praktikum|assignment|deadline|jadwal|quiz|kuis|uts|uas|belajar|ospek|pra\w*|ppt|ipk|beasiswa.*akademik)/.test(s))
    return 'Akademik (tugas/nilai/jadwal/dosen/skripsi)';
  if (/(overthinking|over thinking|banyak pikiran|banyak mikiran|mikir terus|cemas|khawatir|takut|panik|bingung|ragu|worry|masa lalu|overpikir|pikiran)/.test(s))
    return 'Cemas & overthinking';
  if (/(capek|capee|capekk|lelah|penat|burnout|stres|stress|penat|jenuh|greges|lunglai|tekanan|remuk)/.test(s))
    return 'Kelelahan & stres';
  if (/(sedih|murung|nangis|menangis|mood|semangat|galau|down|malas|benci pada diri|menyalahkan diri|kecewa pada diri sendiri|hilang harapan)/.test(s))
    return 'Sedih/hilang semangat/mood turun';
  if (/(teman|sahabat|kawan|sosial|lingkungan|pergaulan|gengsi|diabaikan|dijauhi|komunikasi|miss komunikasi|kost|kos |betah|campus baru|lingkungan baru)/.test(s))
    return 'Hubungan sosial (teman/lingkungan baru)';
  if (/(uang|uwang|biaya|duit|ekonomi|keuangan|dana|mahal|saku|bayar|kos\b|tinggal)/.test(s))
    return 'Keuangan/ekonomi';
  if (/(tidur|insomnia|susah tidur|sakit|pusing|demam|batuk|flue|flu|pegal|nafsu makan|badan|kesehatan)/.test(s))
    return 'Tidur & kesehatan fisik';
  if (/(percaya diri|gagal|tidak mampu|tidak berguna|mengecewakan|insecure|rendah diri|kecewa)/.test(s))
    return 'Percaya diri/takut gagal';
  return 'Lainnya';
}

function parseJsonSafe(txt) {
  try { return JSON.parse(txt); } catch {}
  const m = txt.match(/\[[\s\S]*\]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV, 'utf-8'));
  console.log('baris:', rows.length);
  if (!rows.length || !rows[0].ID) throw new Error('parsing CSV gagal: kolom ID tidak ada');

  // keluhan yang benar-benar berisi
  const items = [];
  for (const r of rows) {
    const k = (r.Keluhan || '').trim();
    const meaningful = k && k !== '-' && k !== '(-)' && k.length > 2;
    items.push({ id: r.ID, text: meaningful ? k : '-', });
  }
  const toClassify = items.filter(x => x.text !== '-');
  console.log('keluhan berisi:', toClassify.length);

  const zai = await ZAI.create();
  const result = {};
  const BATCH = 45;

  // Resume: muat hasil sebelumnya jika ada (rerun hanya memproses Lainnya/kosong)
  if (fs.existsSync(OUT)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf-8'));
      Object.assign(result, prev.temas || {});
      console.log('resume dari hasil sebelumnya:', Object.keys(result).length);
    } catch {}
  }

  // 1) Pra-klasifikasi kata kunci (deterministik & transparan) — hanya yang belum ada
  let nKeyword = 0;
  for (const x of toClassify) {
    if (result[x.id] && result[x.id] !== 'Lainnya') continue;
    const t = keywordTheme(x.text);
    if (t !== 'Lainnya') { result[x.id] = t; nKeyword++; }
  }
  console.log('terklasifikasi kata kunci (tambahan):', nKeyword);
  const sisa = toClassify.filter(x => !result[x.id] || result[x.id] === 'Lainnya');
  console.log('masuk LLM:', sisa.length);

  // 2) LLM untuk sisanya yang ambigu
  for (let b = 0; b < sisa.length; b += BATCH) {
    const batch = sisa.slice(b, b + BATCH);
    const list = batch.map((x, i) => `${i + 1}. ${x.text.slice(0, 220)}`).join('\n');
    const prompt =
      `Klasifikasikan setiap keluhan mahasiswa berikut ke SATU tema paling tepat.\n` +
      `Daftar tema:\n${LISTS}\n\nKeluhan:\n${list}\n\n` +
      `Jawab HANYA JSON array tanpa penjelasan: [{"n":1,"tema":"..."},{"n":2,"tema":"..."}]. ` +
      `Isi "tema" dengan NAMA tema yang PERSIS sama seperti di daftar (jangan nomor, jangan teks lain).`;
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 3000,
          thinking: { type: 'disabled' },
        });
        const raw = completion.choices?.[0]?.message?.content ?? '';
        const arr = parseJsonSafe(raw);
        if (Array.isArray(arr)) {
          for (const it of arr) {
            const idx = Number(it.n) - 1;
            // LLM kadang menjawab nomor tema, kadang nama tema — terima keduanya
            const byNum = TEMAS[Number(it.tema) - 1];
            const tema = String(it.tema || '').trim();
            const resolved = TEMAS.includes(tema) ? tema : (Number.isInteger(Number(it.tema)) ? byNum : null);
            if (idx >= 0 && idx < batch.length && resolved) {
              result[batch[idx].id] = resolved;
              ok = true;
            }
          }
        }
        if (!ok) throw new Error('respon tidak valid: ' + raw.slice(0, 120));
      } catch (e) {
        const is429 = /429/.test(String(e));
        console.error(`batch ${b} attempt ${attempt + 1} gagal:`, String(e).slice(0, 100));
        await new Promise(r => setTimeout(r, is429 ? 12000 : 1500));
      }
    }
    console.log(`selesai ${Math.min(b + BATCH, sisa.length)}/${sisa.length}`);
    await new Promise(r => setTimeout(r, 2500)); // jeda antar batch, hindari 429
  }

  // 3) Sisa yang LLM gagal -> keyword fallback (wajar 'Lainnya' jika benar2 ambigu)
  for (const x of toClassify) {
    if (!result[x.id]) result[x.id] = keywordTheme(x.text);
  }
  for (const x of items) {
    if (!result[x.id]) result[x.id] = keywordTheme(x.text);
  }

  const counts = {};
  for (const v of Object.values(result)) counts[v] = (counts[v] || 0) + 1;
  fs.writeFileSync(OUT, JSON.stringify({ temas: result, counts }, null, 2), 'utf-8');
  console.log('Distribusi tema:', counts);
  console.log('OK ->', OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
