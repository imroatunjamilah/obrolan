// Port of the original UPA BK safety layer (Python: app/services/crisis.py).
//
// IMPORTANT (needs UPA BK approval before production):
// - The keywords & automatic actions below are the PROTOTYPE defaults.
// - This layer is deliberately NOT dependent on the LLM: safety must never
//   rely solely on a language model.
// - The official escalation protocol (campus contacts, officer flow, message
//   templates) must be reviewed and filled in by UPA BK before production.

// --- Escalation markers (audit trail, visible to researchers/officers) ------
export const MARKER_ESKALASI = '[ESKALASI]';
export const MARKER_OTOMATIS = '[OTOMATIS]';

export const CRISIS_ESCALATION_NOTE =
  'Potensi krisis terdeteksi pada pesan mahasiswa - mohon verifikasi dan tindak lanjut segera oleh petugas.';

export const HANDOFF_ESCALATION_NOTE =
  'Mahasiswa meminta pendampingan manusia/konselor.';

// --- Crisis keywords (everyday Bahasa Indonesia + common variants) ----------
export const CRISIS_KEYWORDS = [
  'bunuh diri', 'membunuh diri', 'mengakhiri hidup', 'akhiri hidup',
  'ingin mati', 'pengen mati', 'mau mati', 'ga ingin hidup', 'gak ingin hidup',
  'tidak ingin hidup', 'nggak ingin hidup', 'gak mau hidup', 'nggak mau hidup',
  'tak ingin hidup', 'selesai saja hidup', 'hilang saja hidup', 'mati saja',
  'melukai diri', 'menyakiti diri', 'menyakitin diri', 'mengocek diri',
  'self harm', 'self-harm', 'suicide', 'suicidal', 'menyobek pergelangan',
  'menelan pil', 'minum pil',
] as const;

// --- Human handoff request keywords -----------------------------------------
export const HANDOFF_KEYWORDS = [
  'bicara dengan manusia', 'ngobrol dengan manusia', 'bicara sama manusia',
  'konselor', 'konselor asli', 'petugas', 'tenaga profesional', 'psikolog',
  'pendampingan manusia', 'ditemani manusia', 'bicara langsung',
  'chat dengan konselor', 'layanan manusia', 'human', 'manusia asli',
] as const;

// --- Fixed safety responses ---------------------------------------------------
// 112    : national emergency hotline (public, 24h).
// 119 x8 : Sejiwa service, Indonesian Ministry of Health (public).
export const SAFETY_MESSAGE = `Terima kasih sudah berani menyampaikan hal yang berat ini. Keselamatan Anda adalah prioritas kami, jadi saya ingin memastikan Anda mendapatkan bantuan segera dari manusia sungguhan:

1) Jika Anda dalam bahaya sekarang juga, hubungi 112 (darurat nasional, 24 jam) atau 119 ext. 8 (layanan Sejiwa, Kementerian Kesehatan).
2) Hubungi atau datang langsung ke UPA BK UTM.
3) Ceritakan kepada orang yang Anda percaya dan mintalah didampingi.

Permintaan Anda telah ditandai oleh sistem agar petugas UPA BK meninjaunya. Namun mohon diingat: pesan otomatis ini tidak menjamin respons manusia yang langsung, jadi untuk kondisi mendesak gunakan nomor darurat di atas. Anda tidak sendirian, dan bantuan profesional tersedia.`;

export const HANDOFF_ACKNOWLEDGMENT = `Terima kasih sudah menyampaikan permintaan itu. Permintaan pendampingan dari petugas/konselor UPA BK telah saya catat untuk ditinjau oleh unit layanan. Mohon maaf, saya tidak dapat menjamin respons manusia yang langsung lewat obrolan ini - jika keadaan Anda mendesak, silakan hubungi 112 atau 119 ext. 8, atau datang langsung ke UPA BK UTM.`;

export const DISCLAIMER_CHAT = `Asisten obrolan ini membantu mendengarkan dan memberi dukungan awal, namun BUKAN pengganti konseling profesional. Untuk pendampingan menyeluruh, silakan ajukan layanan konseling UPA BK.`;

// Keyword detection is case-insensitive and tolerant of extra whitespace.
// The padded-space trick makes phrase matching stable at string edges.
function normalize(text: string): string {
  return ' ' + text.toLowerCase().replace(/\s+/g, ' ').trim() + ' ';
}

export function detectCrisis(text: string): boolean {
  if (!text) return false;
  const lowered = normalize(text);
  return CRISIS_KEYWORDS.some((kw) => lowered.includes(kw));
}

export function detectHandoff(text: string): boolean {
  if (!text) return false;
  const lowered = normalize(text);
  return HANDOFF_KEYWORDS.some((kw) => lowered.includes(kw));
}
