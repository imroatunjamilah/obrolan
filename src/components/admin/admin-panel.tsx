'use client';

// Panel petugas/admin UPA BK (port ringkas dari admin-login.html + admin dashboard).
// Login akun internal -> dashboard: statistik, daftar pendaftaran + hasil
// DASS-21 (hanya di sini), transcript percakapan, dan tindak lanjut.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AdminDashboard } from './admin-dashboard';

export interface AdminMe {
  authenticated: boolean;
  username?: string;
  role?: string;
}

async function fetchMe(): Promise<AdminMe> {
  const res = await fetch('/api/admin/me', { cache: 'no-store' });
  if (res.status === 401) return { authenticated: false };
  if (!res.ok) throw new Error('Gagal memuat sesi.');
  return res.json();
}

export function AdminPanel() {
  const { data: me, isLoading, refetch } = useQuery<AdminMe>({
    queryKey: ['admin-me'],
    queryFn: fetchMe,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
        Memuat…
      </div>
    );
  }

  if (!me?.authenticated) {
    return <LoginForm onSuccess={() => refetch()} />;
  }

  return (
    <AdminDashboard
      username={me.username || ''}
      role={me.role || ''}
      onLogout={() => refetch()}
    />
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Login gagal.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">Panel Petugas UPA BK</CardTitle>
          <CardDescription>
            Khusus admin/petugas UPA BK. Mahasiswa tidak memiliki akun.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adm-username">Username</Label>
            <Input
              id="adm-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adm-password">Password</Label>
            <Input
              id="adm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={handleSubmit} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Masuk
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
