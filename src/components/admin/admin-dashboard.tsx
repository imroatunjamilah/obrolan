'use client';

// Dashboard petugas: statistik ringkas, tabel pendaftaran, detail pendaftaran
// (hasil DASS-21 + jawaban + transcript percakapan + tindak lanjut).

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Loader2,
  LogOut,
  MessagesSquare,
  RefreshCw,
  ShieldAlert,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/chat/status-badge';
import type {
  AdminStats,
  RegistrationDetail,
  RegistrationSummary,
} from '@/lib/types';
import { FOLLOWUP_LABELS, FOLLOWUP_STATUSES } from '@/lib/layanan';
import { SEVERITY_DISCLAIMER } from '@/lib/dass21';

interface AdminDashboardProps {
  username: string;
  role: string;
  onLogout: () => void;
}

async function fetchStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal memuat statistik.');
  return res.json();
}

async function fetchRegistrations(): Promise<RegistrationSummary[]> {
  const res = await fetch('/api/admin/registrations', { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal memuat data pendaftaran.');
  const data = await res.json();
  return (data?.registrations ?? []) as RegistrationSummary[];
}

async function fetchDetail(id: string): Promise<RegistrationDetail> {
  const res = await fetch(`/api/admin/registrations/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal memuat detail.');
  return res.json();
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function categoryBadgeClass(kat: string): string {
  if (kat === 'Normal') return 'bg-secondary/60 text-secondary-foreground';
  if (kat === 'Ringan') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  if (kat === 'Sedang') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
  return 'bg-destructive text-white';
}

function followupBadgeClass(status: string): string {
  if (status === 'perlu_ditinjau_segera') return 'bg-destructive text-white';
  if (status === 'sedang_diproses') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  if (status === 'dijadwalkan') return 'bg-primary text-primary-foreground';
  if (status === 'selesai') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  return 'bg-secondary text-secondary-foreground';
}

export function AdminDashboard({ username, role, onLogout }: AdminDashboardProps) {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats });
  const regs = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: fetchRegistrations,
    refetchOnWindowFocus: true,
  });

  const detail = useQuery({
    queryKey: ['admin-registration-detail', selectedId],
    queryFn: () => fetchDetail(selectedId as string),
    enabled: dialogOpen && !!selectedId,
  });

  const logoutMut = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Gagal keluar.');
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['admin-me'] });
      onLogout();
    },
    onError: () => toast.error('Gagal keluar.'),
  });

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const statCards = useMemo(
    () => [
      {
        label: 'Pendaftaran',
        value: stats.data?.totalRegistrations ?? 0,
        icon: UserPlus,
      },
      {
        label: 'Skrining DASS-21',
        value: stats.data?.totalScreened ?? 0,
        icon: ClipboardList,
      },
      {
        label: 'Percakapan',
        value: stats.data?.totalConversations ?? 0,
        icon: MessagesSquare,
      },
      {
        label: 'Krisis / Eskalasi',
        value: stats.data?.crisisConversations ?? 0,
        icon: ShieldAlert,
      },
    ],
    [stats.data]
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header panel */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Panel Petugas UPA BK</h2>
              <p className="text-sm text-muted-foreground">
                Masuk sebagai <span className="font-medium">{username}</span> ({role}) ·
                data mahasiswa bersifat rahasia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                stats.refetch();
                regs.refetch();
              }}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Muat ulang</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => logoutMut.mutate()}
              disabled={logoutMut.isPending}
            >
              {logoutMut.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>

        {/* Kartu statistik */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold tabular-nums">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status tindak lanjut ringkas */}
        {stats.data && Object.keys(stats.data.tindakLanjut).length > 0 ? (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Tindak lanjut:</span>
            {Object.entries(stats.data.tindakLanjut).map(([status, count]) => (
              <Badge key={status} className={followupBadgeClass(status)}>
                {FOLLOWUP_LABELS[status] || status}: {count}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* Tabel pendaftaran */}
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
            <CardTitle className="text-base">Daftar Pendaftaran Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2 sm:pb-4">
            {regs.error ? (
              <p className="px-6 py-8 text-sm text-destructive">
                Gagal memuat data. Coba muat ulang.
              </p>
            ) : regs.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Memuat…
              </div>
            ) : !regs.data || regs.data.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Belum ada pendaftaran mahasiswa.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead className="hidden sm:table-cell">NIM</TableHead>
                      <TableHead className="hidden md:table-cell">Layanan</TableHead>
                      <TableHead className="hidden lg:table-cell">Preferensi</TableHead>
                      <TableHead>DASS-21</TableHead>
                      <TableHead className="hidden sm:table-cell">Tindak lanjut</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regs.data.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.nama}
                          <div className="text-[11px] font-normal text-muted-foreground sm:hidden">
                            {r.nim}
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {r.nim}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {r.jenisLayanan}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {r.preferensiHari}, {r.preferensiWaktu}
                        </TableCell>
                        <TableCell>
                          {r.dass21 ? (
                            <Badge className="bg-primary text-primary-foreground">
                              Sudah diisi
                            </Badge>
                          ) : (
                            <Badge variant="outline">Belum</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            className={followupBadgeClass(
                              r.followup?.status || 'menunggu_ditinjau'
                            )}
                          >
                            {FOLLOWUP_LABELS[r.followup?.status || 'menunggu_ditinjau']}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openDetail(r.id)}>
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog detail — key memastikan editor tindak lanjut di-re-init
          setiap data followup berubah (tanpa setState di dalam useEffect). */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-3xl">
          {detail.isLoading || !detail.data ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <DialogTitle className="sr-only">Detail Pendaftaran</DialogTitle>
              <DialogDescription className="sr-only">
                Memuat detail pendaftaran mahasiswa
              </DialogDescription>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Memuat detail…
            </div>
          ) : (
            <DetailBody
              key={`${detail.data.followup?.updatedAt ?? 'none'}`}
              detail={detail.data}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailBody({ detail }: { detail: RegistrationDetail }) {
  const qc = useQueryClient();
  const { registration: r, dass21, followup, conversations } = detail;

  // Editor tindak lanjut — state awal langsung dari props (komponen di-remount
  // lewat key saat followup berubah, sehingga selalu sinkron).
  const [status, setStatus] = useState(followup?.status || 'menunggu_ditinjau');
  const [catatan, setCatatan] = useState(followup?.catatanPetugas || '');
  const [petugas, setPetugas] = useState(followup?.petugasNama || '');

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/registrations/${r.id}/followup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatanPetugas: catatan, petugasNama: petugas }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Gagal menyimpan.');
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-registration-detail', r.id] });
      toast.success('Tindak lanjut tersimpan.');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
      <DialogHeader>
        <DialogTitle className="text-left">
          {r.nama} <span className="text-muted-foreground">· {r.nim}</span>
        </DialogTitle>
        <DialogDescription className="text-left">
          {r.jenisLayanan} · {r.preferensiHari}, {r.preferensiWaktu} · terdaftar{' '}
          {fmtDateTime(r.createdAt)} · kontak: {r.kontak} ·{' '}
          {conversations.length} percakapan
        </DialogDescription>
      </DialogHeader>

      {r.keluhan ? (
        <Card>
          <CardContent className="p-4 text-sm leading-relaxed">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Keluhan yang dituliskan mahasiswa
            </p>
            {r.keluhan}
          </CardContent>
        </Card>
      ) : null}

      {/* Hasil DASS-21 — hanya untuk petugas */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <ClipboardList className="size-4 text-primary" aria-hidden="true" />
          Hasil Skrining DASS-21
        </h3>
        {!dass21 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Mahasiswa belum mengisi skrining DASS-21.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ['Depresi', dass21.skorDepresi, dass21.katDepresi],
                  ['Kecemasan', dass21.skorKecemasan, dass21.katKecemasan],
                  ['Stres', dass21.skorStres, dass21.katStres],
                ] as Array<[string, number, string]>
              ).map(([label, skor, kat]) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold tabular-nums">{skor}</p>
                    <Badge className={`mt-1 ${categoryBadgeClass(kat)}`}>{kat}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {SEVERITY_DISCLAIMER}
            </p>
            <details className="rounded-lg border px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium">
                Rincian 21 jawaban (0-3)
              </summary>
              <div className="mt-3 grid grid-cols-7 gap-1.5 sm:grid-cols-10">
                {dass21.jawaban.map((v, i) => (
                  <span
                    key={i}
                    className="flex h-8 flex-col items-center justify-center rounded-md bg-muted text-[10px] leading-none"
                  >
                    <span className="text-muted-foreground">{i + 1}</span>
                    <span className="font-semibold">{v}</span>
                  </span>
                ))}
              </div>
            </details>
          </div>
        )}
      </section>

      <Separator />

      {/* Transcript percakapan (termasuk penanda audit "sistem") */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <MessagesSquare className="size-4 text-primary" aria-hidden="true" />
          Percakapan ({conversations.length})
        </h3>
        {conversations.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada percakapan.
          </p>
        ) : (
          <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-lg border p-3">
            {conversations.map((c) => (
              <div key={c.id} className="rounded-md bg-muted/40 p-2">
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="font-medium">{c.title}</span>
                  <StatusBadge status={c.status} />
                  <span className="text-muted-foreground">{fmtDateTime(c.updatedAt)}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {c.messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.sender === 'sistem'
                          ? 'rounded-md border border-amber-300/60 bg-amber-50 px-2.5 py-1.5 text-xs italic text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'rounded-md bg-background px-2.5 py-1.5 text-sm'
                      }
                    >
                      <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {m.sender === 'mahasiswa'
                          ? 'Mahasiswa'
                          : m.sender === 'bot'
                            ? 'Asisten'
                            : 'Audit'}
                      </span>
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Editor tindak lanjut */}
      <section>
        <h3 className="mb-2 text-sm font-semibold">Tindak Lanjut</h3>
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Status tindak lanjut">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWUP_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {FOLLOWUP_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fu-petugas">Petugas penangani</Label>
              <Input
                id="fu-petugas"
                value={petugas}
                onChange={(e) => setPetugas(e.target.value)}
                placeholder="cth. Ratna Wulandari"
                maxLength={120}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fu-catatan">Catatan petugas</Label>
            <Textarea
              id="fu-catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan internal untuk kasus ini…"
              rows={3}
              maxLength={4000}
            />
          </div>
          <Button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="gap-2 sm:w-auto"
          >
            {saveMut.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Simpan Tindak Lanjut
          </Button>
        </div>
      </section>
    </div>
  );
}
