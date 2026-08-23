'use client';

import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('@/components/hero').then((mod) => mod.Hero), {
  ssr: false,
  loading: () => (
    <section className="relative overflow-hidden bg-basirah-teal px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgb(208_250_251_/_12%),_transparent_55%)]" />
      <p className="relative z-10 text-xs font-medium tracking-[0.2em] text-basirah-cyan/80 uppercase">
        Basirah
      </p>
      <h1 className="relative z-10 mx-auto mt-4 max-w-xs text-2xl font-semibold leading-tight text-white sm:max-w-2xl sm:text-4xl">
        Community security for Canadian mosques.
      </h1>
    </section>
  ),
});

const GetStarted = dynamic(
  () => import('@/components/get-started').then((mod) => mod.GetStarted),
  { ssr: false },
);

export function HomeContent() {
  return (
    <main>
      <Hero />
      <GetStarted />
    </main>
  );
}
