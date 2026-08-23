import Link from 'next/link';

import { NavBar } from '@/components/nav-bar';

export function PagePlaceholder({ title }: { title: string }) {
  return (
    <>
      <NavBar />
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-basirah-cream px-6 text-center">
        <span className="rounded-full bg-basirah-teal/5 px-4 py-1.5 text-xs font-medium tracking-wider text-basirah-teal/60 uppercase">
          Coming soon
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-basirah-teal sm:text-4xl">
          {title}
        </h1>
        <Link
          href="/"
          className="mt-8 text-sm font-medium text-basirah-rust transition-colors hover:text-basirah-rust/80"
        >
          ← Back to home
        </Link>
      </main>
    </>
  );
}
