'use client';

import { useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ReportIncidentDialog } from './ReportIncidentDialog';

type Size = 'default' | 'large';

const SIZE_CLASSES: Record<Size, string> = {
  default: 'px-4 py-2.5 text-sm',
  large: 'px-6 py-3.5 text-base',
};

export function ReportIncidentTrigger({
  label = 'Report an Incident',
  size = 'default',
  className = '',
}: {
  label?: string;
  size?: Size;
  className?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // Bumping this on every open guarantees a fresh, empty report rather than a stale one.
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
        className={`bg-rust inline-flex items-center gap-2 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 ${SIZE_CLASSES[size]} ${className}`}
      >
        <ShieldAlert className={size === 'large' ? 'size-5' : 'size-4'} aria-hidden />
        {label}
      </button>

      {open ? <ReportIncidentDialog key={session} onClose={close} /> : null}
    </>
  );
}
