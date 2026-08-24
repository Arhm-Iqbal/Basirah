import { CommunityDirectory } from '@/components/community-directory';

export const metadata = {
  title: 'Resources · Basirah',
  description:
    'A directory of Muslim-owned and halal businesses, health professionals, and lawyers in Edmonton.',
};

export default function AppResourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="sr-only">Resources</h1>
      <CommunityDirectory />
    </div>
  );
}
