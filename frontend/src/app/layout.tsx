import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const creatoDisplay = localFont({
  src: [
    { path: '../fonts/creato-display/CreatoDisplay-Thin.otf', weight: '100', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-Light.otf', weight: '300', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-Medium.otf', weight: '500', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-Bold.otf', weight: '700', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-ExtraBold.otf', weight: '800', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-creato-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Basirah',
    template: '%s | Basirah',
  },
  description: 'Community security infrastructure for Canadian Muslims.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={creatoDisplay.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
