// Konteks mahasiswa di browser (port dari sessionStorage "upa_reg" proyek asli).
// Berisi registrationId + chatToken yang menjadi "kunci akses" mahasiswa atas
// data skrining/obrolannya sendiri — token diverifikasi ulang di server.

export interface StudentSession {
  registrationId: string;
  chatToken: string;
  nama: string;
}

const KEY = 'upa_reg';

export function parseStudentSession(raw: string | null): StudentSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StudentSession>;
    if (
      typeof parsed.registrationId === 'string' &&
      typeof parsed.chatToken === 'string' &&
      parsed.registrationId &&
      parsed.chatToken
    ) {
      return {
        registrationId: parsed.registrationId,
        chatToken: parsed.chatToken,
        nama: typeof parsed.nama === 'string' ? parsed.nama : '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function loadStudentSession(): StudentSession | null {
  if (typeof window === 'undefined') return null;
  return parseStudentSession(window.sessionStorage.getItem(KEY));
}

export function saveStudentSession(session: StudentSession): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearStudentSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(KEY);
}
