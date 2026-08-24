import { CommunityMap } from '@/components/community-map';
import { NavBar } from '@/components/nav-bar';

export const metadata = { title: 'Community Map · Basirah' };

// Public by design. Mosques carry a public read policy, so someone can find
// their nearest mosque without first creating an account.
export default function PublicMapPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-basirah-teal sm:text-[2rem]">
          Community map
        </h1>
        <p className="mt-1.5 text-base text-basirah-teal">Mosques near you.</p>
        <div className="mt-4 h-[calc(100dvh-14rem)] min-h-[440px]">
          <CommunityMap />
        </div>
      </main>
    </>
  );
}
