'use client';

/**
 * Komponen bersama Modul KP Penjadwalan Konseling.
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LABEL_SESI } from '@/lib/penjadwalan/penjadwalan';
import type { KelasPrioritas } from '@/lib/penjadwalan/dataset';

export type Kelas = KelasPrioritas;

export const GAYA_PRIORITAS: Record<Kelas, string> = {
  DARURAT: 'bg-red-100 text-red-800 border border-red-200',
  SEDANG: 'bg-amber-100 text-amber-800 border border-amber-200',
  NORMAL: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
};

export const TEKS_STATUS: Record<string, string> = {
  menunggu: 'Menunggu',
  terjadwal: 'Terjadwal',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

export const GAYA_STATUS: Record<string, string> = {
  menunggu: 'bg-muted text-muted-foreground border border-border',
  terjadwal: 'bg-purple-100 text-purple-800 border border-purple-200',
  selesai: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  ditolak: 'bg-red-100 text-red-800 border border-red-200',
};

export function BadgePrioritas({ kelas, className }: { kelas: Kelas; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-semibold', GAYA_PRIORITAS[kelas], className)}>
      {kelas}
    </Badge>
  );
}

export function BadgeStatus({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', GAYA_STATUS[status] ?? '', className)}>
      {TEKS_STATUS[status] ?? status}
    </Badge>
  );
}

export function LabelSesi({ kode }: { kode: string }) {
  return <span className="whitespace-nowrap">{LABEL_SESI[kode] ?? kode}</span>;
}

/** Bar persentase sederhana dengan warna tetap. */
export function BarSkor({
  label,
  nilai,
  kelasKelas,
}: {
  label: string;
  nilai: number;
  kelasKelas: Kelas;
}) {
  const warna =
    kelasKelas === 'DARURAT' ? 'bg-red-500' : kelasKelas === 'SEDANG' ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', warna)} style={{ width: `${Math.round(nilai * 100)}%` }} />
      </div>
      <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums">
        {(nilai * 100).toFixed(1)}%
      </span>
    </div>
  );
}

export function persen(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function tanggalIndo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, t] = iso.split('-').map(Number);
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  if (!y || !m || !t) return iso;
  return `${t} ${namaBulan[m - 1]} ${y}`;
}
