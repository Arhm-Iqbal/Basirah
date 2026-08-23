import { CommunityMap } from '@/components/community-map';
import { NavBar } from '@/components/nav-bar';

export const metadata = { title: 'Community Map · Basirah' };

// Public by design. Everything this reads is already anon-readable: mosques carry a
// public read policy, and incidents_map exposes only verified, coarsened points. Someone
// should be able to find their nearest mosque without first creating an account.
export default function PublicMapPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal">Community map</h1>
        <p className="mt-2 text-sm text-basirah-teal/70">
          Mosques near you, and incidents that a person has verified. Unverified reports never
          appear here.
        </p>
        <div className="mt-6 h-[calc(100dvh-16rem)] min-h-[440px]">
          <CommunityMap />
        </div>
      </main>
    </>
  );
}
