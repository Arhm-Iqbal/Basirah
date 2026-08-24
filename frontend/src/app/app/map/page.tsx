import type { Metadata } from 'next';

import { CommunityMap } from '@/components/community-map';
import { MapAddMosque } from '@/components/map-add-mosque';

export const metadata: Metadata = {
  title: 'My community · Basirah',
};

export default function MapPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-basirah-teal">
          My community
        </h1>
        <p className="mt-1 max-w-2xl text-base text-basirah-teal">Your mosques near you.</p>
      </div>

      <MapAddMosque />

      <div className="h-[min(70dvh,560px)] min-h-[280px] sm:h-[calc(100dvh-13rem)] sm:min-h-[420px]">
        <CommunityMap />
      </div>
    </div>
  );
}
