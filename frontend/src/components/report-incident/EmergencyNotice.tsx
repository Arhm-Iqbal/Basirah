'use client';

import { TriangleAlert } from 'lucide-react';

/**
 * `full` is the start-screen version. `compact` sits beside the threat and weapon questions as a
 * reminder without repeating the whole message.
 */
export function EmergencyNotice({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="border-rust/30 flex items-start gap-2.5 rounded-xl border border-l-4 border-l-rust bg-white px-4 py-3">
        <TriangleAlert className="text-rust mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="text-ink/80 text-sm leading-relaxed">
          If there is an immediate risk to anyone&rsquo;s safety, contact your local emergency
          services. This form is for documentation and follow-up.
        </p>
      </div>
    );
  }

  return (
    <div className="border-rust/30 rounded-2xl border border-l-4 border-l-rust bg-white p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="text-rust mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <h3 className="text-rust text-base font-semibold">Are you in immediate danger?</h3>
          <p className="text-ink/80 mt-1.5 text-sm leading-relaxed">
            If you or someone else is in immediate danger, contact your local emergency services.
            This reporting form is intended for documentation and follow-up, not emergency response.
          </p>
        </div>
      </div>
    </div>
  );
}
