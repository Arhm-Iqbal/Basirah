import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/page-placeholder';

export const metadata: Metadata = {
  title: 'Your Profile',
};

export default function ProfilePage() {
  return <PagePlaceholder title="Your Profile" />;
}
