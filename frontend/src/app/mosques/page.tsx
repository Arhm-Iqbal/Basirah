import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosques',
};

export default function MosquesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-ink text-3xl font-semibold tracking-tight">Mosques near you</h1>
      <p className="text-ink/75 mt-3 leading-relaxed">
        Prayer times, events, facilities, and contact details. Not built yet.
      </p>
    </main>
  );
}
