import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Basirah',
    template: '%s | Basirah',
  },
  description: 'Community safety and support for Canadian Muslims.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="border-ink/10 mt-16 border-t bg-white">
          <div className="text-ink/70 mx-auto max-w-6xl px-6 py-8 text-xs leading-relaxed">
            <p>
              Basirah is a prototype built for a hackathon. Reports submitted through this version
              are not stored or sent anywhere. Only provide information you are comfortable
              submitting.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
