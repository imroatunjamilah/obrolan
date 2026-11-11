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

// ---------------------------------------------------------------- mode LLM
// Dua mode dipanggil, dipilih otomatis:
//  1) Mode ENV (dipakai saat deploy di luar sandbox ini, mis. Vercel):
//     set env LLM_API_KEY + LLM_BASE_URL (+ LLM_MODEL opsional). Endpoint-nya
//     kompatibel OpenAI (mis. https://api.z.ai/api/paas/v4 dengan model gratis
//     glm-4.5-flash). Kunci TIDAK pernah dikirim ke klien.
//  2) Mode SDK (sandbox pengembangan): tanpa env LLM_*, memakai .z-ai-config.
const ENV_BASE_URL = (process.env.LLM_BASE_URL || '').trim().replace(/\/+$/, '');
const ENV_API_KEY = (process.env.LLM_API_KEY || '').trim();
const ENV_MODEL = (process.env.LLM_MODEL || 'glm-4.5-flash').trim();
const ENV_MODE = ENV_BASE_URL !== '' && ENV_API_KEY !== '';

// Panggilan langsung ke endpoint kompatibel-OpenAI (mode ENV).
async function callEnvEndpoint(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const body: Record<string, unknown> = {
    model: ENV_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 400,
  };
  // Parameter thinking hanya dikenal model seri GLM — provider lain biasanya
  // mengabaikan field asing, tapi lebih aman hanya dikirim untuk GLM.
  if (/glm/i.test(ENV_MODEL)) body.thinking = { type: 'disabled' };

  const res = await fetch(`${ENV_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ENV_API_KEY}`,
    },
    body: JSON.stringify(body),
    // Jaga tetap di bawah batas timeout function Vercel (maxDuration 60s).
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`LLM API ${res.status}: ${detail}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: unknown } }[];
  };
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content.trim() : '';
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
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];
    for (const m of history) {
      messages.push({
        role: m.sender === 'mahasiswa' ? 'user' : 'assistant',
        content: m.text,
      });
    }

    let content: string;
    if (ENV_MODE) {
      // Deploy di luar sandbox: panggil endpoint kompatibel-OpenAI via env.
      content = await callEnvEndpoint(
        systemPrompt,
        messages.slice(1) as { role: 'user' | 'assistant'; content: string }[]
      );
    } else {
      // Sandbox pengembangan: SDK dengan .z-ai-config.
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
        temperature: 0.7,
        max_tokens: 400,
      } as any);
      content = completion.choices?.[0]?.message?.content?.trim() ?? '';
    }

    if (!content) return { reply: FALLBACK_REPLY, error: 'EMPTY' };
    return { reply: content, error: null };
  } catch (err: any) {
    console.error('[llm] error:', err?.message ?? err);
    return { reply: FALLBACK_REPLY, error: err?.name ?? 'ERROR' };
  }
}
