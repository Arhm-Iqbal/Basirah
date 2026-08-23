import type { Metadata } from 'next';

import { CommunityMap } from '@/components/community-map';

export const metadata: Metadata = {
  title: 'Map · Basirah',
};

export default function MapPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-basirah-teal sm:text-2xl">
          Community map
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-basirah-teal/70">
          Verified incidents near you. Locations are approximate.
        </p>
      </div>

      <div className="h-[min(70dvh,560px)] min-h-[280px] sm:h-[calc(100dvh-13rem)] sm:min-h-[420px]">
        <CommunityMap />
      </div>
    </div>
  );
}
