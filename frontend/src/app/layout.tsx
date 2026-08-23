import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

/*
 * Creato Display ships no 600 weight, so `font-semibold` resolves upward to Bold by the CSS
 * font-matching rules. Weights are listed here only where a real file exists.
 */
const creatoDisplay = localFont({
  src: [
    { path: '../fonts/CreatoDisplay-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/CreatoDisplay-Medium.otf', weight: '500', style: 'normal' },
    { path: '../fonts/CreatoDisplay-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-creato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Basirah',
    template: '%s | Basirah',
  },
  description: 'Community safety and support for Canadian Muslims.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={creatoDisplay.variable}>
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
