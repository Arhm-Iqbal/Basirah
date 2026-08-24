import { NavBar } from '@/components/nav-bar';

export function MarketingPage({
  children,
  className = 'mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <NavBar />
      <main className={className}>{children}</main>
    </>
  );
}
