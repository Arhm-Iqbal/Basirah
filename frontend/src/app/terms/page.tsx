import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/page-placeholder';

export const metadata: Metadata = {
  title: 'Terms',
};

export default function TermsPage() {
  return <PagePlaceholder title="Terms" />;
}
