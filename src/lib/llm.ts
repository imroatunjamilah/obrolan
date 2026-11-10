import ZAI from 'z-ai-web-dev-sdk';
import { loadSystemPrompt } from './prompts';

export type ChatSender = 'mahasiswa' | 'bot';

export interface HistoryItem {
  sender: ChatSender;
  text: string;
}

export interface GenerateReplyResult {
  reply: string;
  error: string | null;
}

// Graceful fallback shown when the LLM call fails or returns empty content.
// This chatbox HAS a keyword-based crisis layer before the LLM (see crisis.ts),
// but a technical outage in layer 3 must still never leave the user without a
// signpost to immediate human help.
export const FALLBACK_REPLY =
  'Maaf, sedang terjadi kendala teknis pada layanan obrolan sehingga saya belum bisa ' +
  'merespons dengan baik. Silakan coba beberapa saat lagi. Jika kondisi Anda mendesak, ' +
  'hubungi 112 atau 119 ext. 8, atau datang langsung ke UPA BK UTM.';

// Layer 3 of the safety architecture: the LLM call. Layers 1-2 (crisis /
// handoff keyword detection in crisis.ts) run BEFORE this and never reach the
// model. The system prompt (loaded from prompts/chatbot_system_prompt.md) is
// the original UPA BK prompt. Never throws to the caller; on any error returns
// a graceful fallback reply.
export async function generateReply(
  history: HistoryItem[]
): Promise<GenerateReplyResult> {
  try {
    const systemPrompt = await loadSystemPrompt();
    const zai = await ZAI.create();
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];
    for (const m of history) {
      messages.push({
        role: m.sender === 'mahasiswa' ? 'user' : 'assistant',
        content: m.text,
      });
    }
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
      temperature: 0.7,
      max_tokens: 400,
    } as any);
    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) return { reply: FALLBACK_REPLY, error: 'EMPTY' };
    return { reply: content, error: null };
  } catch (err: any) {
    console.error('[llm] error:', err?.message ?? err);
    return { reply: FALLBACK_REPLY, error: err?.name ?? 'ERROR' };
  }
}
