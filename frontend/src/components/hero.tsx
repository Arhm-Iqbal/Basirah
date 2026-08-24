'use client';

import { HeroCanvas } from '@/components/hero-canvas';
import { PrimaryButtonLink, SecondaryButtonLink } from '@/components/button-link';

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-basirah-teal">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgb(208_250_251_/_12%),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-basirah-teal/20 via-transparent to-basirah-teal" />
      <div className="pointer-events-none absolute inset-0">
        <HeroCanvas />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
        <p className="font-display text-xs font-medium tracking-[0.28em] text-basirah-cyan/80 uppercase">
          Basirah
        </p>
        <h1 className="mt-5 max-w-sm text-2xl leading-tight text-white sm:max-w-md sm:text-4xl">
          Community security for Canadian mosques.
        </h1>
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-sm sm:flex-row sm:justify-center">
          <PrimaryButtonLink href="/signup">Sign up</PrimaryButtonLink>
          <SecondaryButtonLink href="/login">Sign in</SecondaryButtonLink>
        </div>
      </div>
    </section>
  );
}
