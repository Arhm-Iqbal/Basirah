import { Briefcase, Gavel, Stethoscope, Store } from 'lucide-react';

import { ResourceDirectoryTrigger } from '@/components/resources/resource-directory-trigger';
import {
  BUSINESSES,
  DIRECTORY_COMPILED,
  HEALTH_PROFESSIONALS,
  LAWYERS,
} from '@/data/community-directory';

export const metadata = {
  title: 'Resources · Basirah',
  description:
    'A directory of Muslim-owned and halal businesses, health professionals, and lawyers in Edmonton.',
};

const SUMMARY = [
  { icon: Store, label: 'Businesses', count: BUSINESSES.length },
  { icon: Stethoscope, label: 'Health professionals', count: HEALTH_PROFESSIONALS.length },
  { icon: Gavel, label: 'Lawyers', count: LAWYERS.length },
];

export default function AppResourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-basirah-teal sm:text-[2rem]">
        Edmonton community directory
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-basirah-teal">
        Muslim-owned and halal businesses, health professionals, and lawyers, gathered in one place.
        Open the directory and choose where you want to start.
      </p>

      <div className="mt-6">
        <ResourceDirectoryTrigger label="Open the directory" />
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {SUMMARY.map(({ icon: Icon, label, count }) => (
          <li key={label} className="rounded-lg border border-basirah-teal/20 bg-white p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-basirah-cream text-basirah-rust">
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="mt-4 font-display text-3xl font-semibold tabular-nums text-basirah-teal">
              {count}
            </p>
            <p className="mt-1 text-sm font-medium text-basirah-teal/70">{label}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-start gap-3 rounded-lg bg-basirah-cyan p-5">
        <Briefcase className="mt-0.5 size-5 shrink-0 text-basirah-teal" aria-hidden />
        <p className="text-sm leading-relaxed text-basirah-teal/80">
          Compiled {DIRECTORY_COMPILED} from public sources only. Every entry records the evidence
          it rests on. Religion was never inferred from a name, and a halal certification is not the
          same as confirmed Muslim ownership. Please verify details before relying on any listing.
        </p>
      </div>
    </div>
  );
}
