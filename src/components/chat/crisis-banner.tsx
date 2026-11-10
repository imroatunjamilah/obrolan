import { AlertTriangle } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CrisisBannerProps {
  message: ChatMessage;
}

// Slim audit strip rendered INLINE in the transcript for "sistem" messages.
// These are not chat bubbles — they are escalation audit markers ([ESKALASI] /
// [OTOMATIS]) written by the safety layers so researchers/officers can see
// exactly where an automatic intervention happened.
export function CrisisBanner({ message }: CrisisBannerProps) {
  const isEscalation = message.text.startsWith('[ESKALASI]');

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-1.5',
        isEscalation
          ? 'border-crisis/30 bg-crisis-soft'
          : 'border-handoff/30 bg-handoff-soft'
      )}
      role="note"
      aria-label={
        isEscalasiLabel(isEscalation)
      }
    >
      <AlertTriangle
        className={cn(
          'mt-0.5 size-3.5 shrink-0',
          isEscalation ? 'text-crisis' : 'text-handoff'
        )}
        aria-hidden="true"
      />
      <p className="font-mono text-[11px] leading-snug text-foreground/75 break-words">
        {message.text}
      </p>
    </div>
  );
}

function isEscalasiLabel(isEscalation: boolean): string {
  return isEscalation
    ? 'Catatan audit sistem: eskalasi krisis'
    : 'Catatan audit sistem: permintaan pendampingan';
}
