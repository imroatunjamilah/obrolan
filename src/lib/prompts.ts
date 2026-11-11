import { promises as fs } from 'fs';
import path from 'path';

// Loads the chatbot system prompt from disk (cached after first read).
// Keeping the prompt in a separate .md file lets the researcher tweak chatbot
// behaviour for A/B experiments without touching code.

let cached: string | null = null;

export async function loadSystemPrompt(): Promise<string> {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), 'prompts', 'chatbot_system_prompt.md');
  cached = await fs.readFile(filePath, 'utf-8');
  return cached;
}

// Test hook: allow tests / hot-reload of prompt file in dev to clear cache.
export function resetSystemPromptCache(): void {
  cached = null;
}
