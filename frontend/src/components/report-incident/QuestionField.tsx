'use client';

import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';

export const INPUT_CLASS =
  'w-full min-h-[52px] rounded-xl border border-ink/20 bg-white px-4 py-3 text-base text-ink transition-colors placeholder:text-ink/40 focus:border-ink focus:ring-2 focus:ring-ink/15 focus:outline-none';

export const TEXTAREA_CLASS =
  'w-full resize-y rounded-xl border border-ink/20 bg-white px-4 py-3 text-base leading-relaxed text-ink transition-colors placeholder:text-ink/40 focus:border-ink focus:ring-2 focus:ring-ink/15 focus:outline-none';

export const INVALID_CLASS = 'border-rust focus:border-rust focus:ring-rust/20';

export function helperId(id: string): string {
  return `${id}-helper`;
}

export function errorId(id: string): string {
  return `${id}-error`;
}

export function describedBy(id: string, hasHelper: boolean, hasError: boolean): string | undefined {
  const ids = [hasHelper ? helperId(id) : null, hasError ? errorId(id) : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

type QuestionFieldProps = {
  id: string;
  label: string;
  helper?: ReactNode;
  optional?: boolean;
  error?: string;
  children: ReactNode;
};

export function QuestionField({
  id,
  label,
  helper,
  optional,
  error,
  children,
}: QuestionFieldProps) {
  return (
    <div className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-ink text-base font-semibold sm:text-lg">
          {label}
        </label>
        {optional ? (
          <span className="text-ink/50 text-xs font-medium tracking-wide uppercase">Optional</span>
        ) : null}
      </div>

      {helper ? (
        <p id={helperId(id)} className="text-ink/70 mt-1.5 text-sm leading-relaxed">
          {helper}
        </p>
      ) : null}

      <div className="mt-4">{children}</div>

      {error ? (
        <p
          id={errorId(id)}
          role="alert"
          className="text-rust mt-3 flex items-start gap-1.5 text-sm font-medium"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A heading that groups several question cards under one idea, without adding a card of its own. */
export function QuestionGroupHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="pt-2">
      <h3 className="text-ink text-lg font-semibold sm:text-xl">{title}</h3>
      {description ? (
        <p className="text-ink/70 mt-1.5 text-sm leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
