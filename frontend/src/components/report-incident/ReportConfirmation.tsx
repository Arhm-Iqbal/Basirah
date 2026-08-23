'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function ReportConfirmation({
  reference,
  onClose,
}: {
  reference: string;
  onClose: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <span className="bg-mist text-ink mx-auto flex size-14 items-center justify-center rounded-full">
        <ShieldCheck className="size-7" aria-hidden />
      </span>

      <h2 className="text-ink mt-5 text-2xl font-semibold tracking-tight">Report Received</h2>
      <p className="text-ink/75 mt-2.5 leading-relaxed">
        Thank you for taking the time to document what happened.
      </p>

      <div className="border-ink/15 mt-6 rounded-2xl border bg-white px-5 py-4">
        <p className="text-ink/60 text-xs font-semibold tracking-wide uppercase">
          Demo Reference Number
        </p>
        <p className="text-ink mt-1.5 font-mono text-xl font-semibold">{reference}</p>
      </div>

      <p className="text-ink/70 mt-4 text-sm leading-relaxed">
        This is a prototype, so nothing has been sent or stored. Write the number down if you would
        like to refer to this session.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          onClick={onClose}
          className="bg-ink rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Return Home
        </Link>
        <Link
          href="/support"
          onClick={onClose}
          className="border-ink/25 text-ink hover:bg-mist rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition-colors"
        >
          Find Community Support
        </Link>
      </div>
    </div>
  );
}
