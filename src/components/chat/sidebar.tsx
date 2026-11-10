'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { ConversationSummary } from '@/lib/types';
import { relativeTime } from '@/lib/time';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeleted?: (deletedId: string) => void;
}

async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await fetch('/api/chat/conversations', { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal memuat percakapan');
  const data = await res.json();
  return (data?.conversations ?? []) as ConversationSummary[];
}

async function createConversation(): Promise<{ id: string; title: string }> {
  const res = await fetch('/api/chat/conversations', { method: 'POST' });
  if (!res.ok) throw new Error('Gagal membuat percakapan');
  return res.json();
}

async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/chat/conversations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus percakapan');
}

// The sidebar is the "Hasil Percakapan" (conversation history) view: a
// scrollable list of past conversations with the 3-layer safety status badge
// (Normal / Krisis / Pendampingan), title, relative time, message count, and
// a trash action with confirmation.
export function Sidebar({ selectedId, onSelect, onDeleted }: SidebarProps) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<ConversationSummary[]>({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const createMut = useMutation({
    mutationFn: createConversation,
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      onSelect(conv.id);
    },
    onError: () => toast.error('Gagal membuat percakapan baru.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_data, deletedId) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      onDeleted?.(deletedId);
      toast.success('Percakapan dihapus.');
    },
    onError: () => toast.error('Gagal menghapus percakapan.'),
  });

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-3 pb-2">
        <Button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          className="w-full gap-2"
        >
          {createMut.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          Percakapan Baru
        </Button>
      </div>

      <div className="px-3 pb-1">
        <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Hasil Percakapan
        </p>
      </div>

      <div
        className="chat-scroll min-h-0 flex-1 overflow-y-auto px-2"
        aria-label="Daftar percakapan"
        role="list"
      >
        {error ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">
            Gagal memuat percakapan. Coba refresh halaman.
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Memuat…
          </div>
        ) : !data || data.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-muted-foreground">
            <MessageSquare
              className="mx-auto mb-2 size-6 opacity-40"
              aria-hidden="true"
            />
            Belum ada percakapan.
            <br />
            Mulai obrolan baru untuk mengisi daftar ini.
          </div>
        ) : (
          <ul className="flex flex-col gap-1 pb-3">
            {data.map((c) => {
              const isActive = c.id === selectedId;
              return (
                <li key={c.id} role="listitem">
                  <div
                    className={cn(
                      'group relative flex items-stretch rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 ring-1 ring-inset ring-primary/25'
                        : 'hover:bg-accent/60'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className="flex flex-1 flex-col gap-1 rounded-l-lg px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      aria-current={isActive ? 'true' : undefined}
                      aria-label={`Buka percakapan: ${c.title}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-sm font-medium',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {c.title || 'Percakapan Baru'}
                        </span>
                        <StatusBadge
                          status={c.status}
                          className="shrink-0"
                        />
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {c.lastMessagePreview || 'Belum ada pesan'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                        <span>{relativeTime(c.updatedAt)}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          aria-label={`${c.messageCount} pesan`}
                        >
                          {c.messageCount} pesan
                        </span>
                      </div>
                    </button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="flex w-9 shrink-0 items-center justify-center rounded-r-lg text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                          aria-label={`Hapus percakapan: ${c.title}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Hapus percakapan ini?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Semua pesan dalam percakapan &quot;{c.title}&quot;
                            akan dihapus permanen dan tidak bisa dikembalikan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => deleteMut.mutate(c.id)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
