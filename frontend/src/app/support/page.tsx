import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Community Support',
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-ink text-3xl font-semibold tracking-tight">Find Community Support</h1>
      <p className="text-ink/75 mt-3 leading-relaxed">
        A directory of Muslim lawyers, counsellors, advocates, and community safety contacts. Not
        built yet.
      </p>
    </main>
  );
}
