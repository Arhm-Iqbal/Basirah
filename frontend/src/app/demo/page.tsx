import type { Metadata } from 'next';

import { DemoProfile } from '@/components/demo-profile';
import { MarketingPage } from '@/components/marketing-page';

export const metadata: Metadata = {
  title: 'Demo profile · Basirah',
  description: 'A read-only sample Basirah profile for reviewers.',
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <MarketingPage className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <DemoProfile />
    </MarketingPage>
  );
}
