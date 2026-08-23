import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosque and Community Events',
};

export default function MosquesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-ink text-3xl font-semibold tracking-tight">
        Mosque and Community Events
      </h1>
      <p className="text-ink/75 mt-3 leading-relaxed">
        Upcoming events, programs, prayer times, facilities, and contact details for mosques near
        you. Not built yet.
      </p>
    </main>
  );
}
