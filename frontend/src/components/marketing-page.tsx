import { NavBar } from '@/components/nav-bar';

export function MarketingPage({
  children,
  className = 'mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20',
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
