'use client';

import { useCallback, useState } from 'react';
import { MessageCircleHeart, Menu } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Sidebar, type MainView } from '@/components/chat/sidebar';
import { ChatWindow } from '@/components/chat/chat-window';
import { EmptyState } from '@/components/chat/empty-state';
import { Dass21Flow } from '@/components/screening/dass21-flow';
import { RegistrationForm } from '@/components/registration/registration-form';
import { AdminPanel } from '@/components/admin/admin-panel';
import { loadStudentSession } from '@/lib/student-session';

async function createConversationApi(): Promise<{ id: string }> {
  // Sertakan konteks pendaftaran bila ada (percakapan terhubung ke mahasiswa).
  const reg = loadStudentSession();
  const body = reg
    ? JSON.stringify({ registrationId: reg.registrationId, chatToken: reg.chatToken })
    : undefined;
  const res = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body,
  });
  if (!res.ok) throw new Error('Gagal membuat percakapan.');
  return res.json();
}

export default function Home() {
  const [view, setView] = useState<MainView>('konseling');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const qc = useQueryClient();

  // Create a new conversation from the empty-state CTA (mirrors the sidebar button).
  const createMut = useMutation({
    mutationFn: createConversationApi,
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedId(conv.id);
    },
    onError: () => toast.error('Gagal membuat percakapan baru.'),
  });

  const handleSelect = useCallback((id: string) => {
    if (!id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setView('konseling');
    setMobileOpen(false);
  }, []);

  const handleNavigate = useCallback((next: MainView) => {
    setView(next);
    setMobileOpen(false);
  }, []);

  const handleDeleted = useCallback((deletedId: string) => {
    setSelectedId((curr) => (curr === deletedId ? null : curr));
  }, []);

  const viewTitles: Record<MainView, string> = {
    konseling: 'Ruang Obrolan Konseling',
    dass21: 'Skrining DASS-21',
    registrasi: 'Pendaftaran Layanan',
    petugas: 'Panel Petugas',
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top header (sticky) — UPA BK branding */}
      <header
        className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur"
        role="banner"
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          {/* Mobile: open the sidebar drawer */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:hidden"
            aria-label="Buka menu layanan"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <MessageCircleHeart className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              UPA BK UTM • Ruang Layanan Konseling
            </h1>
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
              {viewTitles[view]} · pendaftaran, skrining DASS-21, dan obrolan ber-LLM
            </p>
          </div>
        </div>
      </header>

      {/* Main split: sidebar + content */}
      <main
        className="mx-auto flex w-full max-w-[1400px] flex-1 overflow-hidden"
        role="main"
      >
        {/* Desktop sidebar (>= md) — fixed 320px column */}
        <aside
          className="hidden w-80 shrink-0 border-r bg-card/50 md:flex md:flex-col"
          aria-label="Menu layanan dan daftar percakapan"
        >
          <Sidebar
            selectedId={selectedId}
            onSelect={handleSelect}
            onDeleted={handleDeleted}
            activeView={view}
            onNavigate={handleNavigate}
          />
        </aside>

        {/* Mobile sidebar — drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[300px] max-w-[85vw] p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2 text-base">
                <MessageCircleHeart
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                Menu Layanan
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigasi modul dan daftar percakapan
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Sidebar
                selectedId={selectedId}
                onSelect={handleSelect}
                onDeleted={handleDeleted}
                activeView={view}
                onNavigate={handleNavigate}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Konten modul aktif */}
        <div className="flex min-w-0 flex-1 flex-col">
          {view === 'konseling' ? (
            selectedId ? (
              <ChatWindow
                key={selectedId}
                conversationId={selectedId}
                onDeleted={handleDeleted}
                onOpenSidebar={() => setMobileOpen(true)}
              />
            ) : (
              <EmptyState
                onStart={() => createMut.mutate()}
                loading={createMut.isPending}
              />
            )
          ) : view === 'dass21' ? (
            <Dass21Flow onNavigate={handleNavigate} />
          ) : view === 'registrasi' ? (
            <RegistrationForm onNavigate={handleNavigate} />
          ) : (
            <AdminPanel />
          )}
        </div>
      </main>

      {/* Sticky footer — pinned to bottom via mt-auto */}
      <footer
        className="mt-auto border-t bg-card/90 backdrop-blur"
        role="contentinfo"
      >
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-1 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-center text-[11px] text-muted-foreground sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p>
            Prototipe riset — UPA BK UTM • November 2026 • Bukan pengganti
            konseling profesional.
          </p>
          <p className="flex items-center gap-1">
            Krisis? Hubungi{' '}
            <a
              href="tel:112"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              112
            </a>{' '}
            /{' '}
            <a
              href="tel:119"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              119 ext. 8
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
