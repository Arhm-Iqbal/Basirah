'use client';

import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('@/components/hero').then((mod) => mod.Hero), {
  ssr: false,
  loading: () => (
    <section className="bg-basirah-teal px-4 py-16 text-center sm:px-6 sm:py-28">
      <h1 className="mx-auto max-w-xs text-2xl font-semibold leading-tight text-white sm:max-w-2xl sm:text-4xl">
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
