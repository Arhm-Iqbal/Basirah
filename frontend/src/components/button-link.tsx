import Link from 'next/link';
import type { ComponentProps } from 'react';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'teal' | 'ghost';

const SIZES: Record<Size, string> = {
  sm: 'min-h-10 gap-1.5 px-3.5 text-sm',
  md: 'min-h-11 gap-2 px-5 text-base',
  lg: 'min-h-12 gap-2 px-7 text-base',
};

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-basirah-rust text-white hover:bg-[#a82a0b] active:bg-[#7d1b05] focus-visible:outline-basirah-rust',
  teal: 'bg-basirah-teal text-white hover:bg-[#0a4749] active:bg-[#032526] focus-visible:outline-basirah-teal',
  secondary:
    'border border-white/40 bg-white/10 text-white hover:border-white/60 hover:bg-white/15 active:bg-white/[0.06] focus-visible:outline-white',
  ghost:
    'border border-basirah-teal/30 bg-white text-basirah-teal hover:border-basirah-teal hover:bg-basirah-cream active:bg-basirah-cream focus-visible:outline-basirah-teal',
};

const base =
  'inline-flex select-none items-center justify-center rounded-md font-semibold tracking-[-0.01em] ' +
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
