'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Menu,
  Send,
  Trash2,
  Loader2,
  Check,
  X,
  PencilLine,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { MessageBubble } from './message-bubble';
import { CrisisBanner } from './crisis-banner';
import { StatusBadge } from './status-badge';
import { DisclaimerBanner } from './disclaimer-footer';
import { TypingIndicator } from './typing-indicator';
import {
  MARKER_ESKALASI,
  MARKER_OTOMATIS,
  CRISIS_ESCALATION_NOTE,
  HANDOFF_ESCALATION_NOTE,
} from '@/lib/crisis';
import type {
  ChatMessage,
  ConversationDetail,
  ConversationStatus,
  SendMessageResponse,
} from '@/lib/types';

interface ChatWindowProps {
  conversationId: string;
  onDeleted: (id: string) => void;
  onOpenSidebar?: () => void;
}

const DEFAULT_TITLE = 'Percakapan Baru';
const MAX_TEXT = 2000;

async function fetchConversation(id: string): Promise<ConversationDetail | null> {
  const res = await fetch(`/api/chat/conversations/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function sendMessage(payload: {
  conversationId: string;
  text: string;
}): Promise<SendMessageResponse> {
  const res = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? 'Pesan gagal diproses.');
  }
  return res.json();
}

async function patchTitle(
  id: string,
  title: string
): Promise<{ id: string; title: string }> {
  const res = await fetch(`/api/chat/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui judul.');
  return res.json();
}

async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/chat/conversations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus percakapan.');
}

// Derive the auto-title from the first student message (mirrors the server).
function deriveTitle(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return DEFAULT_TITLE;
  return clean.slice(0, 40) + (clean.length > 40 ? '…' : '');
}

// The audit strip texts the server persists for the safety layers — mirrored
// client-side so the optimistic transcript matches what a refresh will show.
function sistemStripText(status: ConversationStatus): string | null {
  if (status === 'crisis') return `${MARKER_ESKALASI} ${CRISIS_ESCALATION_NOTE}`;
  if (status === 'handoff') return `${MARKER_OTOMATIS} ${HANDOFF_ESCALATION_NOTE}`;
  return null;
}

export function ChatWindow({
  conversationId,
  onDeleted,
  onOpenSidebar,
}: ChatWindowProps) {
  const qc = useQueryClient();

  // `messages` / `title` / `status` are `null` until the user takes a local
  // action (send / rename / delete). While null we render directly from the
  // query snapshot — this avoids any setState-in-effect and any empty-state
  // flash. The moment a local mutation happens, we snapshot the current server
  // state into local state and own it from then on.
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [status, setStatus] = useState<ConversationStatus | null>(null);
  const [input, setInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch the conversation once per mount (key={selectedId} on the parent
  // forces a remount when switching). We do NOT refetch on focus / after send:
  // messages are held in local state to keep the optimistic UX smooth.
  const convQuery = useQuery<ConversationDetail | null>({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  const snapshot = convQuery.data ?? null;
  const renderMessages: ChatMessage[] = messages ?? snapshot?.messages ?? [];
  const renderTitle: string = title ?? snapshot?.conversation.title ?? DEFAULT_TITLE;
  const renderStatus: ConversationStatus =
    status ?? snapshot?.conversation.status ?? 'normal';

  const loading = convQuery.isLoading && !snapshot;
  const errored = !!convQuery.error && !snapshot;

  const sendMut = useMutation({
    mutationFn: sendMessage,
    onMutate: ({ text }) => {
      const base = messages ?? snapshot?.messages ?? [];
      const optimistic: ChatMessage = {
        id: `opt-${Date.now()}`,
        sender: 'mahasiswa',
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages([...base, optimistic]);
    },
    onError: () => {
      toast.error('Pesan gagal terkirim. Coba lagi.');
      setMessages((prev) =>
        prev ? prev.filter((m) => !m.id.startsWith('opt-')) : prev
      );
    },
    onSuccess: (resp, vars) => {
      const now = new Date().toISOString();
      setMessages((prev) => {
        const base = prev ?? snapshot?.messages ?? [];
        const withoutOpt = base.filter((m) => !m.id.startsWith('opt-'));
        const studentMsg: ChatMessage = {
          id: `s-${Date.now()}`,
          sender: 'mahasiswa',
          text: vars.text,
          createdAt: now,
        };
        const botMsg: ChatMessage = {
          id: `bot-${Date.now() + 1}`,
          sender: 'bot',
          text: resp.reply,
          createdAt: now,
        };
        const next = [...withoutOpt, studentMsg, botMsg];
        // Mirror the server-side audit marker so the strip appears instantly
        // (a refresh would load the exact same text from SQLite).
        const strip = sistemStripText(resp.status);
        if (strip) {
          next.push({
            id: `sys-${Date.now() + 2}`,
            sender: 'sistem',
            text: strip,
            createdAt: now,
          });
        }
        return next;
      });
      // Live-update the safety status badge (Normal / Krisis / Pendampingan).
      setStatus(resp.status);
      // Optimistic auto-title on the first student message.
      setTitle((curr) => {
        const current = curr ?? snapshot?.conversation.title ?? DEFAULT_TITLE;
        return current === DEFAULT_TITLE ? deriveTitle(vars.text) : current;
      });
      // Refresh the sidebar list (status / preview / message count / ordering).
      qc.invalidateQueries({ queryKey: ['conversations'] });
      if (resp.llmError) {
        toast.warning(
          'Balasan otomatis sedang bermasalah, pesan fallback ditampilkan.'
        );
      }
    },
  });

  const titleMut = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      patchTitle(id, title),
    onSuccess: (updated) => {
      setTitle(updated.title);
      setEditingTitle(false);
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Judul diperbarui.');
    },
    onError: () => toast.error('Gagal memperbarui judul.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.removeQueries({ queryKey: ['conversation', conversationId] });
      onDeleted(conversationId);
      toast.success('Percakapan dihapus.');
    },
    onError: () => toast.error('Gagal menghapus percakapan.'),
  });

  // Auto-scroll to bottom whenever the rendered messages change or while a
  // reply is in flight. This only touches a DOM ref (no React state).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [renderMessages, sendMut.isPending]);

  // Focus the title input when entering edit mode.
  useEffect(() => {
    if (editingTitle) {
      const t = setTimeout(() => titleInputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [editingTitle]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendMut.isPending) return;
    if (text.length > MAX_TEXT) {
      toast.error('Pesan terlalu panjang (maksimal 2000 karakter).');
      return;
    }
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    sendMut.mutate({ conversationId, text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow the textarea up to ~4 lines, then scroll internally.
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  };

  const startEditTitle = () => {
    setDraftTitle(renderTitle);
    setEditingTitle(true);
  };
  const commitTitle = () => {
    const next = draftTitle.trim();
    if (!next || next === renderTitle) {
      setEditingTitle(false);
      return;
    }
    titleMut.mutate({ id: conversationId, title: next });
  };
  const cancelTitle = () => {
    setEditingTitle(false);
    setDraftTitle(renderTitle);
  };
  const titleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelTitle();
    }
  };

  return (
    <section className="flex h-full flex-col" aria-label="Jendela obrolan">
      {/* Top bar: hamburger (mobile) + editable title + status badge + delete */}
      <header className="flex items-center gap-2 border-b bg-card/80 px-3 py-2.5 backdrop-blur sm:px-4">
        {onOpenSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenSidebar}
            aria-label="Buka daftar percakapan"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {editingTitle ? (
            <div className="flex w-full items-center gap-1">
              <Input
                ref={titleInputRef}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={titleKeyDown}
                maxLength={120}
                className="h-8 text-sm"
                aria-label="Ubah judul percakapan"
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-8 shrink-0 text-primary"
                onClick={commitTitle}
                disabled={titleMut.isPending}
                aria-label="Simpan judul"
              >
                {titleMut.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 shrink-0"
                onClick={cancelTitle}
                aria-label="Batal ubah judul"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={startEditTitle}
                className="group flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                aria-label="Klik untuk mengubah judul"
                title="Klik untuk mengubah judul"
              >
                <h2 className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {renderTitle || DEFAULT_TITLE}
                </h2>
                <PencilLine
                  className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </button>
              <StatusBadge
                status={renderStatus}
                className="hidden sm:inline-flex"
              />
            </>
          )}
        </div>

        {/* Mobile: status badge beside the delete button */}
        <StatusBadge status={renderStatus} className="sm:hidden" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 text-muted-foreground hover:text-destructive"
              aria-label="Hapus percakapan"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Hapus</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus percakapan ini?</AlertDialogTitle>
              <AlertDialogDescription>
                Semua pesan dalam percakapan &quot;{renderTitle}&quot; akan
                dihapus permanen dan tidak bisa dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => deleteMut.mutate(conversationId)}
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      {/* Message list with custom scrollbar; "sistem" audit markers render as
          slim alert strips inline in the flow (not chat bubbles). */}
      <div
        ref={scrollRef}
        className="chat-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
        role="log"
        aria-live="polite"
        aria-label="Transkrip percakapan"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Memuat percakapan…
          </div>
        ) : errored ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <AlertTriangle className="size-6 text-amber-500" aria-hidden="true" />
            Gagal memuat percakapan. Coba refresh halaman.
          </div>
        ) : renderMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
            <p className="text-base font-medium text-foreground">
              Halo, kamu di sini 🌷
            </p>
            <p>
              Sampaikan apa yang sedang kamu rasakan. Pesan pertama kamu akan
              memulai percakapan.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {renderMessages.map((m) =>
              m.sender === 'sistem' ? (
                <CrisisBanner key={m.id} message={m} />
              ) : (
                <MessageBubble key={m.id} message={m} />
              )
            )}
            {sendMut.isPending && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input area: disclaimer + textarea + send */}
      <div className="border-t bg-card/80 px-3 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-3xl">
          <DisclaimerBanner />
          <div className="mt-1.5 flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tulis pesan… (Enter untuk kirim, Shift+Enter untuk baris baru)"
              rows={1}
              maxLength={MAX_TEXT}
              className="max-h-28 min-h-11 resize-none"
              aria-label="Pesan ke asisten"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={sendMut.isPending || input.trim().length === 0}
              size="icon"
              className="h-11 shrink-0"
              aria-label="Kirim pesan"
            >
              {sendMut.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
