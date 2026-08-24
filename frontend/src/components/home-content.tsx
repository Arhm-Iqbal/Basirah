import { Hero } from '@/components/landing/hero';
import { Pillars } from '@/components/landing/pillars';
import { NavBar } from '@/components/nav-bar';
import { Reveal } from '@/components/reveal';
import { SiteFooter } from '@/components/site-footer';

export function HomeContent() {
  return (
    <>
      <NavBar />
      <main id="main">
        <Hero />
        <div className="relative isolate bg-basirah-cream">
          <div aria-hidden className="user-pages-bg is-local" />
          <div className="relative z-10">
            <Pillars />
          </div>
        </div>
      </main>
      <Reveal>
        <SiteFooter />
      </Reveal>
    </>
  );
}
