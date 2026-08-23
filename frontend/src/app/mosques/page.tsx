import type { Metadata } from 'next';

import { NavBar } from '@/components/nav-bar';

export const metadata: Metadata = {
  title: 'Mosques',
};

export default function MosquesPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal">
          Mosques near you
        </h1>
        <p className="mt-3 leading-relaxed text-basirah-teal/75">
          Prayer times, events, facilities, and contact details. Not built yet.
        </p>
      </main>
    </>
  );
}
