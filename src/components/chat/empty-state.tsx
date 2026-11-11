'use client';

import { Sparkles, MessageCirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  onStart: () => void;
  loading?: boolean;
}

// Shown in the main area when no conversation is selected. A calm, safe-space
// welcome card that invites the student to start talking.
export function EmptyState({ onStart, loading }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md gap-4 border-primary/15 bg-card/80 p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-7" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Mulai percakapan baru
          </h2>
          <p className="text-sm text-muted-foreground sm:text-[15px]">
            Ceritakan apa yang sedang Anda rasakan. Asisten UPA BK di sini
            untuk mendengarkan.
          </p>
        </div>
        <Button
          onClick={onStart}
          disabled={loading}
          size="lg"
          className="mt-2 w-full gap-2"
        >
          <MessageCirclePlus className="size-4" aria-hidden="true" />
          {loading ? 'Menyiapkan…' : 'Mulai Obrolan'}
        </Button>
        <p className="pt-1 text-[11px] text-muted-foreground">
          Asisten awal berbasis AI — bukan pengganti konseling profesional UPA
          BK.
        </p>
      </Card>
    </div>
  );
}
