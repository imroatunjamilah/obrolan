'use client';

/**
 * Shell aplikasi Modul KP — Sistem Penjadwalan Konseling UPA BK.
 * Diakses lewat /?modul=penjadwalan; terpisah dari Ruang Layanan riset
 * namun memakai pola antarmuka dan tema yang sama.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  ClipboardList,
  FlaskConical,
  MessageCircleHeart,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormPengajuan } from './form-pengajuan';
import { PanelPetugas } from './panel-petugas';
import { EvaluasiMetode } from './evaluasi-metode';

type TabKp = 'pengajuan' | 'petugas' | 'evaluasi';

const TABS: { kunci: TabKp; label: string; ikon: React.ReactNode }[] = [
  { kunci: 'pengajuan', label: 'Pengajuan Konseling', ikon: <Send className="size-4" aria-hidden="true" /> },
  { kunci: 'petugas', label: 'Panel Petugas', ikon: <ClipboardList className="size-4" aria-hidden="true" /> },
  { kunci: 'evaluasi', label: 'Evaluasi Metode', ikon: <FlaskConical className="size-4" aria-hidden="true" /> },
];

const SUBTITLE: Record<TabKp, string> = {
  pengajuan: 'Ajukan sesi — urgensi dinilai otomatis, jadwal diusulkan Greedy',
  petugas: 'Kelola antrean, jalankan penjadwalan, dan pantau papan jadwal',
  evaluasi: 'Metrik TF-IDF + NB/SVM/LogReg dan kinerja penjadwalan',
};

export function PenjadwalanApp() {
  const [tab, setTab] = useState<TabKp>('pengajuan');
  const [muatUlang, setMuatUlang] = useState(0);
  const segarkan = () => setMuatUlang((v) => v + 1);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur" role="banner">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <CalendarClock className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              UPA BK UTM · Sistem Penjadwalan Konseling
            </h1>
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
              {SUBTITLE[tab]} · Modul Kerja Praktek
            </p>
          </div>
          <Link
            href="/"
            className="hidden shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
          >
            <MessageCircleHeart className="size-3.5" aria-hidden="true" />
            Ruang Layanan (riset)
          </Link>
        </div>

        {/* Tab */}
        <nav
          className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 pb-2 sm:px-6"
          aria-label="Tab modul penjadwalan"
        >
          {TABS.map((t) => (
            <button
              key={t.kunci}
              type="button"
              onClick={() => setTab(t.kunci)}
              aria-current={tab === t.kunci ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                tab === t.kunci
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {t.ikon}
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Konten */}
      <main className="mx-auto w-full max-w-[1400px] flex-1" role="main">
        {tab === 'pengajuan' ? (
          <FormPengajuan onSuccess={segarkan} />
        ) : tab === 'petugas' ? (
          <PanelPetugas muatUlang={muatUlang} onMuatUlang={segarkan} />
        ) : (
          <EvaluasiMetode muatUlang={muatUlang} />
        )}
      </main>

      {/* Footer sticky */}
      <footer className="mt-auto border-t bg-card/90 backdrop-blur" role="contentinfo">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-1 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-center text-[11px] text-muted-foreground sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p>
            Modul KP — Sistem Penjadwalan Konseling · data demo fiktif · klasifikasi
            TF-IDF + NB/SVM/LogReg · penjadwalan Greedy prioritas.
          </p>
          <p className="flex items-center gap-1">
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            Krisis? Hubungi{' '}
            <a href="tel:112" className="font-medium text-primary underline-offset-2 hover:underline">
              112
            </a>{' '}
            /{' '}
            <a href="tel:119" className="font-medium text-primary underline-offset-2 hover:underline">
              119 ext. 8
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
