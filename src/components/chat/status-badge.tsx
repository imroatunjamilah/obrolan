import { ShieldCheck, Siren, Users } from 'lucide-react';
import type { ConversationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ConversationStatus | string;
  className?: string;
}

// Status badge for the 3-layer safety flow:
// - "normal"    -> violet tint  (regular assistant conversation)
// - "crisis"    -> red          ([ESKALASI] flag — needs officer review ASAP)
// - "handoff"   -> calm emerald ([OTOMATIS] student asked for human counselling)
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized =
    status === 'crisis' || status === 'handoff' ? status : 'normal';

  const config = {
    normal: {
      label: 'Normal',
      icon: ShieldCheck,
      className: 'bg-primary/10 text-primary ring-primary/20',
    },
    crisis: {
      label: 'Krisis',
      icon: Siren,
      className: 'bg-crisis-soft text-crisis ring-crisis/25',
    },
    handoff: {
      label: 'Pendampingan',
      icon: Users,
      className: 'bg-handoff-soft text-handoff ring-handoff/25',
    },
  }[normalized];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset sm:text-[11px]',
        config.className,
        className
      )}
      role="status"
      aria-label={`Status percakapan: ${config.label}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
