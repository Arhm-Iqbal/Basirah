import type { Metadata } from 'next';

import { NavBar } from '@/components/nav-bar';

export const metadata: Metadata = {
  title: 'Find Community Support',
};

export default function SupportPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal">
          Find Community Support
        </h1>
        <p className="mt-3 leading-relaxed text-basirah-teal/75">
          A directory of Muslim lawyers, counsellors, advocates, and community safety contacts.
          Not built yet.
        </p>
      </main>
    </>
  );
}
