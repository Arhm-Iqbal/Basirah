import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/page-placeholder';

export const metadata: Metadata = {
  title: 'Privacy',
};

export default function PrivacyPage() {
  return <PagePlaceholder title="Privacy" />;
}
