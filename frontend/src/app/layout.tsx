import type { Metadata, Viewport } from 'next';
import { Noto_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const creatoDisplay = localFont({
  src: [
    { path: '../fonts/creato-display/CreatoDisplay-Thin.otf', weight: '100', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-ThinItalic.otf', weight: '100', style: 'italic' },
    { path: '../fonts/creato-display/CreatoDisplay-Light.otf', weight: '300', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-LightItalic.otf', weight: '300', style: 'italic' },
    { path: '../fonts/creato-display/CreatoDisplay-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: '../fonts/creato-display/CreatoDisplay-Medium.otf', weight: '500', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-MediumItalic.otf', weight: '500', style: 'italic' },
    { path: '../fonts/creato-display/CreatoDisplay-Bold.otf', weight: '700', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-BoldItalic.otf', weight: '700', style: 'italic' },
    { path: '../fonts/creato-display/CreatoDisplay-ExtraBold.otf', weight: '800', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-ExtraBoldItalic.otf', weight: '800', style: 'italic' },
    { path: '../fonts/creato-display/CreatoDisplay-Black.otf', weight: '900', style: 'normal' },
    { path: '../fonts/creato-display/CreatoDisplay-BlackItalic.otf', weight: '900', style: 'italic' },
  ],
  variable: '--font-creato-display',
  display: 'swap',
});

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Basirah',
  description: 'Community security infrastructure for Canadian Muslims.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${creatoDisplay.variable} ${notoSans.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
