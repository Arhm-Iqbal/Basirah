import { CommunityMap } from '@/components/community-map';
import { NavBar } from '@/components/nav-bar';

export const metadata = { title: 'Community Map · Basirah' };

// Public by design. Mosques carry a public read policy, so someone can find
// their nearest mosque without first creating an account.
export default function PublicMapPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-basirah-cream">
      <NavBar />
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-6">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-basirah-teal sm:text-[2rem]">
          Community map
        </h1>
        <p className="mt-1.5 text-base text-basirah-teal">Mosques currently listed near you.</p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-basirah-teal/65">
          Listings come from OpenStreetMap and community submissions and may be incomplete. Verify
          details before relying on them. Current coverage is strongest in Edmonton and the Greater
          Toronto Area.
        </p>
        <div className="mt-4 min-h-[280px] flex-1">
          <CommunityMap />
        </div>
      </main>
    </div>
  );
}
