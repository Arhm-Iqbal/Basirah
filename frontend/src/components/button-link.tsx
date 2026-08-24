import Link from 'next/link';
import type { ComponentProps } from 'react';

type Size = 'sm' | 'md';
type Variant = 'primary' | 'secondary' | 'teal' | 'ghost';

// min-h on the tap sizes rather than padding alone: padding collapses when a button holds
// only an icon, and these have to stay thumb-sized on mobile.
const SIZES: Record<Size, string> = {
  sm: 'min-h-9 gap-1.5 px-4 text-[0.8125rem]',
  md: 'min-h-11 gap-2 px-6 text-sm sm:px-7',
};

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-basirah-rust text-white hover:bg-[#a82a0b] active:bg-[#7d1b05] focus-visible:outline-basirah-rust',
  teal: 'bg-basirah-teal text-white hover:bg-[#0a4749] active:bg-[#032526] focus-visible:outline-basirah-teal',
  secondary:
    'border border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 active:bg-white/[0.03] focus-visible:outline-white',
  ghost:
    'border border-basirah-teal/15 text-basirah-teal hover:border-basirah-teal/30 hover:bg-basirah-teal/5 active:bg-basirah-teal/10 focus-visible:outline-basirah-teal',
};

const base =
  'inline-flex select-none items-center justify-center rounded-full font-medium tracking-[-0.01em] ' +
  'transition-[background-color,border-color,transform,opacity] duration-150 ease-out ' +
  'active:scale-[0.98] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 ' +
  'motion-reduce:transition-none motion-reduce:active:scale-100';

function classes(variant: Variant, size: Size, extra: string) {
  return `${base} ${SIZES[size]} ${VARIANTS[variant]} ${extra}`;
}

type LinkProps = ComponentProps<typeof Link> & { size?: Size };

function makeLink(variant: Variant) {
  return function ButtonLink({ className = '', size = 'md', ...props }: LinkProps) {
    return <Link {...props} className={classes(variant, size, className)} />;
  };
}

export const PrimaryButtonLink = makeLink('primary');
export const SecondaryButtonLink = makeLink('secondary');
export const TealButtonLink = makeLink('teal');
export const GhostButtonLink = makeLink('ghost');

type ButtonProps = ComponentProps<'button'> & { size?: Size; variant?: Variant };

export function Button({
  className = '',
  size = 'md',
  variant = 'teal',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`${classes(variant, size, className)} cursor-pointer`}
    />
  );
}
