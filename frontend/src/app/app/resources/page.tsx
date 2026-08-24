import { CommunityDirectory } from '@/components/community-directory';
import {
  BUSINESSES,
  DIRECTORY_COMPILED,
  HEALTH_PROFESSIONALS,
  LAWYERS,
} from '@/data/community-directory';

export const metadata = {
  title: 'Resources · Basirah',
  description:
    'A directory of Muslim-owned and halal businesses, health professionals, and lawyers in Edmonton.',
};

export default function AppResourcesPage() {
  const total = BUSINESSES.length + HEALTH_PROFESSIONALS.length + LAWYERS.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-basirah-teal sm:text-[2rem]">
        Edmonton community directory
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-basirah-teal">
        Muslim-owned and halal businesses, health professionals, and lawyers, gathered from public
        sources. Religion was never inferred from a name. Please verify details before relying on
        any listing.
      </p>
      <p className="mt-2 text-sm text-basirah-teal/65">
        {total} listings · compiled {DIRECTORY_COMPILED}
      </p>
      <div className="mt-8">
        <CommunityDirectory />
      </div>
    </div>
  );
}
