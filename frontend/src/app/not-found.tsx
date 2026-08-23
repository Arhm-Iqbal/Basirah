import Link from 'next/link';

import { MarketingPage } from '@/components/marketing-page';

export default function NotFound() {
  return (
    <MarketingPage className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-sm text-basirah-teal/70">
        That link doesn&apos;t go anywhere. Head back to the home page or report an incident.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-basirah-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-basirah-teal/90"
        >
          Home
        </Link>
        <Link
          href="/report"
          className="rounded-full border border-basirah-teal/15 px-6 py-3 text-sm font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream"
        >
          Report an incident
        </Link>
      </div>
    </MarketingPage>
  );
}
