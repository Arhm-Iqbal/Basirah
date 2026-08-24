import Image from 'next/image';

import { PrimaryButtonLink, SecondaryButtonLink } from '@/components/button-link';
import { Logo } from '@/components/logo';

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-basirah-teal">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/basirah-flower.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-[1.15] object-cover object-center opacity-35 mix-blend-screen"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-basirah-teal/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,_transparent_0%,_rgb(4_51_52_/_55%)_100%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-8">
        <Logo
          priority
          className="h-28 w-auto drop-shadow-[0_8px_30px_rgb(0_0_0_/_45%)] sm:h-36 md:h-44"
        />
        <h1 className="mt-10 max-w-2xl text-4xl leading-[1.12] text-white sm:text-5xl md:text-6xl">
          Community security for Canadian mosques.
        </h1>
        <div className="mt-12 flex w-full max-w-md flex-col gap-4 sm:max-w-lg sm:flex-row sm:justify-center">
          <PrimaryButtonLink
            href="/signup"
            size="lg"
            className="w-full sm:w-auto sm:min-w-[10.5rem]"
          >
            Sign up
          </PrimaryButtonLink>
          <SecondaryButtonLink
            href="/login"
            size="lg"
            className="w-full sm:w-auto sm:min-w-[10.5rem]"
          >
            Sign in
          </SecondaryButtonLink>
        </div>
      </div>
    </section>
  );
}
