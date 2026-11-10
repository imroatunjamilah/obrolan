// Small disclaimer rendered directly above the chat input. Uses the ORIGINAL
// UPA BK disclaimer text from the safety layer (crisis.ts) so the wording
// stays identical to the prototype this app was ported from.
import { DISCLAIMER_CHAT } from '@/lib/crisis';

export function DisclaimerBanner() {
  return (
    <p
      className="px-1 text-[11px] leading-snug text-muted-foreground"
      aria-label="Disclaimer layanan"
    >
      {DISCLAIMER_CHAT}
    </p>
  );
}
