'use client';

// Alur Skrining DASS-21 untuk mahasiswa (port dari frontend/dass21.html + js/dass21.js).
// KEBIJAKAN: setelah submit, mahasiswa HANYA melihat konfirmasi generik.
// Skor/kategori tidak pernah ditampilkan di sini — hanya di panel petugas.

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ClipboardList, Loader2, Lock, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  parseStudentSession,
  type StudentSession,
} from '@/lib/student-session';

interface QuestionItem {
  no: number;
  teks: string;
}
interface OptionItem {
  nilai: number;
  label: string;
}

async function fetchQuestions(): Promise<{
  pengantar: string;
  pertanyaan: QuestionItem[];
  opsi: OptionItem[];
}> {
  const res = await fetch('/api/screening/dass21/questions', { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal memuat pertanyaan.');
  return res.json();
}

async function submitAnswers(payload: {
  registrationId: string;
  chatToken: string;
  jawaban: Record<string, number>;
}): Promise<{ status: string; pesan: string }> {
  const res = await fetch('/api/screening/dass21/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Gagal menyimpan jawaban.');
  }
  return data;
}

interface Dass21FlowProps {
  onNavigate: (view: 'konseling' | 'registrasi') => void;
}

// Baca konteks mahasiswa dari sessionStorage lewat useSyncExternalStore
// (aman SSR, tanpa setState di dalam useEffect).
function subscribeStorage(cb: () => void): () => void {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}
function getRegSnapshot(): string {
  return window.sessionStorage.getItem('upa_reg') ?? '';
}

export function Dass21Flow({ onNavigate }: Dass21FlowProps) {
  const regRaw = useSyncExternalStore(subscribeStorage, getRegSnapshot, () => '');
  const reg = useMemo<StudentSession | null>(() => parseStudentSession(regRaw), [regRaw]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: ['dass21-questions'],
    queryFn: fetchQuestions,
  });

  const submitMut = useMutation({
    mutationFn: submitAnswers,
    onSuccess: () => {
      setDone(true);
      toast.success('Jawaban skrining tersimpan.');
    },
    onError: (err: Error) => {
      if (err.message.includes('sudah pernah diisi')) {
        setDone(true);
      }
      toast.error(err.message);
    },
  });

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const handleSubmit = () => {
    if (!reg) return;
    if (quiz && answeredCount < quiz.pertanyaan.length) {
      const missing = quiz.pertanyaan
        .filter((q) => answers[q.no] === undefined)
        .map((q) => q.no);
      toast.error(`Masih ada pertanyaan yang belum dijawab: nomor ${missing.join(', ')}.`);
      return;
    }
    submitMut.mutate({
      registrationId: reg.registrationId,
      chatToken: reg.chatToken,
      jawaban: Object.fromEntries(
        Object.entries(answers).map(([no, val]) => [no, val])
      ),
    });
  };

  // Belum mendaftar -> arahkan ke Pendaftaran (alur asli: DASS-21 butuh reg + token).
  if (!reg) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg">Skrining DASS-21</CardTitle>
            <CardDescription>
              Untuk menjaga kerahasiaan, skrining hanya tersedia setelah Anda
              mengisi pendaftaran layanan konseling terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => onNavigate('registrasi')}>
              Isi Pendaftaran Terlebih Dahulu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Selesai -> konfirmasi generik (tanpa skor).
  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PartyPopper className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg">Skrining Terkirim</CardTitle>
            <CardDescription>
              Terima kasih! Jawaban skrining Anda telah tersimpan dan akan
              ditinjau oleh petugas UPA BK. Sesuai kebijakan layanan, hasil
              tidak ditampilkan kepada mahasiswa.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => onNavigate('konseling')}>
              Mulai Konseling
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Skrining DASS-21</h2>
            <p className="text-sm text-muted-foreground">
              Mahasiswa: {reg?.nama || '(tanpa nama)'} · jawaban bersifat rahasia
            </p>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="flex items-start gap-3 p-4">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {quiz?.pengantar ||
                'Pernyataan berikut berkaitan dengan cara Anda merasa dan berperilaku selama 7 hari terakhir.'}
            </p>
          </CardContent>
        </Card>

        {quizError ? (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">
              Gagal memuat pertanyaan. Coba muat ulang halaman.
            </CardContent>
          </Card>
        ) : quizLoading || !quiz ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Memuat pertanyaan…
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-28">
            <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Terjawab {answeredCount} dari {quiz.pertanyaan.length}
                </span>
                <span>{Math.round((answeredCount / quiz.pertanyaan.length) * 100)}%</span>
              </div>
              <Progress
                className="mt-1 h-2"
                value={(answeredCount / quiz.pertanyaan.length) * 100}
              />
            </div>

            {quiz.pertanyaan.map((q) => (
              <Card key={q.no}>
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-medium leading-relaxed">
                    <span className="mr-2 inline-flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      {q.no}
                    </span>
                    {q.teks}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <RadioGroup
                    value={answers[q.no] !== undefined ? String(answers[q.no]) : ''}
                    onValueChange={(val) =>
                      setAnswers((prev) => ({ ...prev, [q.no]: Number(val) }))
                    }
                    className="gap-2"
                    aria-label={`Jawaban pertanyaan ${q.no}`}
                  >
                    {quiz.opsi.map((opt) => (
                      <Label
                        key={opt.nilai}
                        htmlFor={`q${q.no}-${opt.nilai}`}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-normal transition-colors hover:bg-accent/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
                      >
                        <RadioGroupItem
                          id={`q${q.no}-${opt.nilai}`}
                          value={String(opt.nilai)}
                        />
                        {opt.label}
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            <Separator />

            {/* Bar aksi tetap di bawah */}
            <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur md:pl-80">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <p className="text-xs text-muted-foreground">
                  {answeredCount}/{quiz.pertanyaan.length} terjawab
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={submitMut.isPending || answeredCount < quiz.pertanyaan.length}
                  className="gap-2"
                >
                  {submitMut.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ClipboardList className="size-4" aria-hidden="true" />
                  )}
                  Kirim Jawaban
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
