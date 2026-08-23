import Link from 'next/link';
import type { ComponentProps } from 'react';

const base =
  'inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors sm:w-auto sm:px-8';

export function PrimaryButtonLink({
  className = '',
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`${base} bg-basirah-rust text-white hover:bg-basirah-rust/90 ${className}`}
    />
  );
}

export function SecondaryButtonLink({
  className = '',
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`${base} border border-white/25 bg-white/5 text-white hover:bg-white/10 ${className}`}
    />
  );
}

export function TealButtonLink({
  className = '',
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`${base} bg-basirah-teal text-white hover:bg-basirah-teal/90 ${className}`}
    />
  );
}
