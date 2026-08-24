import { NavBar } from '@/components/nav-bar';
import { SiteFooter } from '@/components/site-footer';

export function MarketingPage({
  children,
  className = 'mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative isolate min-h-dvh bg-basirah-cream">
      <div aria-hidden className="user-pages-bg" />
      <NavBar />
      <main className={`relative z-10 ${className}`}>{children}</main>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
