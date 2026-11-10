import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PREVIEW_LEN = 80;
const STUDENT_SENDERS = ['mahasiswa', 'bot'] as const;

// GET /api/chat/conversations
// List all conversations newest-first with summary metadata (status, message
// count + a short preview of the last student/bot message, sender included).
// "sistem" audit markers are excluded from the preview (they show as strips
// inside the transcript instead).
export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { sender: true, text: true, createdAt: true },
        },
      },
    });

    const data = conversations.map((c) => {
      const chatMessages = c.messages.filter((m) =>
        (STUDENT_SENDERS as readonly string[]).includes(m.sender)
      );
      const lastMsg =
        chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
      let preview = 'Belum ada pesan';
      if (lastMsg) {
        const who = lastMsg.sender === 'mahasiswa' ? 'Kamu' : 'Asisten';
        const truncated =
          lastMsg.text.length > PREVIEW_LEN
            ? lastMsg.text.slice(0, PREVIEW_LEN) + '…'
            : lastMsg.text;
        preview = `${who}: ${truncated}`;
      }
      return {
        id: c.id,
        title: c.title,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        messageCount: c.messages.length,
        lastMessagePreview: preview,
      };
    });

    return NextResponse.json({ conversations: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/conversations GET] error:', message);
    return NextResponse.json(
      { error: 'Gagal memuat daftar percakapan.' },
      { status: 500 }
    );
  }
}

// POST /api/chat/conversations
// Create a new empty conversation (status starts as "normal").
export async function POST() {
  try {
    const conv = await db.conversation.create({
      data: { title: 'Percakapan Baru', status: 'normal' },
    });
    return NextResponse.json(
      {
        id: conv.id,
        title: conv.title,
        status: conv.status,
        createdAt: conv.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/conversations POST] error:', message);
    return NextResponse.json(
      { error: 'Gagal membuat percakapan baru.' },
      { status: 500 }
    );
  }
}
