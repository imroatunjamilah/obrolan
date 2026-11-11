import ReactMarkdown from 'react-markdown';
import { Bot } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

// Chat bubble. Student messages sit on the right with the warm violet primary
// tint (UPA BK theme); bot replies sit on the left in a card with a small
// assistant avatar badge and are rendered as lightweight markdown (the UPA BK
// system prompt may emit short bullet lists).
export function MessageBubble({ message }: MessageBubbleProps) {
  const isStudent = message.sender === 'mahasiswa';

  return (
    <div
      className={cn(
        'flex w-full items-end gap-2',
        isStudent ? 'justify-end' : 'justify-start'
      )}
    >
      {!isStudent && (
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
          title="Asisten AI"
        >
          <Bot className="size-4" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[70%]',
          isStudent
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm border bg-card text-card-foreground'
        )}
        role="article"
        aria-label={`Pesan ${isStudent ? 'kamu' : 'asisten AI'}`}
      >
        {isStudent ? (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        ) : (
          <div className="prose-chatbot break-words">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
