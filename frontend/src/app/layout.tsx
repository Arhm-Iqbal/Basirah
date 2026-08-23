import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Basirah',
  description: 'Community security infrastructure for Canadian mosques.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
