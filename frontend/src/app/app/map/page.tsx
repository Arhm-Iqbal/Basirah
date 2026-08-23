import type { Metadata } from 'next';

import { CommunityMap } from '@/components/community-map';

export const metadata: Metadata = {
  title: 'Map · Basirah',
};

export default function MapPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-basirah-teal">Community map</h1>
        <p className="mt-1 max-w-2xl text-sm text-basirah-teal/70">
          Mosques near you, alongside incidents that have been verified. Incident locations are
          approximate and nothing here identifies who reported them.
        </p>
      </div>

      <div className="h-[calc(100dvh-13rem)] min-h-[420px]">
        <CommunityMap />
      </div>
    </div>
  );
}
