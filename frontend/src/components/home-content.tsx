'use client';

import dynamic from 'next/dynamic';

import { GetStarted } from '@/components/get-started';
import { NavBar } from '@/components/nav-bar';

const Hero = dynamic(() => import('@/components/hero').then((mod) => mod.Hero), {
  ssr: false,
  loading: () => (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-basirah-teal px-4">
      <p className="relative z-10 text-xs font-medium tracking-[0.2em] text-basirah-cyan/80 uppercase">
        Basirah
      </p>
    </section>
  ),
});

export function HomeContent() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <GetStarted />
      </main>
    </>
  );
}
