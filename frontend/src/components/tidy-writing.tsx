'use client';

import { useState } from 'react';

import { Button } from '@/components/button-link';
import { tidyWriting } from '@/lib/queries';

// Nothing is replaced without the reporter seeing both versions and choosing. Their
// account is the record of what happened; a silent rewrite would put words in their mouth.
export function TidyWriting({
  text,
  onAccept,
  minLength = 20,
}: {
  text: string;
  onAccept: (next: string) => void;
  minLength?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const tooShort = text.trim().length < minLength;

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const { rewritten } = await tidyWriting(text.trim());
      if (rewritten.trim() === text.trim()) {
        setError('This already reads clearly, so nothing was changed.');
        return;
      }
      setSuggestion(rewritten);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not tidy that up.');
    } finally {
      setBusy(false);
    }
  };

  if (suggestion) {
    return (
      <div className="mt-3 rounded-md border border-basirah-teal/25 bg-white p-4">
        <p className="text-sm font-semibold text-basirah-teal">Suggested wording</p>
        <p className="mt-1 text-sm leading-relaxed text-basirah-teal/70">
          Only spelling, grammar and punctuation were touched. Read it before you accept — if
          anything you wrote has changed in meaning, keep your own version.
        </p>
        <p className="mt-3 rounded-md bg-basirah-cream/70 p-3 text-base leading-relaxed whitespace-pre-wrap text-basirah-teal">
          {suggestion}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              onAccept(suggestion);
              setSuggestion(null);
            }}
          >
            Use this
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
            Keep mine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Button size="sm" variant="ghost" disabled={busy || tooShort} onClick={() => void run()}>
        {busy ? 'Reading…' : 'Fix spelling and grammar'}
      </Button>
      {tooShort && (
        <span className="ms-2 text-sm text-basirah-teal/55">Write a little more first.</span>
      )}
      {error && <p className="mt-2 text-sm text-basirah-rust">{error}</p>}
    </div>
  );
}
