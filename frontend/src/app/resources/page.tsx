import type { Metadata } from 'next';
import { Briefcase, Gavel, Stethoscope, Store } from 'lucide-react';

import { NavBar } from '@/components/nav-bar';
import { ResourceDirectoryTrigger } from '@/components/resources/ResourceDirectoryTrigger';
import { SiteFooter } from '@/components/site-footer';
import {
  BUSINESSES,
  DIRECTORY_COMPILED,
  HEALTH_PROFESSIONALS,
  LAWYERS,
} from '@/data/community-directory';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'A directory of Muslim-owned and halal businesses, health professionals, and lawyers in Edmonton.',
};

const SUMMARY = [
  { icon: Store, label: 'Businesses', count: BUSINESSES.length },
  { icon: Stethoscope, label: 'Health professionals', count: HEALTH_PROFESSIONALS.length },
  { icon: Gavel, label: 'Lawyers', count: LAWYERS.length },
];

export default function ResourcesPage() {
  return (
    <>
      <NavBar />
      <main id="main">
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <div className="max-w-2xl">
              <h1 className="text-3xl leading-tight font-semibold tracking-tight text-basirah-teal sm:text-5xl">
                The Edmonton community directory.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-basirah-teal/70">
                Muslim-owned and halal businesses, health professionals, and lawyers, gathered in
                one place. Open the directory and choose where you want to start.
              </p>
              <div className="mt-10">
                <ResourceDirectoryTrigger label="Open the directory" />
              </div>
            </div>

            <ul className="mt-16 grid gap-4 sm:grid-cols-3">
              {SUMMARY.map(({ icon: Icon, label, count }) => (
                <li key={label} className="rounded-3xl bg-basirah-cream p-8">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-basirah-rust">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-6 text-3xl font-semibold text-basirah-teal">{count}</p>
                  <p className="mt-1 text-sm font-medium text-basirah-teal/70">{label}</p>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex items-start gap-3 rounded-3xl bg-basirah-cyan p-8">
              <Briefcase className="mt-0.5 size-5 shrink-0 text-basirah-teal" aria-hidden />
              <p className="text-sm leading-relaxed text-basirah-teal/80">
                Compiled {DIRECTORY_COMPILED} from public sources only. Every entry records the
                evidence it rests on. Religion was never inferred from a name, and a halal
                certification is not the same as confirmed Muslim ownership. Please verify details
                before relying on any listing.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
