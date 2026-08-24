import { Community } from '@/components/landing/community';
import { FinalCta } from '@/components/landing/final-cta';
import { Hero } from '@/components/landing/hero';
import { Insights } from '@/components/landing/insights';
import { Pillars } from '@/components/landing/pillars';
import { Principles } from '@/components/landing/principles';
import { Reporting } from '@/components/landing/reporting';
import { Support } from '@/components/landing/support';
import { NavBar } from '@/components/nav-bar';
import { SiteFooter } from '@/components/site-footer';

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main id="main">
        <Hero />
        <Pillars />
        <Reporting />
        <Support />
        <Community />
        <Insights />
        <Principles />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
