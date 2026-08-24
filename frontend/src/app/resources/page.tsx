import { CommunityDirectory } from '@/components/community-directory';
import { MarketingPage } from '@/components/marketing-page';

export const metadata = {
  title: 'Resources · Basirah',
  description:
    'A directory of Muslim-owned and halal businesses, health professionals, and lawyers in Edmonton.',
};

export default function ResourcesPage() {
  return (
    <MarketingPage className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="sr-only">Resources</h1>
      <CommunityDirectory />
    </MarketingPage>
  );
}
