// Klasifikasi tema keluhan responden via LLM (z-ai-web-dev-sdk).
// Input : data_out/keluhan.json  [{i: <id>, t: "<teks>"}]
// Output: data_out/tema_keluhan.json  { "<id>": ["Tema", ...] }
import fs from 'fs';
import ZAI from 'z-ai-web-dev-sdk';

const IN = '/home/z/my-project/data_out/keluhan.json';
const OUT = '/home/z/my-project/data_out/tema_keluhan.json';

const TEMA = [
  'Akademik & Studi',
  'Cemas, Stres & Overthinking',
  'Mood & Motivasi Turun',
  'Keluarga',
  'Sosial & Percaya Diri',
  'Hubungan Asmara',
  'Keuangan',
  'Tidur & Kesehatan Fisik',
  'Aktivitas Padat & Waktu',
  'Homesick & Rindu Rumah',
  'Lainnya',
];

const items = JSON.parse(fs.readFileSync(IN, 'utf8'));
const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const done = new Set(Object.keys(existing).map(Number));
const todo = items.filter((x) => !done.has(x.i));
console.log(`total=${items.length} sudah=${done.size} akan diproses=${todo.length}`);

const B = 20;
const zai = await ZAI.create();

function parseJson(text) {
  const s = text.indexOf('['), e = text.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('JSON tidak ditemukan: ' + text.slice(0, 120));
  return JSON.parse(text.slice(s, e + 1));
}

const results = { ...existing };
for (let s = 0; s < todo.length; s += B) {
  const batch = todo.slice(s, s + B);
  const payload = batch.map((x) => ({ i: x.i, t: x.t.slice(0, 400) }));
  const sys = 'Kamu asisten riset konseling mahasiswa. Klasifikasikan keluhan ke tema yang tersedia. Balas HANYA JSON array tanpa penjelasan.';
  const user =
    'Daftar tema (pakai persis teks ini):\n' + TEMA.map((t) => '- ' + t).join('\n') +
    '\n\nAturan: pilih MAKSIMAL 2 tema paling sesuai per keluhan (urut dari yang paling utama). ' +
    'Jika keluhan tidak jelas/tidak spesifik, pakai ["Lainnya"]. ' +
    'Format: [{"i": <id>, "t": ["Tema1", "Tema2"]}] untuk SETIAP item di bawah.\n\n' +
    'Data:\n' + JSON.stringify(payload);
  let ok = false;
  for (let att = 0; att < 3 && !ok; att++) {
    try {
      const r = await zai.chat.completions.create({
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
        temperature: 0.2,
      });
      const arr = parseJson(r.choices[0].message.content || '');
      for (const row of arr) {
        if (!row || typeof row.i !== 'number' || !Array.isArray(row.t)) continue;
        const valid = row.t.filter((t) => TEMA.includes(t)).slice(0, 2);
        results[row.i] = valid.length ? valid : ['Lainnya'];
      }
      ok = true;
    } catch (e) {
      console.log(`batch@${s} attempt${att + 1} gagal: ${String(e).slice(0, 120)}`);
      await new Promise((res) => setTimeout(res, 1500));
    }
  }
  if (!ok) {
    // tandai batch ini "Lainnya" agar tidak menghambat
    for (const x of batch) if (!results[x.i]) results[x.i] = ['Lainnya'];
  }
  console.log(`progres ${Math.min(s + B, todo.length)}/${todo.length}`);
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
}
console.log('SELESAI ->', OUT);
