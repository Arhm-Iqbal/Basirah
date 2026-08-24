'use client';

import { BookOpen } from 'lucide-react';
import { useRef, useState } from 'react';

import { ResourceDirectoryDialog } from '@/components/resources/resource-directory-dialog';

export function ResourceDirectoryTrigger({ label = 'Browse the directory' }: { label?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // Remounting on each open resets the dialog to its first screen, so reopening never
  // drops someone back into the list they were last reading.
  const [session, setSession] = useState(0);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setSession((current) => current + 1);
          setOpen(true);
        }}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-basirah-rust px-6 py-3.5 text-base font-semibold text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none"
      >
        <BookOpen className="size-5" aria-hidden />
        {label}
      </button>

      {open ? <ResourceDirectoryDialog key={session} onClose={close} /> : null}
    </>
  );
}
