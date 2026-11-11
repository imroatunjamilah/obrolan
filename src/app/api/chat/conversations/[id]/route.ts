import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/chat/conversations/[id]
// Return conversation + ALL messages (oldest first), INCLUDING "sistem"
// messages — the researcher must see the escalation audit markers inline.
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const conv = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) {
      return NextResponse.json(
        { error: 'Percakapan tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: conv.id,
        title: conv.title,
        status: conv.status,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      },
      messages: conv.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/conversations/[id] GET] error:', message);
    return NextResponse.json(
      { error: 'Gagal memuat percakapan.' },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/conversations/[id]
// Update title (only field editable here).
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const title: string | undefined = body?.title;
    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Judul tidak boleh kosong.' },
        { status: 400 }
      );
    }
    const trimmed = title.trim().slice(0, 120);
    const updated = await db.conversation.update({
      where: { id },
      data: { title: trimmed },
      select: { id: true, title: true },
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/conversations/[id] PATCH] error:', message);
    return NextResponse.json(
      { error: 'Gagal memperbarui percakapan.' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/conversations/[id]
// Cascade delete the conversation and its messages.
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await db.conversation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/conversations/[id] DELETE] error:', message);
    return NextResponse.json(
      { error: 'Gagal menghapus percakapan.' },
      { status: 500 }
    );
  }
}
