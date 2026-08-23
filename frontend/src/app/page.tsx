import { GetStarted } from '@/components/get-started';
import { Hero } from '@/components/hero';
import { NavBar } from '@/components/nav-bar';

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <GetStarted />
      </main>
    </>
  );
}
