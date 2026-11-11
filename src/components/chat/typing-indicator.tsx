'use client';

// Three gently bouncing dots shown in a bot-style bubble while the LLM is
// generating its reply. Kept as a tiny standalone component so the chat window
// stays readable.
export function TypingIndicator() {
  return (
    <div
      className="flex items-end gap-2"
      aria-live="polite"
      aria-label="Asisten sedang mengetik"
    >
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        aria-hidden="true"
      >
        {/* Small dot glyph so the avatar reads as a "face" while typing. */}
        <span className="text-[10px] font-bold leading-none">AI</span>
      </div>
      <div className="rounded-2xl rounded-bl-sm border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-primary/50" />
        </div>
      </div>
    </div>
  );
}
