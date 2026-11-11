import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateReply, type HistoryItem, type ChatSender } from '@/lib/llm';
import {
  detectCrisis,
  detectHandoff,
  SAFETY_MESSAGE,
  HANDOFF_ACKNOWLEDGMENT,
  MARKER_ESKALASI,
  MARKER_OTOMATIS,
  CRISIS_ESCALATION_NOTE,
  HANDOFF_ESCALATION_NOTE,
} from '@/lib/crisis';

interface MessageRequestBody {
  conversationId?: string;
  text?: string;
}

// Respons LLM bisa memakan waktu >10 detik default; di Vercel (plan gratis
// Hobby) izinkan sampai 60 detik. Diabaikan oleh runtime non-Vercel.
export const maxDuration = 60;

const MAX_TEXT = 2000;
const DEFAULT_TITLE = 'Percakapan Baru';

// Student-facing senders. "sistem" messages are audit markers only — they are
// never part of the LLM context (port of Python `_STUDENT_SENDERS`).
const STUDENT_SENDERS = ['mahasiswa', 'bot'] as const;

// Derive a short title from the student's first message (first 40 chars,
// truncated with an ellipsis if longer). Whitespace is collapsed.
function deriveTitle(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return DEFAULT_TITLE;
  return clean.slice(0, 40) + (clean.length > 40 ? '…' : '');
}

// Auto-title on the first student message + touch updatedAt (kept in sync so
// the conversation bubbles up in the sidebar). Returns the effective status.
async function finalizeConversation(
  conversationId: string,
  currentTitle: string,
  currentStatus: string,
  firstStudentText: string,
  nextStatus: string
): Promise<string> {
  const title =
    currentTitle === DEFAULT_TITLE ? deriveTitle(firstStudentText) : currentTitle;
  await db.conversation.update({
    where: { id: conversationId },
    data: {
      title,
      status: nextStatus,
      updatedAt: new Date(),
    },
  });
  return nextStatus;
}

// POST /api/chat/message
// The heart of the chatbot — port of the original UPA BK 3-layer safety flow
// (Python: app/routers/chat.py::send_message). On EVERY message, in order:
//   1. Crisis keyword layer (independent of the LLM)  -> fixed safety message
//      + [ESKALASI] audit marker + conversation flagged "crisis".
//   2. Human-handoff keyword layer                    -> fixed acknowledgment
//      + [OTOMATIS] audit marker + "handoff" status (never downgrades crisis).
//   3. LLM layer (system prompt = original UPA BK)    -> empathetic reply.
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as MessageRequestBody;
    const conversationId = body.conversationId;
    const rawText = typeof body.text === 'string' ? body.text : '';

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Percakapan tidak valid.' },
        { status: 400 }
      );
    }
    const text = rawText.trim();
    if (!text) {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong.' },
        { status: 400 }
      );
    }
    if (text.length > MAX_TEXT) {
      return NextResponse.json(
        { error: 'Pesan terlalu panjang (maksimal 2000 karakter).' },
        { status: 400 }
      );
    }

    // 0) Validate the conversation exists.
    const conv = await db.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) {
      return NextResponse.json(
        { error: 'Percakapan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 1) Save the student message.
    await db.message.create({
      data: { conversationId: conv.id, sender: 'mahasiswa', text },
    });

    // 2) LAYER 1 — crisis keywords (deliberately NOT dependent on the LLM).
    if (detectCrisis(text)) {
      await db.message.create({
        data: { conversationId: conv.id, sender: 'bot', text: SAFETY_MESSAGE },
      });
      await db.message.create({
        data: {
          conversationId: conv.id,
          sender: 'sistem',
          text: `${MARKER_ESKALASI} ${CRISIS_ESCALATION_NOTE}`,
        },
      });
      const status = await finalizeConversation(
        conv.id,
        conv.title,
        conv.status,
        text,
        'crisis'
      );
      return NextResponse.json({
        reply: SAFETY_MESSAGE,
        conversationId: conv.id,
        status,
        escalated: true,
        llmError: null,
      });
    }

    // 3) LAYER 2 — request for human counselling/handoff.
    if (detectHandoff(text)) {
      await db.message.create({
        data: {
          conversationId: conv.id,
          sender: 'bot',
          text: HANDOFF_ACKNOWLEDGMENT,
        },
      });
      await db.message.create({
        data: {
          conversationId: conv.id,
          sender: 'sistem',
          text: `${MARKER_OTOMATIS} ${HANDOFF_ESCALATION_NOTE}`,
        },
      });
      // Never downgrade an existing crisis flag.
      const nextStatus = conv.status === 'normal' ? 'handoff' : conv.status;
      const status = await finalizeConversation(
        conv.id,
        conv.title,
        conv.status,
        text,
        nextStatus
      );
      return NextResponse.json({
        reply: HANDOFF_ACKNOWLEDGMENT,
        conversationId: conv.id,
        status,
        escalated: false,
        llmError: null,
      });
    }

    // 4) LAYER 3 — LLM reply. History = all mahasiswa + bot messages,
    //    oldest first, sistem audit markers EXCLUDED (same as the original).
    const historyRows = await db.message.findMany({
      where: { conversationId: conv.id, sender: { in: [...STUDENT_SENDERS] } },
      orderBy: { createdAt: 'asc' },
      select: { sender: true, text: true },
    });
    const history: HistoryItem[] = historyRows.map((m) => ({
      sender: m.sender as ChatSender,
      text: m.text,
    }));

    const { reply, error } = await generateReply(history);

    await db.message.create({
      data: { conversationId: conv.id, sender: 'bot', text: reply },
    });

    // Layer 3 never changes the conversation status (an earlier crisis /
    // handoff flag persists for officer review) — it only touches title/time.
    const status = await finalizeConversation(
      conv.id,
      conv.title,
      conv.status,
      text,
      conv.status
    );

    return NextResponse.json({
      reply,
      conversationId: conv.id,
      status,
      escalated: false,
      llmError: error,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/chat/message POST] error:', message);
    return NextResponse.json(
      { error: 'Pesan gagal diproses.' },
      { status: 500 }
    );
  }
}
