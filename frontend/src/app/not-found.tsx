import Link from 'next/link';

import { MarketingPage } from '@/components/marketing-page';

export default function NotFound() {
  return (
    <MarketingPage className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base text-basirah-teal">
        That link doesn&apos;t go anywhere. Head back to the home page or report an incident.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-basirah-teal px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-basirah-teal/90"
        >
          Home
        </Link>
        <Link
          href="/report"
          className="rounded-md border border-basirah-teal/30 bg-white px-5 py-2.5 text-base font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream"
        >
          Report an incident
        </Link>
      </div>
    </MarketingPage>
  );
}
