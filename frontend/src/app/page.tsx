import { Pillars } from '@/components/landing/pillars';
import { NavBar } from '@/components/nav-bar';
import { SiteFooter } from '@/components/site-footer';

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main id="main">
        <Pillars />
      </main>
      <SiteFooter />
    </>
  );
}
