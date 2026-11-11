'use client';

// Form pendaftaran layanan konseling untuk mahasiswa (port dari
// frontend/registrasi.html + js/registrasi.js). Tanpa akun — data tersimpan
// dan chat token (kunci akses) otomatis dipegang di sessionStorage.

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Loader2, MessagesSquare, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { saveStudentSession } from '@/lib/student-session';

interface Options {
  jenisLayanan: string[];
  hari: string[];
  waktu: string[];
}

async function fetchOptions(): Promise<Options> {
  const res = await fetch('/api/registrations/options', { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal memuat opsi form.');
  return res.json();
}

interface CreateResult {
  registrationId: string;
  chatToken: string;
  nama: string;
  pesan: string;
}

async function createRegistration(payload: Record<string, unknown>): Promise<CreateResult> {
  const res = await fetch('/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Periksa kembali isian formulir.');
  }
  return data;
}

interface RegistrationFormProps {
  onNavigate: (view: 'konseling' | 'dass21') => void;
}

export function RegistrationForm({ onNavigate }: RegistrationFormProps) {
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [kontak, setKontak] = useState('');
  const [jenisLayanan, setJenisLayanan] = useState('');
  const [preferensiHari, setPreferensiHari] = useState('');
  const [preferensiWaktu, setPreferensiWaktu] = useState('');
  const [keluhan, setKeluhan] = useState('');
  const [setuju, setSetuju] = useState(false);
  const [success, setSuccess] = useState<CreateResult | null>(null);

  const { data: options, error: optionsError } = useQuery({
    queryKey: ['registration-options'],
    queryFn: fetchOptions,
  });

  useEffect(() => {
    if (optionsError) toast.error('Gagal memuat opsi form. Muat ulang halaman.');
  }, [optionsError]);

  const createMut = useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      // Simpan konteks mahasiswa untuk halaman skrining & obrolan (sesuai asli).
      saveStudentSession({
        registrationId: data.registrationId,
        chatToken: data.chatToken,
        nama: data.nama,
      });
      setSuccess(data);
      toast.success('Pendaftaran berhasil.');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!nama.trim() || !nim.trim() || !kontak.trim()) {
      toast.error('Nama, NIM, dan kontak wajib diisi.');
      return;
    }
    if (!jenisLayanan || !preferensiHari || !preferensiWaktu) {
      toast.error('Pilih jenis layanan, hari, dan waktu.');
      return;
    }
    if (!setuju) {
      toast.error('Persetujuan penggunaan data wajib diberikan.');
      return;
    }
    createMut.mutate({
      nama: nama.trim(),
      nim: nim.trim(),
      kontak: kontak.trim(),
      jenisLayanan,
      preferensiHari,
      preferensiWaktu,
      keluhan: keluhan.trim() || null,
      setujuPenggunaanData: true,
    });
  };

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg">Pendaftaran Berhasil</CardTitle>
            <CardDescription>
              {success.pesan} Sebagai {success.nama}, kamu bisa melanjutkan ke
              skrining DASS-21 atau langsung memulai konseling.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full gap-2" onClick={() => onNavigate('dass21')}>
              <ClipboardList className="size-4" aria-hidden="true" />
              Isi Skrining DASS-21
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => onNavigate('konseling')}
            >
              <MessagesSquare className="size-4" aria-hidden="true" />
              Mulai Konseling
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlus className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pendaftaran Layanan Konseling</h2>
            <p className="text-sm text-muted-foreground">
              Mahasiswa UTM • tanpa akun • data hanya diakses petugas UPA BK
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
            <CardTitle className="text-base">Data Diri</CardTitle>
            <CardDescription className="text-sm">
              Preferensi hari/waktu hanya preferensi awal, bukan jadwal terkonfirmasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-nama">Nama Lengkap *</Label>
                <Input
                  id="reg-nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="cth. Rina Amelia"
                  maxLength={120}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-nim">NIM *</Label>
                <Input
                  id="reg-nim"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="cth. 2101101XXX"
                  maxLength={30}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-kontak">Kontak (email / WhatsApp) *</Label>
              <Input
                id="reg-kontak"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="cth. 0812xxxxxxx atau email"
                maxLength={120}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label>Jenis Layanan *</Label>
                <Select value={jenisLayanan} onValueChange={setJenisLayanan}>
                  <SelectTrigger aria-label="Jenis layanan">
                    <SelectValue placeholder="Pilih…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.jenisLayanan ?? []).map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Preferensi Hari *</Label>
                <Select value={preferensiHari} onValueChange={setPreferensiHari}>
                  <SelectTrigger aria-label="Preferensi hari">
                    <SelectValue placeholder="Pilih…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.hari ?? []).map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Preferensi Waktu *</Label>
                <Select value={preferensiWaktu} onValueChange={setPreferensiWaktu}>
                  <SelectTrigger aria-label="Preferensi waktu">
                    <SelectValue placeholder="Pilih…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.waktu ?? []).map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-keluhan">Keluhan / tujuan konseling (opsional)</Label>
              <Textarea
                id="reg-keluhan"
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                placeholder="Tuliskan singkat apa yang ingin kamu bicarakan (opsional)…"
                rows={4}
                maxLength={4000}
              />
            </div>

            <Label
              htmlFor="reg-setuju"
              className="flex items-start gap-3 rounded-lg border bg-muted/40 px-3 py-3 text-sm font-normal leading-relaxed"
            >
              <Checkbox
                id="reg-setuju"
                checked={setuju}
                onCheckedChange={(v) => setSetuju(v === true)}
                className="mt-0.5"
              />
              <span>
                Saya setuju data ini digunakan untuk pengelolaan layanan konseling
                UPA BK dan dapat diakses oleh petugas UPA BK. *
              </span>
            </Label>

            <Button
              onClick={handleSubmit}
              disabled={createMut.isPending}
              className="gap-2 sm:w-auto"
            >
              {createMut.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="size-4" aria-hidden="true" />
              )}
              Daftar Layanan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
