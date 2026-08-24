'use client';

import { BookOpen } from 'lucide-react';
import { useRef, useState } from 'react';

import { ResourceDirectoryDialog } from './ResourceDirectoryDialog';

export function ResourceDirectoryTrigger({ label = 'Browse the directory' }: { label?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
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
        className="bg-rust inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
      >
        <BookOpen className="size-5" aria-hidden />
        {label}
      </button>

      {open ? <ResourceDirectoryDialog key={session} onClose={close} /> : null}
    </>
  );
}
